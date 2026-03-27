"use client"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"


export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error){
      router.push('/main')
      router.refresh()
    } else setError(error.message)

    setLoading(false)
  }

  const handleGoogleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/main`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }


  return(
    <>
      <div className="relative mx-auto w-full max-w-md rounded-3xl border border-zinc-300/60 bg-white/85 p-6 shadow-[0_25px_60px_rgba(31,41,55,0.16)] backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/70 sm:p-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
          <span aria-hidden="true">&larr;</span> Back to Home
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Log in to continue your study journey.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleEmailLogin}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white/90 px-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white/90 px-3 pr-12 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.92-2.6 2.64-4.8 4.92-6.32" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.05 11.05 0 0 1-1.67 2.98" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <path d="m1 1 22 22" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

          <Button type="submit" disabled={loading} className="cursor-pointer h-11 w-full rounded-xl bg-[linear-gradient(130deg,#ea580c,#f59e0b)] text-sm font-semibold text-white hover:brightness-105">
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="cursor-pointer inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white/90 px-4 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-300">
          Don&apos;t have an account? <Link href="/signup" className="font-semibold text-amber-600 hover:text-amber-500">Sign up</Link>
        </p>
      </div>
    </>
  )




}

