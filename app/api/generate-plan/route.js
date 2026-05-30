import { generatePlanJson } from '@/lib/gemini'
import { calculatePomodoroTimes } from '@/lib/pomodoro'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function extractJsonPayload(rawText) {
  const trimmed = (rawText || '').trim()

  // Handle markdown code fences if the model wraps JSON unexpectedly.
  if (trimmed.startsWith('```')) {
    const withoutFenceStart = trimmed.replace(/^```(?:json)?\s*/i, '')
    return withoutFenceStart.replace(/\s*```$/, '').trim()
  }

  return trimmed
}

function normalizeGuidance(guidance) {
  if (!guidance) {
    return {
      quickTips: [],
      sessionSwapSuggestions: [],
      focusNotes: [],
    }
  }

  if (typeof guidance === 'string') {
    return {
      quickTips: guidance
        .split(/\n+/)
        .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean),
      sessionSwapSuggestions: [],
      focusNotes: [],
    }
  }

  return {
    quickTips: Array.isArray(guidance.quickTips) ? guidance.quickTips.filter(Boolean) : [],
    sessionSwapSuggestions: Array.isArray(guidance.sessionSwapSuggestions)
      ? guidance.sessionSwapSuggestions.filter(Boolean)
      : [],
    focusNotes: Array.isArray(guidance.focusNotes) ? guidance.focusNotes.filter(Boolean) : [],
  }
}

export async function POST(request) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, weekDaysWithHours, subjects } = await request.json()

    if (!planId || !weekDaysWithHours || !subjects || subjects.length === 0) {
      return Response.json(
        { error: 'Missing required parameters: planId, weekDaysWithHours, subjects' },
        { status: 400 }
      )
    }

    const { data: planRow, error: planRowError } = await supabase
      .from('plans')
      .select('id, status')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (planRowError || !planRow) {
      return Response.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (planRow.status === 'inactive') {
      return Response.json({ error: 'Inactive plans cannot generate weekly schedules.' }, { status: 400 })
    }

    // Format the prompt for Gemini with STRICT rules
    const daysText = Object.entries(weekDaysWithHours)
      .map(([day, hours]) => `${day}: ${hours} hours (${hours * 60} minutes)`)
      .join('\n')

    const subjectsText = subjects
      .map((s) => `${s.name} (coefficient: ${s.coefficient})`)
      .join('\n')

    const prompt = `You are an expert study planner. Create a DETAILED weekly study plan following STRICT rules.

Available study hours per day:
${daysText}

Subjects to study:
${subjectsText}

CRITICAL RULES (MUST FOLLOW):
1. HIGH PRIORITY RULE: Never assign TWO or more highest-coefficient subjects on the SAME day
2. Coefficient Distribution: Subjects with higher coefficients MUST receive proportionally MORE study time
3. Even Distribution: Spread subjects across the week so no day is overloaded
4. Every subject must appear AT LEAST once during the week
5. Fill each day completely up to its available time limit
6. Create realistic study sessions (30-120 minutes each)
7. Include natural breaks between sessions on the same day

Generate a JSON response with this EXACT structure:
{
  "summary": "Brief overview of the week's plan",
  "dailyBreakdown": {
    "Monday": {
      "totalMinutes": 240,
      "sessions": [
        {
          "subject": "subject name",
          "duration": 60,
          "coefficient": 7,
          "description": "What to study"
        }
      ]
    }
    ... (only include days with available hours)
  },
  "guidance": {
    "quickTips": ["Short tip 1", "Short tip 2", "Short tip 3"],
    "focusNotes": ["Short note about the week", "Short note about balance"],
    "sessionSwapSuggestions": [
      {
        "day": "Wednesday",
        "session": 3,
        "suggestion": "If you need more Info practice, replace this session with Info instead of Math."
      }
    ]
  }
}

Important: 
- totalMinutes on each day MUST equal the available hours × 60
- Only include days that have available study hours
- Ensure NO day has two or more highest-coefficient subjects
- Keep guidance short, concrete, and easy to scan. Prefer 2-4 short bullets per section.
- If two subjects have equal coefficients, keep the plan balanced but feel free to suggest a practical session swap when one subject needs more attention.
- Do not write long paragraphs. Each guidance line should be one concise sentence.
- Return ONLY valid JSON, no markdown or extra text`

    const responseText = await generatePlanJson(prompt)

    // Parse the JSON response
    let generatedPlan
    try {
      generatedPlan = JSON.parse(extractJsonPayload(responseText))
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText)
      return Response.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate the response has required structure
    if (!generatedPlan.dailyBreakdown) {
      return Response.json(
        { error: 'AI response missing daily breakdown. Please try again.' },
        { status: 500 }
      )
    }

    // Enhance each session with Pomodoro times
    const guidance = normalizeGuidance(generatedPlan.guidance ?? generatedPlan.notes)

    const enhancedPlan = {
      ...generatedPlan,
      guidance,
      dailyBreakdown: {},
    }

    for (const [day, dayData] of Object.entries(generatedPlan.dailyBreakdown)) {
      enhancedPlan.dailyBreakdown[day] = {
        totalMinutes: dayData.totalMinutes,
        sessions: dayData.sessions.map((session) => ({
          ...session,
          pomodoro: calculatePomodoroTimes(session.coefficient, session.duration),
        })),
      }
    }

    return Response.json({
      success: true,
      plan: enhancedPlan,
    })
  } catch (error) {
    console.error('Generate plan error:', error)
    return Response.json(
      { error: error.message || 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
