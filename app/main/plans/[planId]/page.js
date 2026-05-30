'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

export default function PlanDetailPage() {
  const params = useParams()
  const planId = params.planId
  const supabase = useMemo(() => createClient(), [])
  const todayDateKey = useMemo(() => getLocalDateKey(), [])
  const { showToast } = useToast()

  const [plan, setPlan] = useState(null)
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [isInactive, setIsInactive] = useState(false)
  const [locking, setLocking] = useState(false)
  const [inactivating, setInactivating] = useState(false)
  
  const router = useRouter()

  const handleMarkComplete = async (session) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('Not authenticated', 'error')
        return
      }

      const res = await fetch(`/api/weekly-sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      const json = await res.json()
      if (!res.ok) {
        showToast(json.error || 'Failed to mark session complete', 'error')
        return
      }

      setSessions((prev) => prev.map((s) => (s.id === session.id ? { ...s, status: 'completed' } : s)))
      window.dispatchEvent(
        new CustomEvent('streak-updated', {
          detail: {
            currentStreak: json?.streak?.current_streak,
          },
        })
      )
      const streakMessage = json?.streak?.current_streak != null
        ? `Session marked completed. Current streak: ${json.streak.current_streak}`
        : 'Session marked completed'
      showToast(streakMessage, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to mark session complete', 'error')
    }
  }

  

  const handleLockPlan = async () => {
    if (!weeklyPlan || isLocked || isInactive) return

    setLocking(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('Not authenticated', 'error')
        setLocking(false)
        return
      }

      const { error: lockError } = await supabase
        .from('weekly_plans')
        .update({
          is_locked: true,
          locked_at: new Date().toISOString(),
          lock_reason: 'session_started',
        })
        .eq('id', weeklyPlan.id)
        .eq('user_id', user.id)

      if (lockError) {
        showToast(`Failed to lock plan: ${lockError.message}`, 'error')
        setLocking(false)
        return
      }

      setIsLocked(true)
      showToast('Plan locked. You can generate a new weekly plan next Monday.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to lock plan', 'error')
    } finally {
      setLocking(false)
    }
  }

  const handleMarkInactive = async () => {
    if (isInactive) return

    setInactivating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('Not authenticated', 'error')
        setInactivating(false)
        return
      }

      const { error: updateError } = await supabase
        .from('plans')
        .update({
          status: 'inactive',
          inactive_at: new Date().toISOString(),
        })
        .eq('id', planId)
        .eq('user_id', user.id)

      if (updateError) {
        showToast(`Failed to mark plan inactive: ${updateError.message}`, 'error')
        return
      }

      setIsInactive(true)
      setPlan((current) => (current ? { ...current, status: 'inactive' } : current))
      showToast('Plan marked as completed. It cannot be activated again.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to mark plan inactive', 'error')
    } finally {
      setInactivating(false)
    }
  }

  useEffect(() => {
    const loadPlanDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load plan
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, name, status')
        .eq('id', planId)
        .eq('user_id', user.id)
        .single()

      if (planError) {
        setError('Plan not found')
        setLoading(false)
        return
      }

      setPlan(planData)
  setIsInactive(planData.status === 'inactive')

      // Load weekly plan
      const { data: weeklyData } = await supabase
        .from('weekly_plans')
        .select('id, is_locked, created_at')
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (weeklyData) {
        setWeeklyPlan(weeklyData)
        setIsLocked(weeklyData.is_locked)

        // Load sessions with their day and subject info
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('weekly_plan_sessions')
          .select('id, planned_minutes, status, order_in_day, scheduled_date, subject_id, subjects(name, coefficient), weekly_plan_days(day_date, target_minutes)')
          .eq('weekly_plan_id', weeklyData.id)
          .order('scheduled_date', { ascending: true })
          .order('order_in_day', { ascending: true })

        if (sessionsError) {
          console.error('Error loading sessions:', sessionsError)
        }

        setSessions(sessionsData ?? [])
      }

      setLoading(false)
    }

    loadPlanDetails()
  }, [planId, supabase])

  const sessionsByDay = useMemo(() => {
    const grouped = {}
    sessions.forEach((session) => {
      const dateStr = session.scheduled_date
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(session)
    })
    return grouped
  }, [sessions])

  const visibleDayEntries = useMemo(
    () => Object.entries(sessionsByDay).filter(([, daySessions]) => daySessions.length > 0),
    [sessionsByDay]
  )

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-64 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Link href="/main" className="text-s text-amber-600 hover:text-amber-700 dark:text-amber-400">
              ← Back to Plans
            </Link>
            <h1 className="mt-2 text-2xl font-bold">{plan?.name}</h1>
          </div>
          {isLocked && (
            <div className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 dark:bg-red-950/40">
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">🔒 Plan Locked</span>
            </div>
          )}
        </div>

        {isLocked && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">
              This weekly plan is locked and cannot be modified. You can generate again next Monday.
            </p>
          </div>
        )}

      </div>

      {/* Action Buttons */}
      {!isLocked && !isInactive && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Link href={`/main/generate-plan?planId=${planId}`} className="flex-1">
            <button className="w-full cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-medium text-white transition hover:bg-amber-600 dark:hover:bg-amber-500">
              ✨ Generate with AI
            </button>
          </Link>
          <div />
          <div />
        </div>
      )}

      {isInactive && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            This plan is completed and inactive. You cannot create or generate a weekly plan for it again.
          </p>
        </div>
      )}

      

      {/* Calendar View */}
      <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <h2 className="mb-4 text-lg font-semibold">Weekly Schedule</h2>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-zinc-600 dark:text-zinc-400">
              No weekly plan yet. {!isLocked && !isInactive && 'Generate or create one to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1" >
            {visibleDayEntries.map(([dateStr, daySessions]) => {

              const date = new Date(dateStr + 'T00:00:00')
              const dayName = DAYS_OF_WEEK[date.getDay()]
              const totalMinutes = daySessions.reduce((sum, s) => sum + s.planned_minutes, 0)
              const targetMinutes = daySessions[0]?.weekly_plan_day?.target_minutes || totalMinutes

              return (
                <div key={dateStr} className="w-full rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="mb-3 w-full flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{dayName}</h3>
                      <p className="text-xs text-zinc-500">{dateStr}</p>
                    </div>
                    <span className="text-xs font-medium text-zinc-500">
                      {totalMinutes}/{targetMinutes} min
                    </span>
                  </div>
                  <div className="space-y-2 w-full">
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`rounded border p-2 text-sm ${
                          session.status === 'completed'
                            ? 'border-green-300 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30'
                            : 'border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30'
                        }`}
                      >
                        <div className="flex items-start w-full justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{session.subjects?.name || 'Unknown Subject'}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {session.planned_minutes} min • Coef: {session.subjects?.coefficient || '—'}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              session.status === 'completed'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {session.status === 'completed' ? '✓' : '◯'}
                          </span>
                        </div>
                        {!isInactive && session.status !== 'completed' && getLocalDateKey(new Date(session.scheduled_date)) === todayDateKey && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => handleMarkComplete(session)}
                              className="cursor-pointer rounded bg-emerald-500 px-3 py-1 text-sm text-white transition-colors hover:bg-emerald-600"
                            >
                              Mark Complete
                            </button>
                          </div>
                        )}
                        </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
