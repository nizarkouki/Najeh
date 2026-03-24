import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";


export default function Home() {
  return (
    <div
      className={` relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_15%,#ffe7bf_0,#fff4e3_26%,#fff_55%),radial-gradient(circle_at_88%_20%,#c7f9e9_0,#ecfff8_28%,transparent_56%)] text-zinc-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_12%_15%,#362715_0,#18120f_34%,#0f0f11_60%),radial-gradient(circle_at_88%_20%,#17322c_0,#101a17_33%,transparent_60%)] dark:text-zinc-100`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-500/15" />
        <div className="absolute -right-24 top-56 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/20" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className=" w-6xl flex items-center justify-between rounded-full border border-zinc-300/60 bg-white/75 px-10 py-2 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55">
          <Image className="mr-5" src="/logo.png" width={110} height={110} alt="Najeh logo" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              size="lg"
              className=" h-11 cursor-pointer overflow-hidden rounded-full border-0 bg-[linear-gradient(130deg,#ea580c,#f59e0b)] px-6 text-[0.92rem] font-semibold text-white shadow-[0_10px_32px_rgba(245,158,11,0.35)] hover:brightness-105"
            >
              <Link href="/login" aria-label="Login to your account">
                <span className="relative z-10">Login</span>
              </Link>
            </Button>
          </div> 
        </div>
      </header>

      <main className="relative z-10 mx-auto flex flex-col justify-center w-full max-w-6xl gap-10 px-4 pb-16 pt-8 sm:px-6">
        <section>
          <h1
            className="text-4xl text-center font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Your Academic
            <span className="block bg-linear-to-r from-orange-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
              Success Companion
            </span>
          </h1>
          <p className="text-center mt-6 max-w-full text-[1.04rem] leading-relaxed text-zinc-700 dark:text-zinc-300">
            Build a study routine that actually sticks.
          </p>
        </section>

        <section className="mx-auto w-full max-w-6xl rounded-4xl border border-zinc-300/60 bg-white/80 px-6 py-7 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55 sm:px-8 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-emerald-300/60 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                PERSONALIZED LEARNING
              </p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Study plans tailored to your pace
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                Start with a clear weekly roadmap and let Najeh adapt it as your
                workload, focus, and deadlines change.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="group flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:hover:bg-zinc-800/70">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-[11px] font-bold text-white shadow-sm">
                  1
                </span>
                <p className="text-base font-medium">AI weekly study plans</p>
              </li>
              <li className="group flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:hover:bg-zinc-800/70">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 text-[11px] font-bold text-white shadow-sm">
                  2
                </span>
                <p className="text-base font-medium">Streak and progress tracking</p>
              </li>
              <li className="group flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:hover:bg-zinc-800/70">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-400 to-blue-500 text-[11px] font-bold text-white shadow-sm">
                  3
                </span>
                <p className="text-base font-medium">Adaptive AI reviews</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="w-full space-y-8">
          <div className="mx-auto w-full max-w-6xl space-y-4">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Get started in 3 steps
            </h2> 
          </div>

          <div className="mx-auto grid w-full max-w-6xl gap-6 sm:grid-cols-3">
            <div className="group rounded-3xl border border-zinc-300/60 bg-white/80 px-6 py-8 shadow-[0_15px_40px_rgba(15,23,42,0.08)] transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:hover:bg-zinc-900/70">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-lg font-bold text-white shadow-lg">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold">Create Account</h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Sign up with your email and set your academic goals in minutes.
              </p>
            </div>

            <div className="group rounded-3xl border border-zinc-300/60 bg-white/80 px-6 py-8 shadow-[0_15px_40px_rgba(15,23,42,0.08)] transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:hover:bg-zinc-900/70">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-lg font-bold text-white shadow-lg">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold">Generate Plan</h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Let AI create a personalized study schedule tailored to your pace.
              </p>
            </div>

            <div className="group rounded-3xl border border-zinc-300/60 bg-white/80 px-6 py-8 shadow-[0_15px_40px_rgba(15,23,42,0.08)] transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:hover:bg-zinc-900/70">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-400 to-blue-500 text-lg font-bold text-white shadow-lg">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold">Track Progress</h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Monitor your streaks and receive adaptive insights daily.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-6xl text-center">
            <Button
              size="lg"
              className="h-11 cursor-pointer rounded-full border-0 bg-[linear-gradient(130deg,#ea580c,#f59e0b)] px-8 text-sm font-semibold text-white shadow-[0_10px_32px_rgba(245,158,11,0.35)] hover:brightness-105"
            >
              <Link href="/login">
                <span className="relative z-10">Get Started For Free</span>
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-zinc-300/50 bg-white/60 dark:border-zinc-700/50 dark:bg-zinc-950/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <div className="space-y-2">
              <div className="flex items-center">
                <Image className="mr-2" src="/favicon.png" width={50} height={50} alt="Najeh logo" />
                <span className="text-lg font-semibold">Najeh</span>
              </div>
              <p className="text-sm w-full text-zinc-600 dark:text-zinc-300">
                Your AI-powered academic success companion.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-200/60 pt-8 dark:border-zinc-800/60">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                © 2026 Najeh. All rights reserved.
              </p>
              
              <Link href="https://github.com/nizark0uki" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" target="_blank">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.092-.646.351-1.085.635-1.334-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </Link>        
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
