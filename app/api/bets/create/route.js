import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request) {

    let { payload, lockHero } = await request.json()

    const supabase = createClient()

    const { error: createError } = await supabase.from('bets').insert(payload)

    const heroUpdate = supabase
        .from('heros_profiles')
        .update({ locked: lockHero, fixture_id: lockHero ? payload.fixtureId : null })
        .eq('profile_id', payload.userId)

    if(lockHero) {
        heroUpdate.eq('hero_id', payload.heroId)
    }

    let { error: profileError } = await heroUpdate

    let error = profileError || createError

    if (error) {
        throw new Error(JSON.stringify(error, null, 2))
    }

    revalidatePath('/', 'layout')
    return Response.json({
        success: true
    })
}