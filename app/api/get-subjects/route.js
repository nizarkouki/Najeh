import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const weeklyPlanId = searchParams.get('weeklyPlanId')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ data: [] })

  if (weeklyPlanId) {
    // Find the parent plan for the weekly plan and return its subjects
    const { data: wp } = await supabase.from('weekly_plans').select('plan_id').eq('id', weeklyPlanId).maybeSingle()
    if (wp?.plan_id) {
      const { data, error } = await supabase.from('subjects').select('id, name, coefficient').eq('plan_id', wp.plan_id)
      if (error) return Response.json({ data: [] })
      return Response.json({ data })
    }
    return Response.json({ data: [] })
  }

  const { data, error } = await supabase.from('subjects').select('id, name, coefficient').eq('user_id', user.id)
  if (error) return Response.json({ data: [] })
  return Response.json({ data })
}
