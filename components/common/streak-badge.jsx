"use client"

import {
  FaBolt,
  FaCompass,
  FaCrown,
  FaFireFlameCurved,
  FaMedal,
  FaMeteor,
  FaPhoenixFramework,
  FaRocket,
  FaStar,
  FaTrophy,
} from 'react-icons/fa6'

function getStreakTier(days) {
  const tiers = [
    {
      min: 200,
      label: 'Eternal Legend',
      icon: FaTrophy,
      classes:
        'border-violet-300/90 bg-[linear-gradient(130deg,#ede9fe,#e0f2fe,#fae8ff)] text-violet-900 ring-1 ring-violet-300/50 shadow-[0_0_22px_rgba(139,92,246,.32)] dark:border-violet-400/70 dark:bg-[linear-gradient(130deg,rgba(124,58,237,.34),rgba(236,72,153,.28),rgba(59,130,246,.28))] dark:text-violet-100 dark:ring-violet-300/30 dark:shadow-[0_0_28px_rgba(139,92,246,.55)]'
    },
    {
      min: 100,
      label: 'Phoenix Ascendant',
      icon: FaPhoenixFramework,
      classes:
        'border-rose-300/80 bg-[linear-gradient(130deg,#ffe4eb,#ffd7bf,#ffdff2)] text-rose-800 ring-1 ring-rose-300/40 shadow-[0_0_20px_rgba(236,72,153,.35)] dark:border-rose-400/60 dark:bg-[linear-gradient(130deg,rgba(244,63,94,.3),rgba(249,115,22,.28),rgba(236,72,153,.3))] dark:text-rose-100 dark:ring-rose-300/20 dark:shadow-[0_0_26px_rgba(244,114,182,.6)]'
    },
    {
      min: 70,
      label: 'Radiant Warden',
      icon: FaStar,
      classes:
        'border-fuchsia-300/80 bg-[linear-gradient(130deg,#fae8ff,#ffe4e6)] text-fuchsia-800 ring-1 ring-fuchsia-300/40 shadow-[0_0_18px_rgba(217,70,239,.28)] dark:border-fuchsia-400/60 dark:bg-[linear-gradient(130deg,rgba(217,70,239,.24),rgba(244,63,94,.22))] dark:text-fuchsia-100 dark:ring-fuchsia-300/20 dark:shadow-[0_0_22px_rgba(217,70,239,.45)]'
    },
    {
      min: 50,
      label: 'Inferno Knight',
      icon: FaCrown,
      classes:
        'border-orange-300/80 bg-[linear-gradient(130deg,#ffedd5,#ffe4c7)] text-orange-800 ring-1 ring-orange-300/50 shadow-[0_0_16px_rgba(249,115,22,.28)] dark:border-orange-400/60 dark:bg-[linear-gradient(130deg,rgba(249,115,22,.26),rgba(234,88,12,.24))] dark:text-orange-100 dark:ring-orange-300/20 dark:shadow-[0_0_20px_rgba(249,115,22,.5)]'
    },
    {
      min: 30,
      label: 'Blaze Captain',
      icon: FaMeteor,
      classes:
        'border-amber-300/80 bg-[linear-gradient(130deg,#fff1d6,#ffe3b3)] text-amber-800 ring-1 ring-amber-300/50 shadow-[0_0_16px_rgba(245,158,11,.28)] dark:border-amber-400/60 dark:bg-[linear-gradient(130deg,rgba(245,158,11,.26),rgba(234,88,12,.25))] dark:text-amber-100 dark:ring-amber-300/20 dark:shadow-[0_0_20px_rgba(249,115,22,.5)]'
    },
    {
      min: 20,
      label: 'Momentum Rider',
      icon: FaRocket,
      classes:
        'border-sky-300/80 bg-[linear-gradient(130deg,#e0f2fe,#dbeafe)] text-sky-800 ring-1 ring-sky-300/50 shadow-[0_0_14px_rgba(14,165,233,.25)] dark:border-sky-400/60 dark:bg-[linear-gradient(130deg,rgba(56,189,248,.2),rgba(59,130,246,.2))] dark:text-sky-100 dark:ring-sky-300/20 dark:shadow-[0_0_18px_rgba(56,189,248,.4)]'
    },
    {
      min: 10,
      label: 'Focus Ranger',
      icon: FaMedal,
      classes:
        'border-lime-300/80 bg-[linear-gradient(130deg,#ecfccb,#dcfce7)] text-lime-800 ring-1 ring-lime-300/50 shadow-[0_0_12px_rgba(101,163,13,.22)] dark:border-lime-400/60 dark:bg-[linear-gradient(130deg,rgba(132,204,22,.2),rgba(34,197,94,.18))] dark:text-lime-100 dark:ring-lime-300/20 dark:shadow-[0_0_16px_rgba(132,204,22,.35)]'
    },
    {
      min: 3,
      label: 'Flame Starter',
      icon: FaFireFlameCurved,
      classes:
        'border-orange-200 bg-orange-100 text-orange-800 ring-1 ring-orange-200/60 shadow-[0_0_10px_rgba(251,146,60,.2)] dark:border-orange-800/60 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-300/10 dark:shadow-[0_0_12px_rgba(251,146,60,.3)]'
    },
    {
      min: 1,
      label: 'Spark Initiate',
      icon: FaBolt,
      classes:
        'border-zinc-300 bg-zinc-100 text-zinc-800 ring-1 ring-zinc-300/60 shadow-[0_0_8px_rgba(113,113,122,.15)] dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100 dark:ring-zinc-300/10 dark:shadow-[0_0_10px_rgba(113,113,122,.2)]'
    },
    {
      min: 0,
      label: 'Dormant Ember',
      icon: null,
      classes:
        'border-zinc-200 bg-zinc-100/80 text-zinc-700 ring-1 ring-zinc-200/70 shadow-none dark:border-zinc-700/70 dark:bg-zinc-800/60 dark:text-zinc-300 dark:ring-zinc-600/40'
    }
  ]

  return tiers.find((tier) => days >= tier.min) ?? tiers[tiers.length - 1]
}

export default function StreakBadge({ days = 0 }) {
  const tier = getStreakTier(days)
  const Icon = tier.icon

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 ${tier.classes}`}
      aria-label={`${days} day streak`}
      title={days === 0 ? 'No active streak yet' : `${days} day streak`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{days} days</span>
      <span className="hidden sm:inline">{tier.label}</span>
    </div>
  )
}