import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const payload = {
    user_id: user.id,
    weekly_plan_session_id: body.weekly_plan_session_id || null,
    started_at: body.started_at || new Date().toISOString(),
    ended_at: body.ended_at || null,
    duration_seconds: body.duration_seconds || null,
    actual_minutes: body.actual_minutes || null,
    status: body.status || 'completed',
    pomodoro_summary: body.pomodoro_summary || null
  }

  const { data, error } = await supabase.from('study_sessions').insert(payload).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}
