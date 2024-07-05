import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request) {

    let { payload, lockHero } = await request.json()

    const supabase = createClient()

    const { error: createError } = await supabase.from('bets').insert(payload)

    if(lockHero) {
        const { error: profileError } = await supabase
            .from('heros_profiles')
            .update({ locked: lockHero, fixture_id: payload.fixtureId })
            .eq('profile_id', payload.userId)
            .eq('hero_id', payload.heroId)

            if (profileError) {
                throw new Error(JSON.stringify(profileError, null, 2))
            }
    }

    let error = createError

    if (error) {
        throw new Error(JSON.stringify(error, null, 2))
    }

    revalidatePath('/', 'layout')
    return Response.json({
        success: true
    })
}