"use client"

import { useState } from 'react'
import Navbar from '@/components/common/navbar'
import Sidebar from '@/components/common/sidebar'

export default function MainShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <main className="relative z-10 mx-auto w-full px-4 text-zinc-900 transition-colors duration-300 dark:text-zinc-100">
      <div className="flex gap-5">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <section className="min-w-0 flex-1">
          <Navbar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            streakDays={100}
          />
          {children}
        </section>
      </div>
    </main>
  )
}