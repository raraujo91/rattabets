import moment from "moment"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import HeroCard from "@/components/forms/HeroCard"
import FilterWrapper from "@/components/forms/FilterWrapper"
import CleanLoading from "@/components/misc/LoadingCleaner"

import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'

export const revalidate = 0

async function fetchData() {

    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/auth')
    }

    const { data: championships, error: championshipsError } = await supabase.from('championships').select(`*, fixtures(*, homeTeam(*), awayTeam(*), bets(*, userId(*)))`).eq('active', true).gte('fixtures.startsAt', moment().subtract(7, 'days').toISOString())

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
    if(process.env.NEXT_PUBLIC_CURRENT_SITE_STATUS == "idle") {
        redirect('/hof')
      }

    const { championships, user, points, profile } = await fetchData()
    const startAtTab = searchParams?.goto
    const newHeroAvailable = profile.heros.find(hero => hero.new == true)
    const activeChampionships = championships.filter(championship => championship.active == true)

    // lazy fix :D
    const olympicsRanking = points.filter(point => point.championshipId == "m-olympics-2024");

    return (
        <>
            <CleanLoading />
            <Tabs defaultValue={startAtTab ? startAtTab : activeChampionships[0].slug}>
                <TabsList className="w-full justify-strech">
                    {activeChampionships.map(championship => {
                        return (
                            <TabsTrigger key={championship.id} value={championship.slug}>{championship.name}</TabsTrigger>
                        )
                    })}
                </TabsList>
                {activeChampionships.map(championship => {
                    return (
                        <TabsContent key={championship.id} value={championship.slug}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ranking</CardTitle>
                                </CardHeader>
                                <CardContent> 
                                    {olympicsRanking.map((user, i) => {
                                        if(user.championshipId == championship.slug){
                                            return (
                                                <div key={user.userId} className="flex justify-between">
                                                    <div className="flex space-x-2">
                                                        <p>{
                                                            (i == 0 || i == 5) ? `🏆` : (i == 4 || i == 9) ? `💸` : `💰`
                                                        }</p>
                                                        <p>{user.profiles.nickname}</p>
                                                    </div>
                                                    <div className="font-bold">{user.points}</div>
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