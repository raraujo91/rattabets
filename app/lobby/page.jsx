import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function PrivatePage() {
  if(process.env.NEXT_PUBLIC_CURRENT_SITE_STATUS == "idle") {
    redirect('/hof')
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth')
  }

  return redirect('/lobby/fixtures')
}