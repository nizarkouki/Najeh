'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function PlanDetailPage() {
  const params = useParams()
  const planId = params.planId
  const supabase = useMemo(() => createClient(), [])

  const [plan, setPlan] = useState(null)
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [locking, setLocking] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  const handleLockPlan = async () => {
    if (!weeklyPlan || isLocked) return

    setLocking(true)
    setActionError('')
    setNotice('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setActionError('Not authenticated')
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
        setActionError(`Failed to lock plan: ${lockError.message}`)
        setLocking(false)
        return
      }

      setIsLocked(true)
      setNotice('Plan locked. You can generate a new weekly plan next Monday.')
    } catch (err) {
      setActionError(err.message || 'Failed to lock plan')
    } finally {
      setLocking(false)
    }
  }

  useEffect(() => {
    const loadPlanDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load plan
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, name')
        .eq('id', planId)
        .eq('user_id', user.id)
        .single()

      if (planError) {
        setError('Plan not found')
        setLoading(false)
        return
      }

      setPlan(planData)

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

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
        <p className="text-red-700 dark:text-red-300">{error}</p>
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

        {actionError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">{actionError}</p>
          </div>
        )}

        {notice && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/30">
            <p className="text-sm text-green-700 dark:text-green-300">{notice}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isLocked && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Link href={`/main/generate-plan?planId=${planId}`} className="flex-1">
            <button className="w-full cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-medium text-white transition hover:bg-amber-600 dark:hover:bg-amber-500">
              ✨ Generate with AI
            </button>
          </Link>
          <button className="flex-1 cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            ✏️ Create Manually
          </button>
          <button
            onClick={handleLockPlan}
            disabled={!weeklyPlan || locking}
            className="flex-1 cursor-pointer rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
          >
            {locking ? 'Locking...' : '🔒 Lock Plan'}
          </button>
        </div>
      )}

      {/* Calendar View */}
      <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <h2 className="mb-4 text-lg font-semibold">Weekly Schedule</h2>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-zinc-600 dark:text-zinc-400">
              No weekly plan yet. {!isLocked && 'Generate or create one to get started!'}
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
