
export default function PlanCard({
    id,
    title,
    subjects,
    weeklyGoal,
    progressPercent,
    sessionsCompleted,
    sessionsTotal,
    onDelete,
}) {
    return (
        <div className="w-full">
            <article className="group rounded-2xl border border-zinc-300/70 bg-[linear-gradient(145deg,rgba(255,255,255,.9),rgba(245,245,244,.8))] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-700/70 dark:bg-[linear-gradient(145deg,rgba(39,39,42,.85),rgba(24,24,27,.75))]">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold">{title}</h3>
                    <button
                        onClick={() => onDelete?.(id)}
                        className="cursor-pointer shrink-0 rounded-lg p-1 text-zinc-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        title="Delete plan"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
                        </svg>
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                    <div className="rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Subjects</p>
                        <p className="font-semibold">{subjects}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Goal / this week</p>
                        <p className="font-semibold">{weeklyGoal}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Week progress</p>
                    <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                            className="h-2 rounded-full bg-[linear-gradient(130deg,#ea580c,#f59e0b)]"
                            style={{ width: `${Math.max(0, Math.min(progressPercent, 100))}%` }}
                        />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                        {sessionsCompleted}/{sessionsTotal} sessions completed
                    </p>
                </div>
            </article>
        </div>
    )
}