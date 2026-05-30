"use client"
import { useState, useEffect, useMemo } from "react"
import { FaFire, FaClock, FaBook } from 'react-icons/fa6'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/analytics', { cache: 'no-store' })
        const json = await res.json()
        if (mounted) setData(json)
      } catch (e) {
        console.error('Failed to load analytics:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const weekHours = useMemo(() => {
    if (!data) return { hours: 0, minutes: 0 }
    const totalMinutes = data.week_minutes || 0
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    }
  }, [data])

  const topSubjects = useMemo(() => {
    if (!data?.subjects) return []
    return data.subjects.slice(0, 5)
  }, [data])

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <h1 className="text-2xl font-semibold">Weekly Analytics</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Track your study progress for this week</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-zinc-300/60 bg-white/75 p-12 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55">
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded bg-zinc-300 dark:bg-zinc-700" />
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Weekly Target Card */}
          <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 p-6 backdrop-blur-sm dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-emerald-900/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">This Week</p>
                <p className="mt-3 text-4xl font-bold text-emerald-900 dark:text-emerald-100">
                  {weekHours.hours}h
                </p>
                <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{weekHours.minutes}m total</p>
              </div>
              <div className="rounded-lg bg-emerald-500/20 p-3 text-2xl text-emerald-600 dark:text-emerald-400">
                <FaClock />
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-amber-100/50 p-6 backdrop-blur-sm dark:border-amber-900/60 dark:from-amber-950/40 dark:to-amber-900/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Current Streak</p>
                <p className="mt-3 text-4xl font-bold text-amber-900 dark:text-amber-100">
                  {data.streak?.current_streak || 0}
                </p>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">days in a row</p>
              </div>
              <div className="rounded-lg bg-amber-500/20 p-3 text-2xl text-amber-600 dark:text-amber-400">
                <FaFire />
              </div>
            </div>
          </div>

          {/* Longest Streak Card */}
          <div className="rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50/80 to-sky-100/50 p-6 backdrop-blur-sm dark:border-sky-900/60 dark:from-sky-950/40 dark:to-sky-900/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-sky-700 dark:text-sky-300">Best Streak</p>
                <p className="mt-3 text-4xl font-bold text-sky-900 dark:text-sky-100">
                  {data.streak?.longest_streak || 0}
                </p>
                <p className="mt-1 text-sm text-sky-600 dark:text-sky-400">personal best</p>
              </div>
              <div className="rounded-lg bg-sky-500/20 p-3 text-2xl text-sky-600 dark:text-sky-400">
                <FaFire />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Subjects Breakdown */}
      {!loading && data?.subjects && data.subjects.length > 0 && (
        <div className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-zinc-900/10 p-2 text-lg dark:bg-zinc-100/10">
              <FaBook className="text-zinc-700 dark:text-zinc-300" />
            </div>
            <h2 className="text-lg font-semibold">Study Time by Subject</h2>
          </div>

          <div className="space-y-3">
            {topSubjects.map((subject) => {
              const hours = Math.floor((subject.minutes || 0) / 60)
              const mins = (subject.minutes || 0) % 60
              const percentage = data.week_minutes > 0 
                ? Math.round(((subject.minutes || 0) / data.week_minutes) * 100)
                : 0
              
              return (
                <div key={subject.subject} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{subject.subject}</p>
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      {hours}h {mins}m ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200/60 dark:bg-zinc-700/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {data.subjects.length > 5 && (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              ... and {data.subjects.length - 5} more subjects
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && (!data?.subjects || data.subjects.length === 0) && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No study data yet. Start creating plans and logging sessions to see your analytics!</p>
        </div>
      )}
    </div>
  )
}
