"use client"

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import PlanCard from '@/components/common/plan-card'
import { createClient } from '@/lib/supabase/client'

function mapPlanRowsToCards(planRows, subjectRows, weeklyPlansData, sessionStats) {
  const subjectCounts = subjectRows.reduce((acc, row) => {
    acc[row.plan_id] = (acc[row.plan_id] ?? 0) + 1
    return acc
  }, {})

  const weeklyGoalsByPlan = weeklyPlansData.reduce((acc, wp) => {
    if (!acc[wp.plan_id]) {
      acc[wp.plan_id] = 0
    }
    acc[wp.plan_id] += wp.total_minutes || 0
    return acc
  }, {})

  return planRows.map((plan) => {
    const stats = sessionStats[plan.id] || { completed: 0, total: 0 }
    const totalMinutes = weeklyGoalsByPlan[plan.id] || 0
    const hours = totalMinutes / 60
    const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

    return {
      id: plan.id,
      title: plan.name,
      subjects: subjectCounts[plan.id] ?? 0,
      weeklyGoal: `${hours.toFixed(1)}h`,
      progressPercent: Math.round(progress),
      sessionsCompleted: stats.completed,
      sessionsTotal: stats.total,
    }
  })
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-300/60 bg-zinc-200 p-5 dark:border-zinc-700/60 dark:bg-zinc-800">
      <div className="mb-3 h-4 w-3/4 rounded bg-zinc-300 dark:bg-zinc-700" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-zinc-300 dark:bg-zinc-700" />
        <div className="h-3 w-5/6 rounded bg-zinc-300 dark:bg-zinc-700" />
      </div>
    </div>
  )
}

