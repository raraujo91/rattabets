import BetForm from "@/components/forms/BetForm";
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0

export const SaveButton = ({ show }) => {
    return (
        <div className={`absolute w-[93%] max-w-screen bottom-0 mb-4 ${show != false ? "hidden" : "block"}`} >
            <Button className="w-full">Salvar</Button>
        </div>
    )
}

export default async function FixturePage({ params }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser() 
    const { data: fixture, error: fixtureError } = await supabase.from('fixtures').select(`*, championshipId(*, heros(*)), bets(*, userId(*)), homeTeam(*), awayTeam(*)`).eq('gameId', params.gameId).eq('championshipId', params.championshipId).limit(1).single()
    const { data: rules, error: rulesError } = await supabase.from('rules').select()
    const { data: profile, error: profileError } = await supabase.from('profiles').select(`*, heros:heros_profiles(*, metadata:hero_id(*))`).eq('id', user?.id).limit(1).single()

    const error = fixtureError || rulesError || profileError

    if(error) {
        throw new Error(JSON.stringify(error, null, 2))
    }

    return (
        <>
            <BetForm rules={rules} fixture={fixture} user={user} profile={profile} />
        </>
    )
}