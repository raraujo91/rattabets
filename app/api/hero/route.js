import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET() {

    const supabase = createClient()

    const { data: hero, error } = await supabase.from('heros').select('*').limit(1).single()

    if (error) {
        throw new Error(JSON.stringify(error, null, 2))
    }

    revalidatePath('/', 'layout')
    
    return Response.json(hero)

}

export async function POST(request) {

    const { heroId, userId } = await request.json()

    const supabase = createClient()

    const { data, error } = await supabase.from('heros_profiles').insert({ 
        hero_id: heroId,
        profile_id: userId 
    })

    if(error) {
        throw new Error(JSON.stringify(error, null, 2))
    }

    revalidatePath('/', 'layout')

    return Response.json(data)
}