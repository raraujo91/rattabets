import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import HeroCard from "@/components/forms/HeroCard"
import FilterWrapper from "@/components/forms/FilterWrapper"

import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'
import moment from "moment"

export const revalidate = 0

async function fetchData() {

    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/auth')
    }

    const { data: championships, error: championshipsError } = await supabase.from('championships').select(`*, fixtures(*, homeTeam(*), awayTeam(*), bets(*, userId(*)))`).gte('fixtures.startsAt', moment().subtract(7, 'days').toISOString())

    if (championshipsError) {
        throw new Error(JSON.stringify(championshipsError, null, 2))
    }

    championships.map(championship => {
        return championship.fixtures.sort((a, b) => b.gameId - a.gameId)
    })

    const { data: profile, error: profileError } = await supabase.from('profiles').select('*, heros:heros_profiles(*, hero_id(*))').eq('id', user?.id).limit(1).single() 

    if (profileError) {
        throw new Error(JSON.stringify(profileError, null, 2))
    }

    const { data: points, error: profilesError } = await supabase.from('bets').select(`championshipId, userId, profiles(*), points:points.sum()`)

    points.sort((a, b) => b.points - a.points)

    if (profilesError) {
        throw new Error(JSON.stringify(profilesError, null, 2))
    }

    return { championships, user, points, profile }
}

export default async function FixturePage({ searchParams }) {
    const { championships, user, points, profile } = await fetchData()
    const startAtTab = searchParams?.goto
    const newHeroAvailable = profile.heros.find(hero => hero.new == true)

    return (
        <>
            <Tabs defaultValue={startAtTab ? startAtTab : championships[0].slug}>
                <TabsList className="w-full justify-strech">
                    {championships.map(championship => {
                        return (
                            <TabsTrigger key={championship.id} value={championship.slug}>{championship.name}</TabsTrigger>
                        )
                    })}
                </TabsList>
                {championships.map(championship => {
                    return (
                        <TabsContent key={championship.id} value={championship.slug}>
                            <Card variant="ghost">
                                <CardHeader>
                                    <CardTitle>Ranking</CardTitle>
                                </CardHeader>
                                <CardContent> 
                                    {points.map((user, i) => {
                                        if(user.championshipId == championship.slug){
                                            return (
                                                <div key={user.userId} className="flex justify-between">
                                                    <p>{user.profiles.nickname}</p>
                                                    <p className="font-bold">{user.points}</p>
                                                </div>
                                            )
                                        }
                                    })}
                                </CardContent>
                            </Card>
                            <FilterWrapper championship={championship} user={user} />
                        </TabsContent>
                    )
                })}
            </Tabs>
            { newHeroAvailable?.new && <HeroCard hero={newHeroAvailable} available={true} id={user?.id} />} 
        </>
    )
}