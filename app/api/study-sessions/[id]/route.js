import { createClient } from '@/lib/supabase/server'

export async function PATCH(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const id = params.id
  const body = await request.json()

  const updates = {}
  if (body.ended_at) updates.ended_at = body.ended_at
  if (body.duration_seconds !== undefined) updates.duration_seconds = body.duration_seconds
  if (body.actual_minutes !== undefined) updates.actual_minutes = body.actual_minutes
  if (body.status) updates.status = body.status

  const { data, error } = await supabase.from('study_sessions').update(updates).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ data })
}

export async function GET(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const id = params.id
  const { data, error } = await supabase
    .from('study_sessions')
    .select('id, user_id, weekly_plan_session_id, started_at, ended_at, duration_seconds, actual_minutes, status, weekly_plan_session:weekly_plan_sessions(planned_minutes, scheduled_date)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}
