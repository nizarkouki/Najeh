import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const weeklyPlanId = searchParams.get('weeklyPlanId')
  if (!weeklyPlanId) return Response.json({ data: [] })

  const { data, error } = await supabase.from('weekly_plan_days').select('id, day_date, target_minutes').eq('weekly_plan_id', weeklyPlanId).order('day_date', { ascending: true })
  if (error) return Response.json({ data: [] })
  return Response.json({ data })
}
