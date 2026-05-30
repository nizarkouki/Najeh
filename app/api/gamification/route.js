import { createClient } from '@/lib/supabase/server'

function getDateKey(value) {
  if (!value) return null
  return new Date(value).toISOString().slice(0, 10)
}

function toMinutes(value) {
  return Number(value || 0)
}

function buildPerfectWeekStats(weeklyPlans) {
  let perfectWeeks = 0
  const monthMap = new Map()

  for (const weeklyPlan of weeklyPlans || []) {
    const days = weeklyPlan.weekly_plan_days || []
    const hasScheduledDays = days.length > 0
    const weekIsPerfect = hasScheduledDays && days.every((day) => toMinutes(day.completed_minutes) >= toMinutes(day.target_minutes))

    if (weekIsPerfect) {
      perfectWeeks += 1
    }

    const monthKey = (weeklyPlan.week_start_date || getDateKey(weeklyPlan.created_at) || '').slice(0, 7)
    if (!monthKey) continue

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { hasWeeks: false, allPerfect: true })
    }

    const monthEntry = monthMap.get(monthKey)
    monthEntry.hasWeeks = true
    monthEntry.allPerfect = monthEntry.allPerfect && weekIsPerfect
  }

  const flawlessMonths = Array.from(monthMap.values()).filter((entry) => entry.hasWeeks && entry.allPerfect).length

  return { perfectWeeks, flawlessMonths }
}

function buildComebackCount(distinctDates) {
  if (!distinctDates.length) return 0

  let count = 0
  for (let index = 1; index < distinctDates.length; index += 1) {
    const previous = new Date(`${distinctDates[index - 1]}T00:00:00Z`)
    const current = new Date(`${distinctDates[index]}T00:00:00Z`)
    const gapDays = Math.round((current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000))
    if (gapDays > 1) {
      count += 1
    }
  }

  return count
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: streakRow }, { data: completedSessions }, { data: weeklyPlans }, { count: inactivePlansCount }] = await Promise.all([
    supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('study_sessions')
      .select('actual_minutes, started_at, created_at')
      .eq('user_id', user.id)
      .eq('status', 'completed'),
    supabase
      .from('weekly_plans')
      .select('id, created_at, week_start_date, is_locked, weekly_plan_days(day_date, target_minutes, completed_minutes)')
      .eq('user_id', user.id),
    supabase
      .from('plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'inactive'),
  ])

  const sessions = completedSessions || []
  const totalMinutes = sessions.reduce((sum, session) => sum + toMinutes(session.actual_minutes), 0)
  const totalSessions = sessions.length
  const totalHours = totalMinutes / 60

  const distinctDates = Array.from(new Set(sessions.map((session) => getDateKey(session.started_at || session.created_at)).filter(Boolean))).sort()
  const noZeroDays = distinctDates.length
  const comebackCount = buildComebackCount(distinctDates)

  const earlySessions = sessions.filter((session) => {
    const startedAt = session.started_at || session.created_at
    if (!startedAt) return false
    return new Date(startedAt).getHours() < 8
  }).length

  const nightSessions = sessions.filter((session) => {
    const startedAt = session.started_at || session.created_at
    if (!startedAt) return false
    return new Date(startedAt).getHours() >= 22
  }).length

  const { perfectWeeks, flawlessMonths } = buildPerfectWeekStats(weeklyPlans || [])
  const adaptiveWeeks = (weeklyPlans || []).filter((plan) => plan.is_locked).length

  return Response.json({
    streak: {
      current_streak: streakRow?.current_streak || 0,
      longest_streak: streakRow?.longest_streak || 0,
      last_active_date: streakRow?.last_active_date || null,
    },
    stats: {
      totalHours,
      totalSessions,
      perfectWeeks,
      flawlessMonths,
      noZeroDays,
      plansFollowed: inactivePlansCount || 0,
      adaptiveWeeks,
      earlySessions,
      nightSessions,
      comebackCount,
    },
  })
}
