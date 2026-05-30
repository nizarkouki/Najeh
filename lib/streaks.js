function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDateKey(dateKey, offsetDays) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setDate(date.getDate() + offsetDays)
  return getLocalDateKey(date)
}

function buildDateRange(startDateKey, endDateKey) {
  const days = []
  let currentKey = startDateKey

  while (currentKey <= endDateKey) {
    days.push(currentKey)
    if (currentKey === endDateKey) {
      break
    }
    currentKey = shiftDateKey(currentKey, 1)
  }

  return days
}

function isDaySuccessful(daySessions, dayKey, todayKey) {
  if (daySessions.length === 0) {
    return true
  }

  const completedCount = daySessions.filter((session) => session.status === 'completed').length

  if (dayKey === todayKey) {
    return completedCount > 0
  }

  return completedCount === daySessions.length
}

export function calculateUserStreakMetrics(sessions = [], referenceDate = new Date()) {
  const todayKey = getLocalDateKey(referenceDate)
  const validSessions = sessions.filter((session) => session?.scheduled_date && session.scheduled_date <= todayKey)

  if (validSessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    }
  }

  const sessionsByDay = new Map()

  for (const session of validSessions) {
    if (!sessionsByDay.has(session.scheduled_date)) {
      sessionsByDay.set(session.scheduled_date, [])
    }

    sessionsByDay.get(session.scheduled_date).push(session)
  }

  const sortedKeys = Array.from(sessionsByDay.keys()).sort()
  const firstDayKey = sortedKeys[0]
  const range = buildDateRange(firstDayKey, todayKey)

  let longestStreak = 0
  let currentRun = 0

  for (const dayKey of range) {
    const daySessions = sessionsByDay.get(dayKey) || []
    const successfulDay = isDaySuccessful(daySessions, dayKey, todayKey)

    if (successfulDay) {
      currentRun += 1
      if (currentRun > longestStreak) {
        longestStreak = currentRun
      }
    } else {
      currentRun = 0
    }
  }

  let currentStreak = 0
  let lastActiveDate = null

  for (let index = range.length - 1; index >= 0; index -= 1) {
    const dayKey = range[index]
    const daySessions = sessionsByDay.get(dayKey) || []
    const successfulDay = isDaySuccessful(daySessions, dayKey, todayKey)

    if (!successfulDay) {
      break
    }

    currentStreak += 1
    lastActiveDate = dayKey
  }

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
  }
}

export async function syncUserStreak(supabase, userId, referenceDate = new Date()) {
  const { data: sessions, error } = await supabase
    .from('weekly_plan_sessions')
    .select('scheduled_date, status')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  const metrics = calculateUserStreakMetrics(sessions || [], referenceDate)

  const { error: upsertError } = await supabase.from('user_streaks').upsert(
    {
      user_id: userId,
      current_streak: metrics.currentStreak,
      longest_streak: metrics.longestStreak,
      last_active_date: metrics.lastActiveDate,
    },
    {
      onConflict: 'user_id',
    }
  )

  if (upsertError) {
    throw upsertError
  }

  return metrics
}