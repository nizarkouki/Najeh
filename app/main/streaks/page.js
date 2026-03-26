import {
  FaBolt,
  FaCompass,
  FaCrown,
  FaFireFlameCurved,
  FaMeteor,
  FaMedal,
  FaPhoenixFramework,
  FaRocket,
  FaStar,
  FaTrophy
} from 'react-icons/fa6'

const streakState = {
  current: 12,
  longest: 21,
  totalActiveDays: 86
}

const streakMilestones = [
  { days: 0, title: 'Dormant Ember', icon: null },
  { days: 1, title: 'Spark Initiate', icon: FaBolt },
  { days: 3, title: 'Flame Starter', icon: FaFireFlameCurved },
  { days: 10, title: 'Focus Ranger', icon: FaMedal },
  { days: 20, title: 'Momentum Rider', icon: FaRocket },
  { days: 30, title: 'Blaze Captain', icon: FaMeteor },
  { days: 50, title: 'Inferno Knight', icon: FaCrown },
  { days: 70, title: 'Radiant Warden', icon: FaStar },
  { days: 100, title: 'Phoenix Ascendant', icon: FaPhoenixFramework },
  { days: 200, title: 'Eternal Legend', icon: FaTrophy }
]

const nextMilestone =
  streakMilestones.find((item) => item.days > streakState.current) ?? streakMilestones[streakMilestones.length - 1]

const remainingDays = Math.max(nextMilestone.days - streakState.current, 0)
const progressToNext = Math.min((streakState.current / nextMilestone.days) * 100, 100)

export default function StreaksPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <h2 className="text-xl font-semibold">Streak tracker</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          You are at {streakState.current} days. Next tier: {nextMilestone.title} ({nextMilestone.days} days).
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {remainingDays} day{remainingDays === 1 ? '' : 's'} left to reach your next streak milestone.
        </p>

        <div className="mt-4 h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-3 rounded-full bg-[linear-gradient(130deg,#ea580c,#f59e0b)] transition-all duration-500"
            style={{ width: `${progressToNext}%` }}
            aria-label="Streak progress"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-zinc-300/70 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
            <FaFireFlameCurved className="h-4 w-4 text-orange-500" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Current streak</p>
            <p className="mt-1 text-lg font-semibold">{streakState.current} days</p>
          </article>
          <article className="rounded-xl border border-zinc-300/70 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
            <FaStar className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Longest streak</p>
            <p className="mt-1 text-lg font-semibold">{streakState.longest} days</p>
          </article>
          <article className="rounded-xl border border-zinc-300/70 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
            <FaCompass className="h-4 w-4 text-sky-500" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total active days</p>
            <p className="mt-1 text-lg font-semibold">{streakState.totalActiveDays}</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-300/60 bg-white/75 p-6 backdrop-blur-md transition-colors duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <h3 className="text-lg font-semibold">All streak levels</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {streakMilestones.map((milestone) => {
            const reached = streakState.current >= milestone.days
            const Icon = milestone.icon

            return (
              <article
                key={milestone.days}
                className={`rounded-xl border p-4 transition-colors ${
                  reached
                    ? 'border-emerald-300/70 bg-emerald-50/80 dark:border-emerald-700/60 dark:bg-emerald-950/20'
                    : 'border-zinc-300/70 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  {Icon ? (
                    <Icon
                      className={`h-4 w-4 ${
                        reached ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    />
                  ) : (
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  )}
                  <p className="text-sm font-semibold">{milestone.title}</p>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Reach {milestone.days} streak days</p>
                <p
                  className={`mt-2 text-xs font-semibold ${
                    reached ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {reached ? 'Reached' : `${milestone.days - streakState.current} days to go`}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
