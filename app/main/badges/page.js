"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  FaBolt,
  FaBrain,
  FaClock,
  FaFaceGrinStars,
  FaFire,
  FaLayerGroup,
  FaMedal,
  FaMoon,
  FaPersonRunning,
  FaSun,
  FaTableList,
} from 'react-icons/fa6'

const badgeCatalog = [
  { key: 'hour_hunter', name: 'Hour Hunter', icon: FaClock, requirement: 'Reach 100 study hours', statKey: 'totalHours', threshold: 100, unit: 'h' },
  { key: 'marathon_scholar', name: 'Marathon Scholar', icon: FaPersonRunning, requirement: 'Reach 500 study hours', statKey: 'totalHours', threshold: 500, unit: 'h' },
  { key: 'session_master', name: 'Session Master', icon: FaMedal, requirement: 'Complete 100 sessions', statKey: 'totalSessions', threshold: 100, unit: 'sessions' },
  { key: 'perfect_week', name: 'Perfect Week', icon: FaTableList, requirement: 'Finish all scheduled sessions for a full week', statKey: 'perfectWeeks', threshold: 1, unit: 'week' },
  { key: 'flawless_month', name: 'Flawless Month', icon: FaFaceGrinStars, requirement: 'Finish all scheduled sessions for a full month', statKey: 'flawlessMonths', threshold: 1, unit: 'month' },
  { key: 'no_zero_hero', name: 'No-Zero Hero', icon: FaFire, requirement: '30 days with at least one completed session', statKey: 'noZeroDays', threshold: 30, unit: 'days' },
  { key: 'planner_pro', name: 'Planner Pro', icon: FaLayerGroup, requirement: 'Successfully follow 10 generated plans', statKey: 'plansFollowed', threshold: 10, unit: 'plans' },
  { key: 'adaptive_genius', name: 'Adaptive Genius', icon: FaBrain, requirement: 'Complete 4 weeks with AI feedback adjustments', statKey: 'adaptiveWeeks', threshold: 4, unit: 'weeks' },
  { key: 'early_bird', name: 'Early Bird', icon: FaSun, requirement: 'Complete 10 morning sessions before 8:00 AM', statKey: 'earlySessions', threshold: 10, unit: 'sessions' },
  { key: 'night_owl', name: 'Night Owl', icon: FaMoon, requirement: 'Complete 10 late sessions after 10:00 PM', statKey: 'nightSessions', threshold: 10, unit: 'sessions' },
  { key: 'comeback_kid', name: 'Comeback Kid', icon: FaBolt, requirement: 'Recover streak after missing day, at least once', statKey: 'comebackCount', threshold: 1, unit: 'comeback' },
]

function formatProgress(value, threshold, unit) {
  if (unit === 'h') {
    return `${Math.min(value, threshold).toFixed(1)}/${threshold} h`
  }

  return `${Math.min(value, threshold)}/${threshold} ${unit}`
}

export default function BadgesPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const response = await fetch('/api/gamification')
        const json = await response.json()
        if (mounted) setStats(json?.stats || null)
      } catch {
        if (mounted) setStats(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const allBadges = useMemo(() => {
    const currentStats = stats || {}

    return badgeCatalog.map((badge) => {
      const value = Number(currentStats[badge.statKey] || 0)
      return {
        ...badge,
        unlocked: value >= badge.threshold,
        progress: formatProgress(value, badge.threshold, badge.unit),
      }
    })
  }, [stats])

  const unlockedBadges = allBadges.filter((badge) => badge.unlocked)
  const lockedBadges = allBadges.filter((badge) => !badge.unlocked)

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading badges...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <h2 className="text-xl font-semibold">Badge collection</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {unlockedBadges.length} of {allBadges.length} unlocked
        </p>
      </section>

      <section className="rounded-2xl border border-emerald-300/60 bg-emerald-50/70 p-6 dark:border-emerald-700/50 dark:bg-emerald-950/20">
        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Unlocked badges</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {unlockedBadges.map((badge) => {
            const Icon = badge.icon

            return (
              <article
                key={badge.key}
                className="rounded-xl border border-emerald-300/70 bg-white/80 p-4 dark:border-emerald-700/60 dark:bg-zinc-900/60"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                  <p className="text-sm font-semibold">{badge.name}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{badge.requirement}</p>
                <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Unlocked
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300/60 bg-amber-50/70 p-6 dark:border-amber-700/50 dark:bg-amber-950/20">
        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Locked badges</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lockedBadges.map((badge) => {
            const Icon = badge.icon

            return (
              <article
                key={badge.key}
                className="rounded-xl border border-amber-300/70 bg-white/80 p-4 dark:border-amber-700/60 dark:bg-zinc-900/60"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  <p className="text-sm font-semibold">{badge.name}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{badge.requirement}</p>
                <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Progress: {badge.progress}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
