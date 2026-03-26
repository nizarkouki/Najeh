import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MainShell from '@/components/common/main-shell'

export default async function MainLayout({ children }) {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return <MainShell>{children}</MainShell>
}