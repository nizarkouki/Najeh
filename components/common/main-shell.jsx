"use client"

import { useEffect, useState } from 'react'
import Navbar from '@/components/common/navbar'
import Sidebar from '@/components/common/sidebar'

export default function MainShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [streakDays, setStreakDays] = useState(0)

  useEffect(() => {
    let mounted = true

    const refreshStreak = async () => {
      try {
        const response = await fetch('/api/gamification', { cache: 'no-store' })
        const json = await response.json()
        if (mounted) {
          setStreakDays(json?.streak?.current_streak || 0)
        }
      } catch {
        if (mounted) setStreakDays(0)
      }
    }

    refreshStreak()

    const handleStreakUpdated = (event) => {
      const nextStreak = event?.detail?.currentStreak
      if (typeof nextStreak === 'number') {
        setStreakDays(nextStreak)
      }

      refreshStreak()
    }

    window.addEventListener('streak-updated', handleStreakUpdated)

    return () => {
      mounted = false
      window.removeEventListener('streak-updated', handleStreakUpdated)
    }
  }, [])

  return (
    <main className="relative z-10 w-full px-0 text-zinc-900 transition-colors duration-300 dark:text-zinc-100">
      <div className="flex gap-5">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <section className="min-w-0 w-full flex-1">
          <Navbar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            streakDays={streakDays}
          />
          {children}
        </section>
      </div>
    </main>
  )
}