import MatchCard from "@/components/cards/MatchCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'
import moment from "moment"

export const revalidate = 0

async function fetchData() {

    const supabase = createClient()

    const { data: championships, error: championshipsError } = await supabase.from('championships').select(`*, fixtures(*, homeTeam(*), awayTeam(*), bets(*, userId(*)))`).gte('fixtures.startsAt', moment().subtract(1, 'days').toISOString())

    if (championshipsError) {
        throw new Error(JSON.stringify(championshipsError, null, 2))
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/auth')
    }

    const { data: points, error: profilesError } = await supabase.from('bets').select(`championshipId, userId, profiles(*), points:points.sum()`)

    console.log(points)

    if (profilesError) {
        throw new Error(JSON.stringify(profilesError, null, 2))
    }

    return { championships, user, points }
}

export default async function FixturePage({ searchParams }) {
    const { championships, user, points } = await fetchData()
    const startAtTab = searchParams?.goto

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
                                    {points.map(user => {
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
                            {
                                championship.fixtures.map(fixture => {
                                    if (fixture.championshipId.includes(championship.slug)) {
                                        return (
                                            <MatchCard key={fixture.id} fixture={fixture} user={user} />
                                        )
                                    }
                                })
                            }
                        </TabsContent>
                    )
                })}
            </Tabs>
        </>
    )
}