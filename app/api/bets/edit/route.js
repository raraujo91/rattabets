import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function PUT(request) {

    let { payload, lockHero } = await request.json()

    const supabase = createClient()

    const { error: editError } = await supabase.from('bets').upsert(payload)

    const { error: profileError } = await supabase.from('heros_profiles').update({
        locked: lockHero,
        fixture_id: lockHero ? payload.fixtureId : null,
    }).eq('profile_id', payload.userId)

    let error = profileError || editError

    if (error) {
        throw new Error(JSON.stringify(error, null, 2))
    }

    revalidatePath('/', 'layout')
    return Response.json({
        edited: true
    })
}


// const { error: editError } = await supabase.from('bets').upsert(payload)
            // const { error: profileError } = await supabase.from('heros_profiles').update({
            //     locked: heroState,
            //     fixture_id: fixture.id
            // }).eq('profile_id', user?.id)

            // let error = editError || profileError

            // if (editError) {
            //     throw new Error(JSON.stringify(error, null, 2))
            // }