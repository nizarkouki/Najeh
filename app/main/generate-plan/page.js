'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_OFFSETS_FROM_MONDAY = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

function getCurrentWeekStartMonday() {
  const today = new Date()
  const day = today.getDay()
  const daysSinceMonday = (day + 6) % 7
  const weekStart = new Date(today)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - daysSinceMonday)
  return weekStart
}

function getRemainingDaysOfWeek() {
  const today = new Date()
  const remainingDays = {}
  const daysUntilSunday = (7 - today.getDay()) % 7

  for (let i = 0; i <= daysUntilSunday; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const day = DAYS_OF_WEEK[date.getDay()]
    remainingDays[day] = 0
  }
  return remainingDays
}

function GuidancePanel({ guidance }) {
  const quickTips = guidance?.quickTips ?? []
  const focusNotes = guidance?.focusNotes ?? []
  const sessionSwapSuggestions = guidance?.sessionSwapSuggestions ?? []

  if (!quickTips.length && !focusNotes.length && !sessionSwapSuggestions.length) {
    return null
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {quickTips.length > 0 && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Quick Tips</p>
          <ul className="mt-3 space-y-2 text-sm text-sky-900 dark:text-sky-100">
            {quickTips.slice(0, 4).map((tip, index) => (
              <li key={`${tip}-${index}`} className="flex gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-sky-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {focusNotes.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Focus Notes</p>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900 dark:text-emerald-100">
            {focusNotes.slice(0, 4).map((note, index) => (
              <li key={`${note}-${index}`} className="flex gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sessionSwapSuggestions.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Swap Ideas</p>
          <div className="mt-3 space-y-3 text-sm text-amber-900 dark:text-amber-100">
            {sessionSwapSuggestions.slice(0, 3).map((suggestion, index) => (
              <div key={`${suggestion.day || 'swap'}-${index}`} className="rounded-lg border border-amber-200 bg-white/80 p-3 dark:border-amber-900/50 dark:bg-amber-950/40">
                <p className="font-semibold">
                  {suggestion.day || 'Flexible swap'}{suggestion.session ? ` · Session ${suggestion.session}` : ''}
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-200">
                  {suggestion.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GeneratePlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryPlanId = searchParams.get('planId')
  const supabase = useMemo(() => createClient(), [])
  const { showToast } = useToast()

  const [planName, setPlanName] = useState('')
  const [planStatus, setPlanStatus] = useState('active')
  const [selectedPlan, setSelectedPlan] = useState(queryPlanId || null)
  const [subjects, setSubjects] = useState([])
  
  const [weekDaysWithHours, setWeekDaysWithHours] = useState(getRemainingDaysOfWeek())
  const [generating, setGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedPlan, setEditedPlan] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isGenerationBlocked, setIsGenerationBlocked] = useState(false)
  const [blockedUntilLabel, setBlockedUntilLabel] = useState('')

  // Load current plan details on mount
  useEffect(() => {
    const loadPlanDetails = async () => {
      if (!selectedPlan) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: planData } = await supabase
        .from('plans')
        .select('id, name, status')
        .eq('id', selectedPlan)
        .eq('user_id', user.id)
        .single()

      if (planData) {
        setPlanName(planData.name)
        setPlanStatus(planData.status || 'active')
      }
    }

    loadPlanDetails()
  }, [selectedPlan, supabase])

  // Load subjects when plan is selected
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedPlan) return

      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, coefficient')
        .eq('plan_id', selectedPlan)

      setSubjects(subjectsData ?? [])
    }

    loadSubjects()
  }, [selectedPlan, supabase])

  // Check if current week plan is locked (block generate/regenerate until next Monday)
  useEffect(() => {
    const checkGenerationLock = async () => {
      if (!selectedPlan) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const weekStart = getCurrentWeekStartMonday()
      const weekStartDateStr = weekStart.toISOString().split('T')[0]

      const { data: existingPlan } = await supabase
        .from('weekly_plans')
        .select('id, is_locked, weekly_plan_days(id), weekly_plan_sessions(id)')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDateStr)
        .maybeSingle()

      const hasGeneratedContent =
        (existingPlan?.weekly_plan_days?.length ?? 0) > 0 ||
        (existingPlan?.weekly_plan_sessions?.length ?? 0) > 0

      if (existingPlan?.is_locked && hasGeneratedContent) {
        const nextMonday = new Date(weekStart)
        nextMonday.setDate(nextMonday.getDate() + 7)
        const label = nextMonday.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })

        setIsGenerationBlocked(true)
        setBlockedUntilLabel(label)
        setPreviewMode(false)
        setGeneratedPlan(null)
        setEditedPlan(null)
      } else {
        setIsGenerationBlocked(false)
        setBlockedUntilLabel('')
      }
    }

    checkGenerationLock()
  }, [selectedPlan, supabase])

  const handleDayHoursChange = (day, hours) => {
    setWeekDaysWithHours((prev) => ({
      ...prev,
      [day]: Math.max(0, Number(hours)),
    }))
  }

  const hasSelectedDays = Object.values(weekDaysWithHours).some((h) => h > 0)

  const handleGenerate = async () => {
    if (isGenerationBlocked) {
      showToast(`This weekly plan is locked. You can generate a new plan on ${blockedUntilLabel || 'next Monday'}.`, 'warning')
      return
    }

    if (!selectedPlan) {
      showToast('Please select a plan', 'warning')
      return
    }

    if (planStatus === 'inactive') {
      showToast('This plan is inactive and cannot generate a weekly schedule.', 'warning')
      return
    }

    if (!hasSelectedDays) {
      showToast('Please select at least one day with hours', 'warning')
      return
    }

    if (subjects.length === 0) {
      showToast('This plan has no subjects to generate a schedule for', 'warning')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          weekDaysWithHours: Object.fromEntries(
            Object.entries(weekDaysWithHours).filter(([_, hours]) => hours > 0)
          ),
          subjects,
        }),
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: 'Server error. Please refresh and try again.' }

      if (!response.ok) {
        showToast(data.error || 'Failed to generate plan', 'error')
        setGenerating(false)
        return
      }

      setGeneratedPlan(data.plan)
      setEditedPlan(JSON.parse(JSON.stringify(data.plan)))
      setPreviewMode(true)
    } catch (err) {
      showToast(err.message || 'Failed to generate plan', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerateClick = async () => {
    if (isGenerationBlocked) {
      showToast(`This weekly plan is locked. You can generate a new plan on ${blockedUntilLabel || 'next Monday'}.`, 'warning')
      return
    }

    setPreviewMode(false)
    setEditMode(false)
    setGeneratedPlan(null)
    setEditedPlan(null)
    await handleGenerate()
  }

  const handleSavePlan = async () => {
    if (!selectedPlan || !editedPlan) return

    if (planStatus === 'inactive') {
      showToast('This plan is inactive and cannot save a weekly schedule.', 'warning')
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('Not authenticated', 'error')
        setSaving(false)
        return
      }

      const selectedDaysWithHours = Object.entries(weekDaysWithHours).filter(([_, hours]) => hours > 0)
      
      // Calculate week_start_date (Monday of current week)
      const weekStart = getCurrentWeekStartMonday()
      const weekStartDateStr = weekStart.toISOString().split('T')[0]
      
      // Check if a weekly plan already exists for this plan and week
      const { data: existingPlan } = await supabase
        .from('weekly_plans')
        .select('id, is_locked, weekly_plan_days(id), weekly_plan_sessions(id)')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDateStr)
        .maybeSingle()

      const hasGeneratedContent =
        (existingPlan?.weekly_plan_days?.length ?? 0) > 0 ||
        (existingPlan?.weekly_plan_sessions?.length ?? 0) > 0

      if (existingPlan) {
        if (existingPlan.is_locked && hasGeneratedContent) {
          const nextMonday = new Date(weekStart)
          nextMonday.setDate(nextMonday.getDate() + 7)
          const nextMondayLabel = nextMonday.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })
          showToast(`This weekly plan is locked. You can generate a new plan on ${nextMondayLabel}.`, 'warning')
          setSaving(false)
          return
        }
        // Delete the existing unlocked plan so we can create a new one
        await supabase.from('weekly_plans').delete().eq('id', existingPlan.id)
      }
      
      // Create weekly plan
      const { data: weeklyPlan, error: weeklyPlanError } = await supabase
        .from('weekly_plans')
        .insert({
          user_id: user.id,
          plan_id: selectedPlan,
          week_start_date: weekStartDateStr,
          is_locked: false,
        })
        .select('id')
        .single()

      if (weeklyPlanError) {
        showToast(`Failed to create weekly plan: ${weeklyPlanError.message}`, 'error')
        setSaving(false)
        return
      }

      // Create weekly plan days with actual dates
      const daysPayload = []
      
      for (const [dayName, hours] of selectedDaysWithHours) {
        const dayOffset = DAY_OFFSETS_FROM_MONDAY[dayName]
        if (dayOffset === undefined) continue
        
        const dayDate = new Date(weekStart)
        dayDate.setDate(dayDate.getDate() + dayOffset)
        const dayDateStr = dayDate.toISOString().split('T')[0]
        
        daysPayload.push({
          weekly_plan_id: weeklyPlan.id,
          user_id: user.id,
          day_date: dayDateStr,
          is_day_off: false,
          target_minutes: hours * 60,
        })
      }

      const { error: daysError } = await supabase
        .from('weekly_plan_days')
        .insert(daysPayload)

      if (daysError) {
        await supabase.from('weekly_plans').delete().eq('id', weeklyPlan.id)
        showToast(`Failed to create plan days: ${daysError.message}`, 'error')
        setSaving(false)
        return
      }

      // Get the created weekly_plan_days
      const { data: weekPlanDays } = await supabase
        .from('weekly_plan_days')
        .select('id, day_date')
        .eq('weekly_plan_id', weeklyPlan.id)

      const dayDateMap = {}
      weekPlanDays?.forEach(d => {
        dayDateMap[d.day_date] = d.id
      })

      // Create sessions from generated plan
      const sessionsPayload = []
      const dailyPlan = editedPlan.dailyBreakdown || {}

      for (const [dayName, dayData] of Object.entries(dailyPlan)) {
        const dayOffset = DAY_OFFSETS_FROM_MONDAY[dayName]
        if (dayOffset === undefined) continue
        
        const dayDate = new Date(weekStart)
        dayDate.setDate(dayDate.getDate() + dayOffset)
        const dayDateStr = dayDate.toISOString().split('T')[0]
        const weeklyPlanDayId = dayDateMap[dayDateStr]

        if (!weeklyPlanDayId) continue

        let orderInDay = 1
        dayData.sessions?.forEach((session) => {
          const subject = subjects.find(s => s.name === session.subject)
          if (subject) {
            sessionsPayload.push({
              weekly_plan_id: weeklyPlan.id,
              weekly_plan_day_id: weeklyPlanDayId,
              user_id: user.id,
              plan_id: selectedPlan,
              subject_id: subject.id,
              scheduled_date: dayDateStr,
              planned_minutes: session.duration,
              order_in_day: orderInDay,
              status: 'pending',
            })
            orderInDay++
          }
        })
      }

      if (sessionsPayload.length > 0) {
        const { error: sessionsError } = await supabase
          .from('weekly_plan_sessions')
          .insert(sessionsPayload)

        if (sessionsError) {
          console.error('Sessions insertion error:', sessionsError)
          showToast(`Warning: Could not save study sessions: ${sessionsError.message}`, 'warning')
        }
      } else {
        console.warn('No valid sessions to insert - subjects not found in plan')
        showToast('Warning: No study sessions were created. Check that all subjects exist in the plan.', 'warning')
      }

      showToast('Weekly plan saved successfully!', 'success')
      setPreviewMode(false)
      setEditMode(false)
      setGeneratedPlan(null)
      setEditedPlan(null)
      setWeekDaysWithHours(getRemainingDaysOfWeek())
      
      setTimeout(() => {
        router.push(`/main/plans/${selectedPlan}`)
      }, 1500)
    } catch (err) {
      showToast(err.message || 'Failed to save plan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Generate Weekly Plan</h2>
        {queryPlanId && (
          <Link href={`/main/plans/${queryPlanId}`} className="text-s text-amber-600 hover:text-amber-700 dark:text-amber-400">
            ← Back to Plan
          </Link>
        )}
      </div>

      {isGenerationBlocked && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          This weekly plan is locked. You can generate again on {blockedUntilLabel || 'next Monday'}.
        </p>
      )}

      {!previewMode ? (
        <div className="mt-6 space-y-6">
          {/* Plan Display */}
          {selectedPlan && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-100">Current Plan</p>
              <p className="mt-1 text-lg font-semibold text-amber-800 dark:text-amber-200">
                {planName || 'Loading...'}
              </p>
            </div>
          )}

          {/* Subjects Display */}
          {selectedPlan && subjects.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Subjects ({subjects.length})</p>
              <div className="grid gap-2">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/50"
                  >
                    <span>{subject.name}</span>
                    <span className="text-xs text-zinc-500">coef: {subject.coefficient}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Days and Hours Selection */}
          {selectedPlan && (
            <div>
              <p className="mb-3 text-sm font-medium">Available study hours per day</p>
              <div className="space-y-2">
                {Object.entries(weekDaysWithHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-3">
                    <label className="w-20 text-sm font-medium">{day}</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={hours}
                      onChange={(e) => handleDayHoursChange(day, e.target.value)}
                      disabled={isGenerationBlocked}
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950"
                      placeholder="Hours"
                    />
                    <span className="w-12 text-sm text-zinc-500">hours</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          {selectedPlan && (
            <button
              onClick={handleGenerate}
              disabled={generating || !hasSelectedDays || isGenerationBlocked}
              className="w-full cursor-pointer rounded-xl bg-[linear-gradient(130deg,#ea580c,#f59e0b)] px-4 py-2 font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerationBlocked
                ? `Plan locked until ${blockedUntilLabel || 'next Monday'}`
                : generating
                  ? 'Generating...(this could take some time)'
                  : 'Generate Plan with AI'}
            </button>
          )}
        </div>
      ) : (
        /* Preview Mode */
        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">Plan Summary</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {editedPlan?.summary}
            </p>
            {editedPlan?.distribution && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                {editedPlan.distribution}
              </p>
            )}
          </div>

          {/* Daily Breakdown */}
          <div>
            <h3 className="mb-3 font-semibold">Daily Schedule</h3>
            <div className="space-y-3">
              {Object.entries(editedPlan?.dailyBreakdown || {}).map(([day, dayData]) => (
                <div key={day} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold text-base">{day}</p>
                    <span className="text-xs font-medium text-zinc-500">
                      {dayData.totalMinutes} min total
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayData.sessions?.map((session, idx) => (
                      <div key={idx} className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-amber-900 dark:text-amber-100">
                              {session.subject}
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Coefficient: {session.coefficient}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                            {session.duration} min
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-amber-800 dark:text-amber-200">
                          {session.description}
                        </p>
                        <div className="rounded border border-amber-300 bg-white p-2 dark:border-amber-800 dark:bg-amber-950/50">
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            📚 Pomodoro: {session.pomodoro.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidance */}
          <GuidancePanel guidance={editedPlan?.guidance || editedPlan?.notes} />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRegenerateClick}
              disabled={generating || saving || isGenerationBlocked}
              className="flex-1 cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Regenerate
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {editMode ? 'Done Editing' : 'Edit'}
            </button>
            <button
              onClick={handleSavePlan}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Accept & Save'}
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => {
              setPreviewMode(false)
              setEditMode(false)
              setGeneratedPlan(null)
              setEditedPlan(null)
            }}
            className="w-full cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}
