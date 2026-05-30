import { createClient } from '@/lib/supabase/server'
import { syncUserStreak } from '@/lib/streaks'

export async function PATCH(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const resolvedParams = await params
  const id = resolvedParams?.id
  if (!id) return Response.json({ error: 'Missing session id' }, { status: 400 })
  const body = await request.json()

  const updates = {}
  if (body.planned_minutes !== undefined) updates.planned_minutes = body.planned_minutes
  if (body.scheduled_date) updates.scheduled_date = body.scheduled_date
  if (body.subject_id) updates.subject_id = body.subject_id
  if (body.status) updates.status = body.status
  if (body.order_in_day !== undefined) updates.order_in_day = body.order_in_day

  const { data, error } = await supabase.from('weekly_plan_sessions').update(updates).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })

  try {
    await syncUserStreak(supabase, user.id)
  } catch (streakError) {
    console.error('Failed to sync streak after weekly session update:', streakError)
  }

  const { data: streakRow } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle()

  return Response.json({
    data,
    streak: streakRow || null,
  })
}

export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const resolvedParams = await params
  const id = resolvedParams?.id
  if (!id) return Response.json({ error: 'Missing session id' }, { status: 400 })
  const { error } = await supabase.from('weekly_plan_sessions').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  try {
    await syncUserStreak(supabase, user.id)
  } catch (streakError) {
    console.error('Failed to sync streak after weekly session delete:', streakError)
  }

  const { data: streakRow } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle()

  return Response.json({
    success: true,
    streak: streakRow || null,
  })
}
