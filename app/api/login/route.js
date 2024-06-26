import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request) {
  const supabase = createClient()

  const { email, password } = await request.json()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  console.log(data, error);

  if (error) {
    return NextResponse.json({ login: false }, {
      status: 401,
      error
    })
  }
  revalidatePath('/', 'layout')
  return NextResponse.json({ login: true }, {
    status: 200
  })
}