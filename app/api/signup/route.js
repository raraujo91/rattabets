import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request) {
    const json = await request.json()

    const supabase = createClient()

    const data = {
        email: json.email,
        password: json.password,
        options: {
            data: {
                nickname: json.nickname
            }
        } 
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/lobby')

    return NextResponse.json({
        success: true
    })
}