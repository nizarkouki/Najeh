import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: weekTotals } = await supabase
    .from('study_sessions')
    .select('actual_minutes')
    .eq('user_id', user.id)
    .gte('started_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString())

  const totalMinutes = (weekTotals || []).reduce((s, r) => s + (r.actual_minutes || 0), 0)

  const { data: subjectDist } = await supabase
    .from('study_sessions')
    .select('actual_minutes, weekly_plan_session_id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .limit(1000)

  const subjectMap = {}
  for (const row of subjectDist || []) {
    if (!row.weekly_plan_session_id) continue
    const { data: wps } = await supabase.from('weekly_plan_sessions').select('subject_id').eq('id', row.weekly_plan_session_id).single()
    if (!wps) continue
    subjectMap[wps.subject_id] = (subjectMap[wps.subject_id] || 0) + (row.actual_minutes || 0)
  }

  const subjectEntries = []
  for (const subjectId of Object.keys(subjectMap)) {
    const { data: subj } = await supabase.from('subjects').select('name').eq('id', subjectId).single()
    subjectEntries.push({ subject: subj?.name || 'Unknown', minutes: subjectMap[subjectId] })
  }

  const { data: streakRow } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle()

  return Response.json({
    week_minutes: totalMinutes,
    subjects: subjectEntries,
    streak: {
      current_streak: streakRow?.current_streak || 0,
      longest_streak: streakRow?.longest_streak || 0,
      last_active_date: streakRow?.last_active_date || null,
    },
  })
}