export default function Main() {
  const supabase = useMemo(() => createClient(), [])

  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [creatingPlan, setCreatingPlan] = useState(false)

  const [planName, setPlanName] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [coefficient, setCoefficient] = useState('')
  const [subjects, setSubjects] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadPlans = async () => {
      setLoadingPlans(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setPlans([])
        setLoadingPlans(false)
        return
      }

      const { data: planRows, error: plansError } = await supabase
        .from('plans')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (plansError) {
        setError(plansError.message)
        setPlans([])
        setLoadingPlans(false)
        return
      }

      if (!planRows || planRows.length === 0) {
        setPlans([])
        setLoadingPlans(false)
        return
      }

      const planIds = planRows.map((p) => p.id)

      // Fetch subjects
      const { data: subjectRows, error: subjectsError } = await supabase
        .from('subjects')
        .select('plan_id')
        .in('plan_id', planIds)

      if (subjectsError) {
        setError(subjectsError.message)
        setPlans(mapPlanRowsToCards(planRows, [], [], {}))
        setLoadingPlans(false)
        return
      }

      // Fetch weekly plans with session data
      const { data: weeklyPlansRows, error: weeklyPlansError } = await supabase
        .from('weekly_plans')
        .select('id, plan_id, weekly_plan_days(target_minutes)')
        .in('plan_id', planIds)

      if (weeklyPlansError) {
        setError(weeklyPlansError.message)
        setPlans(mapPlanRowsToCards(planRows, subjectRows ?? [], [], {}))
        setLoadingPlans(false)
        return
      }

      // Calculate weekly goals and collect all weekly plan IDs
      const weeklyPlansData = []
      const weeklyPlanIds = []
      
      weeklyPlansRows?.forEach((wp) => {
        weeklyPlanIds.push(wp.id)
        const totalMinutes = wp.weekly_plan_days?.reduce((sum, day) => sum + (day.target_minutes || 0), 0) || 0
        weeklyPlansData.push({
          plan_id: wp.plan_id,
          total_minutes: totalMinutes,
        })
      })

      // Fetch study sessions and weekly plan sessions
      const sessionStats = {}
      planIds.forEach((id) => {
        sessionStats[id] = { completed: 0, total: 0 }
      })

      if (weeklyPlanIds.length > 0) {
        // Get all sessions for these weekly plans
        const { data: allSessions, error: sessionsError } = await supabase
          .from('weekly_plan_sessions')
          .select('id, weekly_plan_day(weekly_plan(plan_id)), study_sessions(status)')
          .in('weekly_plan_day.weekly_plan.id', weeklyPlanIds)

        // Note: The above query might not work perfectly with deep nesting, so let's try a different approach
        // Fetch sessions linked to the weekly plans
        const { data: studySessions, error: studyError } = await supabase
          .from('study_sessions')
          .select('id, status, weekly_plan_session(weekly_plan_day(weekly_plan(plan_id)))')
          .eq('user_id', user.id)

        if (!studyError && studySessions) {
          studySessions.forEach((session) => {
            try {
              const planId = session.weekly_plan_session?.weekly_plan_day?.weekly_plan?.plan_id
              if (planId && sessionStats[planId]) {
                sessionStats[planId].total += 1
                if (session.status === 'completed') {
                  sessionStats[planId].completed += 1
                }
              }
            } catch (e) {
              // Skip malformed data
            }
          })
        }
      }

      setPlans(
        mapPlanRowsToCards(planRows, subjectRows ?? [], weeklyPlansData, sessionStats)
      )
      setLoadingPlans(false)
    }

    loadPlans()
  }, [supabase])

  const canAddSubject = useMemo(() => {
    const value = Number(coefficient)
    return subjectName.trim().length > 0 && Number.isFinite(value) && value > 0
  }, [subjectName, coefficient])

  const resetForm = () => {
    setPlanName('')
    setSubjectName('')
    setCoefficient('')
    setSubjects([])
    setError('')
  }

  const handleClose = () => {
    if (creatingPlan) return
    setOpen(false)
    resetForm()
  }

  const handleAddSubject = () => {
    if (!canAddSubject) {
      setError('Subject name is required and coefficient must be greater than 0.')
      return
    }

    setSubjects((prev) => [
      ...prev,
      {
        name: subjectName.trim(),
        coefficient: Number(coefficient),
      },
    ])

    setSubjectName('')
    setCoefficient('')
    setError('')
  }

  const handleCreatePlan = async (event) => {
    event.preventDefault()

    if (!planName.trim()) {
      setError('Plan name is required.')
      return
    }

    if (subjects.length === 0) {
      setError('Add at least one subject before creating the plan.')
      return
    }

    setCreatingPlan(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be signed in to create a plan.')
      setCreatingPlan(false)
      return
    }

    const { data: insertedPlan, error: planInsertError } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        name: planName.trim(),
      })
      .select('id, name')
      .single()

    if (planInsertError || !insertedPlan) {
      setError(planInsertError?.message ?? 'Failed to create plan.')
      setCreatingPlan(false)
      return
    }

    const subjectPayload = subjects.map((item) => ({
      user_id: user.id,
      plan_id: insertedPlan.id,
      name: item.name,
      coefficient: item.coefficient,
    }))

    const { error: subjectInsertError } = await supabase
      .from('subjects')
      .insert(subjectPayload)

    if (subjectInsertError) {
      await supabase.from('plans').delete().eq('id', insertedPlan.id)
      setError(subjectInsertError.message)
      setCreatingPlan(false)
      return
    }

    setPlans((prev) => [
      {
        id: insertedPlan.id,
        title: insertedPlan.name,
        subjects: subjects.length,
        weeklyGoal: '0h',
        progressPercent: 0,
        sessionsCompleted: 0,
        sessionsTotal: 0,
      },
      ...prev,
    ])

    setCreatingPlan(false)
    handleClose()
  }

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be signed in to delete a plan.')
      return
    }

    // Delete subjects first (foreign key constraint)
    const { error: deleteSubjectsError } = await supabase
      .from('subjects')
      .delete()
      .eq('plan_id', planId)
      .eq('user_id', user.id)

    if (deleteSubjectsError) {
      setError(`Failed to delete subjects: ${deleteSubjectsError.message}`)
      return
    }

    // Delete the plan
    const { error: deletePlanError } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id)

    if (deletePlanError) {
      setError(`Failed to delete plan: ${deletePlanError.message}`)
      return
    }

    // Update UI
    setPlans((prev) => prev.filter((plan) => plan.id !== planId))
  }

  return (
    <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
      <h2 className="text-lg font-semibold">Your Plans</h2>

      {error && !open ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loadingPlans ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : null}

        {!loadingPlans && plans.map((plan) => (
          <PlanCard
            key={plan.id}
            id={plan.id}
            title={plan.title}
            subjects={plan.subjects}
            weeklyGoal={plan.weeklyGoal}
            progressPercent={plan.progressPercent}
            sessionsCompleted={plan.sessionsCompleted}
            sessionsTotal={plan.sessionsTotal}
            onDelete={handleDeletePlan}
          />
        ))}

        <div className="w-full">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group flex h-full min-h-60 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300/80 bg-[linear-gradient(145deg,rgba(255,255,255,.9),rgba(245,245,244,.8))] p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-lg dark:border-zinc-700/70 dark:bg-[linear-gradient(145deg,rgba(39,39,42,.85),rgba(24,24,27,.75))] dark:hover:border-amber-400/60"
            aria-label="Add plan"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(130deg,#ea580c,#f59e0b)] text-2xl font-semibold text-white shadow-[0_10px_24px_-10px_rgba(245,158,11,.75)] transition-transform duration-300 group-hover:scale-105">
              +
            </span>
            <p className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-100">
              Add New Plan
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create a personalized weekly study roadmap
            </p>
          </button>
        </div>
      </div>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-100 grid place-items-center bg-black/45 p-4" onClick={handleClose}>
              <div
                className="w-full max-w-lg rounded-2xl border border-zinc-300/70 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Create New Plan</h3>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="cursor-pointer rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Plan name</label>
                    <input
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950"
                      placeholder="e.g. Exams 2026"
                    />
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                    <p className="mb-3 text-sm font-medium">Add subjects</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <input
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        className="sm:col-span-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950"
                        placeholder="Subject name"
                      />
                      <input
                        value={coefficient}
                        onChange={(e) => setCoefficient(e.target.value)}
                        type="number"
                        min="0.0001"
                        step="any"
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950"
                        placeholder="Coefficient"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="cursor-pointer mt-3 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
                      disabled={!canAddSubject || creatingPlan}
                    >
                      Add subject
                    </button>

                    <div className="mt-3 space-y-1">
                      {subjects.map((item, idx) => (
                        <div
                          key={`${item.name}-${idx}`}
                          className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-1.5 text-xs dark:border-zinc-700"
                        >
                          <span>{item.name}</span>
                          <span className="font-semibold">coef: {item.coefficient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      {error}
                    </p>
                  ) : null}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="cursor-pointer rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      disabled={creatingPlan}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer rounded-xl bg-[linear-gradient(130deg,#ea580c,#f59e0b)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={creatingPlan}
                    >
                      {creatingPlan ? 'Creating...' : 'Create plan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
