"use client"
import { ThemeToggle } from "../ui/theme-toggle";
import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from "@/components/ui/button";
import { FaBars, FaEllipsisVertical } from 'react-icons/fa6'
import StreakBadge from './streak-badge'

const pageNames = {
  '/main': 'Plans',
  '/main/dashboard': 'Dashboard',
  '/main/streaks': 'Streaks',
  '/main/badges': 'Badges'
}


export default function Navbar ({ onOpenSidebar, streakDays = 101 }) {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const currentPage = pageNames[pathname] ?? 'Plans'

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()

    if (!error) {
      router.push('/')
      router.refresh()
    }

    setLoading(false)
  }


  return(
    <header className="relative z-30 mb-6 flex items-center justify-between gap-3 rounded-2xl border border-zinc-300/60 bg-white/75 px-3 py-3 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55 sm:px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-300/70 text-zinc-700 transition hover:bg-zinc-100 md:hidden dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <FaBars className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-semibold sm:text-lg">{currentPage}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <StreakBadge days={streakDays} />

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button
            type="button"
            disabled={loading}
            onClick={handleLogout}
            className="cursor-pointer h-9 rounded-full bg-[linear-gradient(130deg,#ea580c,#f59e0b)] px-4 text-sm font-semibold text-white hover:brightness-105"
          >
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </div>

        <div className="relative z-60 md:hidden">
          <details className="group">
            <summary className="list-none">
              <span
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-zinc-300/70 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                aria-label="Open quick actions"
              >
                <FaEllipsisVertical className="h-4 w-4" />
              </span>
            </summary>
            <div className="absolute flex right-0 top-11 z-70 gap-2 w-fit rounded-xl border border-zinc-300/70 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
    
                <ThemeToggle />
              
              <Button
                type="button"
                disabled={loading}
                onClick={handleLogout}
                className="cursor-pointer h-9 w-auto rounded-lg bg-[linear-gradient(130deg,#ea580c,#f59e0b)] px-3 text-sm font-semibold text-white hover:brightness-105"
              >
                {loading ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}