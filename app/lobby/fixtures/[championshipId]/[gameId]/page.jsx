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
    const { data: fixture, error: fixtureError } = await supabase.from('fixtures').select(`*, bets(*), homeTeam(*), awayTeam(*)`).eq('gameId', params.gameId).limit(1).single()
    const { data: rules, error: rulesError } = await supabase.from('rules').select()

    console.log(fixture)

    const error = fixtureError || rulesError

    if(error) {
        console.error(error)
        throw new Error(error)
    }

    return (
        <>
            <BetForm rules={rules} fixture={fixture} user={user} />
        </>
    )
}