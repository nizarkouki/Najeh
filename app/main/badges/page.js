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

const userStats = {
  totalHours: 132,
  totalSessions: 118,
  perfectWeeks: 2,
  flawlessMonths: 0,
  noZeroDays: 24,
  plansFollowed: 7,
  adaptiveWeeks: 3,
  earlySessions: 16,
  nightSessions: 9,
  comebackCount: 2
}

const allBadges = [
  {
    name: 'Hour Hunter',
    icon: FaClock,
    requirement: 'Reach 100 study hours',
    unlocked: userStats.totalHours >= 100,
    progress: `${Math.min(userStats.totalHours, 100)}/100 h`
  },
  {
    name: 'Marathon Scholar',
    icon: FaPersonRunning,
    requirement: 'Reach 500 study hours',
    unlocked: userStats.totalHours >= 500,
    progress: `${Math.min(userStats.totalHours, 500)}/500 h`
  },
  {
    name: 'Session Master',
    icon: FaMedal,
    requirement: 'Complete 100 sessions',
    unlocked: userStats.totalSessions >= 100,
    progress: `${Math.min(userStats.totalSessions, 100)}/100 sessions`
  },
  {
    name: 'Perfect Week',
    icon: FaTableList,
    requirement: 'Finish all scheduled sessions for a full week',
    unlocked: userStats.perfectWeeks >= 1,
    progress: `${Math.min(userStats.perfectWeeks, 1)}/1 week`
  },
  {
    name: 'Flawless Month',
    icon: FaFaceGrinStars,
    requirement: 'Finish all scheduled sessions for a full month',
    unlocked: userStats.flawlessMonths >= 1,
    progress: `${Math.min(userStats.flawlessMonths, 1)}/1 month`
  },
  {
    name: 'No-Zero Hero',
    icon: FaFire,
    requirement: '30 days with at least one completed session',
    unlocked: userStats.noZeroDays >= 30,
    progress: `${Math.min(userStats.noZeroDays, 30)}/30 days`
  },
  {
    name: 'Planner Pro',
    icon: FaLayerGroup,
    requirement: 'Successfully follow 10 generated plans',
    unlocked: userStats.plansFollowed >= 10,
    progress: `${Math.min(userStats.plansFollowed, 10)}/10 plans`
  },
  {
    name: 'Adaptive Genius',
    icon: FaBrain,
    requirement: 'Complete 4 weeks with AI feedback adjustments',
    unlocked: userStats.adaptiveWeeks >= 4,
    progress: `${Math.min(userStats.adaptiveWeeks, 4)}/4 weeks`
  },
  {
    name: 'Early Bird',
    icon: FaSun,
    requirement: 'Complete 10 morning sessions before 8:00 AM',
    unlocked: userStats.earlySessions >= 10,
    progress: `${Math.min(userStats.earlySessions, 10)}/10 sessions`
  },
  {
    name: 'Night Owl',
    icon: FaMoon,
    requirement: 'Complete 10 late sessions after 10:00 PM',
    unlocked: userStats.nightSessions >= 10,
    progress: `${Math.min(userStats.nightSessions, 10)}/10 sessions`
  },
  {
    name: 'Comeback Kid',
    icon: FaBolt,
    requirement: 'Recover streak after missing day, at least once',
    unlocked: userStats.comebackCount >= 1,
    progress: `${Math.min(userStats.comebackCount, 1)}/1 comeback`
  }
]

const unlockedBadges = allBadges.filter((badge) => badge.unlocked)
const lockedBadges = allBadges.filter((badge) => !badge.unlocked)

export default function BadgesPage() {
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
                key={badge.name}
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
                key={badge.name}
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
