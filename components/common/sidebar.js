"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaAward, FaChartBar, FaFire, FaLayerGroup, FaXmark } from 'react-icons/fa6'
import Image from "next/image";

const navItems = [
  { href: '/main', label: 'Plans', icon: FaLayerGroup },
  { href: '/main/dashboard', label: 'Dashboard', icon: FaChartBar },
  { href: '/main/streaks', label: 'Streaks', icon: FaFire },
  { href: '/main/badges', label: 'Badges', icon: FaAward }
]

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname()

  const navContent = (
    <>
      <div className="mb-5 flex items-center justify-center border-b border-zinc-200 pb-4 dark:border-zinc-700">
        <Link
          href="/main"
          className=" items-center justify-center "
          aria-label="Najeh"
          onClick={onClose}
        >
          <Image className="mr-5" src="/logo.png" width={110} height={110} alt="Najeh logo" />
        </Link>
      </div>

      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 rounded-2xl border border-zinc-300/60 bg-white/75 p-4 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55 md:block">
        {navContent}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 border-r border-zinc-300/60 bg-white p-4 shadow-xl transition-transform duration-300 dark:border-zinc-700/60 dark:bg-zinc-900 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="rounded-xl p-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={onClose}
            aria-label="Close menu"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  )
}