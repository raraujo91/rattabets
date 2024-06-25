import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request) {
  const supabase = createClient()

  const { email, password } = await request.json()

  const data = {
    email,
    password
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  return NextResponse.redirect(new URL('/lobby', request.url), {
    status: 302,
  })
}