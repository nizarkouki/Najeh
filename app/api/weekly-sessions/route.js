import { createClient } from '@/lib/supabase/server'
import { syncUserStreak } from '@/lib/streaks'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const payload = {
    weekly_plan_id: body.weekly_plan_id,
    weekly_plan_day_id: body.weekly_plan_day_id || null,
    subject_id: body.subject_id || null,
    planned_minutes: body.planned_minutes || 0,
    order_in_day: body.order_in_day || 0,
    scheduled_date: body.scheduled_date || null,
    status: body.status || 'pending'
  }

  const { data, error } = await supabase.from('weekly_plan_sessions').insert(payload).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })

  try {
    await syncUserStreak(supabase, user.id)
  } catch (streakError) {
    console.error('Failed to sync streak after weekly session create:', streakError)
  }

  const { data: streakRow } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle()

  return Response.json({
    data,
    streak: streakRow || null,
  })
}
