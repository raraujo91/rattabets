import MatchCard from "@/components/cards/MatchCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/server"

export const revalidate = 0


async function fetchData() {
    
    const supabase = createClient()
    
    const { data: championships , error } = await supabase.from('championships').select(`*, fixtures(*, homeTeam(*), awayTeam(*), bets(*))`)

    const { data: { user } } = await supabase.auth.getUser()

    if (error) {
        console.log(JSON.stringify(error, null, 2))
        throw new Error(error)
    }

    return { championships, user }
}

export default async function FixturePage({ searchParams }) {
    const { championships, user } = await fetchData()
    const startAtTab = searchParams?.goto

    const users = [
        {
            "id": "38c99f0e-0672-486c-9abb-b23cd6960d24",
            "nickname": "b4tmanLOKO",
            "totalPoints": 1003
        },
        {
            "id": "27449009-5feb-435e-96f9-40e151b59703",
            "nickname": "yakult_",
            "totalPoints": 902
        },
        {
            "id": "e7673e39-3112-4a01-b9f8-7b94ce7c06d9",
            "nickname": "GeorgeBenson",
            "totalPoints": 703
        },
        {
            "id": "c2e50e67-8d3c-4a9d-aa00-fba3dd65697e",
            "nickname": "maryonetch",
            "totalPoints": 943
        },
        {
            "id": "377ca5be-bf1b-4825-a298-ab41ab7052c5",
            "nickname": "bbk.com",
            "totalPoints": 833
        }
    ]

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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ranking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {users.map(user => {
                                        return (
                                            <div key={user.id} className="flex justify-between">
                                                <p>{user.nickname}</p>
                                                <p className="font-bold">{user.totalPoints}</p>
                                            </div>
                                        )
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