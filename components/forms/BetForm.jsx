"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FlagIcon } from 'react-flag-kit'
import { useEffect, useState } from 'react'
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useToast } from '../ui/use-toast'
import { createClient } from '@/utils/supabase/client'
import moment from 'moment'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '../ui/switch'

const formSchema = z.object({
    yellowCards: z.string(),
    redCards: z.string(),
    cornerKicks: z.string(),
    freeKickGoals: z.string(),
    headerGoals: z.string(),
    longRangeGoals: z.string(),
    penaltyGoals: z.string(),
    isHeroUsed: z.string().optional()
})

export default function BetForm({ fixture, rules, user, profile }) {
    const supabase = createClient()

    const { bets } = fixture

    let [homeScore, setHomeScore] = useState(0)
    let [awayScore, setAwayScore] = useState(0)
    let [userBet, setUserBet] = useState({})
    let [mode, setMode] = useState("create")
    let [locked, setLocked] = useState(false)
    let [heroState, setHeroState] = useState()
    let [heroMetadata, setHeroMetadata] = useState({})

    useEffect(() => {
        const timeNow = moment().utcOffset("-03:00")
        const gameTime = moment(fixture.startsAt).utcOffset("-03:00")

        setLocked(timeNow.diff(gameTime) > 0)

        bets.sort((a, b) => b.points - a.points)

        if (bets) {
            let bet = bets.find(bet => bet.userId.id == user?.id)
            if (bet) {
                setHomeScore(bet.homeScore)
                setAwayScore(bet.awayScore)
                setUserBet(bet)
                setMode("edit")
                console.log("server-state-bet: ", bet)
                
                if(bet.isHeroUsed == true) {
                    setHeroMetadata(fixture.championshipId.heros.find(hero => hero.id == bet.heroId))
                    setHeroState(bet.isHeroUsed)
                } else {
                    setHeroMetadata(fixture.championshipId.heros.find(hero => {
                        if(hero.id == profile.heroId) {
                            return hero.id == profile.heroId
                        } 
        
                        return {}
                    }))
                    setHeroState(bet.isHeroUsed)
                }


            }
        } else {
            setHeroMetadata(fixture.championshipId.heros.find(hero => {
                if(hero.id == profile.heroId) {
                    return hero.id == profile.heroId
                } 

                return {}
            }))
        }
    }, [bets, user?.id, fixture.startsAt])

    const { toast } = useToast()
    const router = useRouter()

    async function onSubmit() {
        let payload = {
            fixtureId: fixture.id,
            championshipId: fixture.championshipId.slug,
            ...userBet
        }

        payload.homeScore = homeScore
        payload.awayScore = awayScore
        payload.userId = user?.id

        if (mode == "create") {
            const { error: createError } = await supabase.from('bets').insert(payload)
            const { error: profileError } = await supabase.from('profiles').update({
                heroLocked: heroState,
                heroId: heroState ? null : heroMetadata.id
            }).eq('id', user?.id)

            let error = profileError || createError

            if (error) {
                throw new Error(JSON.stringify(error, null, 2))
            }

            toast({
                variant: "default",
                title: "Aposta criada"
            })
        }

        if (mode == "edit") {
            const { error: editError } = await supabase.from('bets').upsert(payload)
            const { error: profileError } = await supabase.from('profiles').update({
                heroLocked: heroState,
                heroId: heroState ? null : heroMetadata.id
            }).eq('id', user?.id)

            let error = editError || profileError

            if (editError) {
                throw new Error(JSON.stringify(error, null, 2))
            }

            toast({
                variant: "default",
                title: "Aposta editada"
            })
        }

        router.refresh()
        // router.push(`/lobby/fixtures?goto=${fixture.championshipId.slug}`)
    }

    let defaultRulesValues = {
        yellowCards: userBet?.yellowCards || "",
        redCards: userBet?.redCards || "",
        cornerKicks: userBet?.cornerKicks || "",
        headerGoals: userBet?.headerGoals || "",
        longRangeGoals: userBet?.longRangeGoals || "",
        freeKickGoals: userBet?.freeKickGoals || "",
        penaltyGoals: userBet?.penaltyGoals || "",
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultRulesValues
    })

    return (
        <Tabs defaultValue="bet">
            <TabsList className="w-full justify-around my-4">
                <TabsTrigger value="bet">Minha bet</TabsTrigger>
                <TabsTrigger value="bets">Outras bets</TabsTrigger>
                <TabsTrigger value="fixture">Partida</TabsTrigger>
            </TabsList>
            <TabsContent value="bet">
                <div className='flex justify-between w-full'>
                    <div className='flex flex-col font-bold text-4xl w-1/4 justify-center items-center'>
                        <FlagIcon code={fixture.homeTeam.flag} size={64} /><p>{fixture.homeTeam.initials}</p></div>
                    <div className='flex flex-col justify-center items-center w-1/4'>
                        <div className='flex w-full items-end'>
                            <Button onClick={() => setHomeScore(homeScore + 1)} name="addHomeScore" variant="ghost" className={`${locked ? "hidden" : "w-full"}`}>
                                <MdKeyboardArrowUp size={64} />
                            </Button>
                        </div>
                        <div className="flex justify-center w-full font-bold text-8xl">
                            <p>{homeScore}</p>
                        </div>
                        <div className='w-full pt-2'>
                            <Button onClick={() => { homeScore > 0 ? setHomeScore(homeScore - 1) : false }} variant="ghost" className={`${locked ? "hidden" : "w-full"}`}>
                                <MdKeyboardArrowDown size={64} />
                            </Button>
                        </div>
                    </div>
                    <div className='flex flex-col justify-center items-center w-1/4'>
                        <div className='flex w-full items-end'>
                            <Button onClick={() => {
                                setAwayScore(awayScore + 1)
                            }} variant="ghost" className={`${locked ? "hidden" : "w-full"}`}>
                                <MdKeyboardArrowUp size={64} />
                            </Button>
                        </div>
                        <div className="flex justify-center w-full font-bold text-8xl">
                            <p>{awayScore}</p>
                        </div>
                        <div className='w-full pt-2'>
                            <Button onClick={() => awayScore > 0 ? setAwayScore(awayScore - 1) : false} variant="ghost" className={`${locked ? "hidden" : "w-full"}`}>
                                <MdKeyboardArrowDown size={64} />
                            </Button>
                        </div>
                    </div>
                    <div className='flex flex-col font-bold text-4xl w-1/4 justify-center items-center'>
                        <FlagIcon code={fixture.awayTeam.flag} size={64} /><p>{fixture.awayTeam.initials}</p></div>
                </div>
                <Card className={`w-full py-6 px-10 mb-8 border-0 ${locked ? 'mt-8' : ''}`}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 divide-y divide-slate-700">
                            {
                                rules.map((rule, i) => {
                                    if (rule.active && rule.type == "overUnder") {
                                        return (
                                            <FormField
                                                key={rule.id}
                                                control={form.control}
                                                name={rule.keyword}
                                                render={() => (
                                                    <>
                                                        <FormItem className="pt-2">
                                                            <FormLabel className="text-lg">{rule.description}</FormLabel>
                                                            <FormControl className="flex items-center justify-between">
                                                                <ToggleGroup className="justify-between pb-2" type="single" value={userBet[rule.keyword]} onValueChange={(value) => {
                                                                    setUserBet(prevBet => {
                                                                        return {
                                                                            ...prevBet,
                                                                            [rule.keyword]: value
                                                                        }
                                                                    })
                                                                }}>
                                                                    <ToggleGroupItem className={`w-full text-2xl data-[state=on]:border-2 data-[state=on]:border-slate-200`} value="over" disabled={locked}><FaPlus /><p>{rule.defaultSpread}</p></ToggleGroupItem>
                                                                    <ToggleGroupItem className={`w-full text-2xl data-[state=on]:border-2 data-[state=on]:border-slate-200`} value="under" disabled={locked}><FaMinus /><p>{rule.defaultSpread}</p></ToggleGroupItem>
                                                                </ToggleGroup>
                                                            </FormControl>
                                                            <FormMessage variant="primary" />
                                                        </FormItem>
                                                    </>
                                                )} />
                                        )
                                    }
                                })
                            }
                            {
                                (profile.heroLocked == false || userBet.isHeroUsed == true || Object.keys(heroMetadata).length !== 0) && (
                                    <div className={`${heroMetadata ? '' : 'hidden'} pt-6`}>
                                        <FormField
                                            className="mt-2"
                                            control={form.control}
                                            name="isHeroUsed"
                                            render={() => (
                                                <FormItem className="flex justify-between">
                                                    <FormLabel className="text-xl">{`Utilizar ${heroMetadata?.name} (+${(heroMetadata?.power * 100) - 100}%)`}</FormLabel>
                                                    <FormControl>
                                                        <Switch className="data-[state=unchecked]:bg-zinc-500" disabled={locked} checked={heroState} onCheckedChange={(checked) => {
                                                            setHeroState(checked)
                                                            setUserBet(prevBet => {
                                                                return {
                                                                    ...prevBet,
                                                                    isHeroUsed: checked,
                                                                    heroId: checked ? heroMetadata?.id : null
                                                                }
                                                            })
                                                        }} />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                    </div>
                                )
                            }
                            <div className={`w-full max-w-screen bottom-2 ${locked ? "hidden" : ""}`}>
                                <Button type="submit" className="w-full hover:bg-green-700 active:bg-green-800">{mode == "create" ? "Salvar" : "Editar"}</Button>
                            </div>
                        </form>
                    </Form>
                </Card>
            </TabsContent>
            <TabsContent value="bets">
                <Card>
                    <CardHeader>
                        <CardTitle>Ranking da partida</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {bets.map(bet => {
                            return (
                                <div key={bet.id} className='mb-4'>
                                    <div className='font-bold flex justify-between text-2xl mx-4'>
                                        <p>{bet.userId.nickname}</p>
                                        <p className='font-bold'>
                                            {fixture.isSynced ? bet.points : "🆗"}
                                        </p>
                                    </div>
                                    {fixture.isFinished && (
                                        <Card variant="outline" className="border-slate-600 p-4 mt-2 my-4">
                                            <div name="score" className='my-2 text-xl'>
                                                <div className='flex justify-between'>
                                                    <div name="home-team-block" className='flex items-center space-x-2'>
                                                        <FlagIcon code={fixture.homeTeam.flag} size={24} />
                                                        <p className='text-lg font-bold'>{fixture.homeTeam.name}</p>
                                                    </div>
                                                    <div className='font-bold'>
                                                        {bet.homeScore}
                                                    </div>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <div name="home-team-block" className='flex items-center space-x-2'>
                                                        <FlagIcon code={fixture.awayTeam.flag} size={24} />
                                                        <p className='text-lg font-bold'>{fixture.awayTeam.name}</p>
                                                    </div>
                                                    <div className='font-bold'>
                                                        {bet.awayScore}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex flex-col justify-between'>
                                                {rules.map(rule => {
                                                    if (rule.type == "overUnder") {
                                                        return (
                                                            <div key={bet.id} className='flex justify-between'>
                                                                <div>
                                                                    {rule.description}
                                                                </div>
                                                                <div className='text-lg'>
                                                                    <a className='text-xs'>{`${bet[rule.keyword] == "over" ? "Mais de" : "Menos de"}`}</a>
                                                                    <a>{` ${rule.defaultSpread} `}</a>
                                                                    {fixture.isSynced && (
                                                                        <a>
                                                                            {bet[rule.keyword] == "over" && fixture[rule.keyword] > rule.defaultSpread ? "✅" : bet[rule.keyword] == "under" && fixture[rule.keyword] < rule.defaultSpread ? "✅" : "❌"}
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                })}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="fixture">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da partida</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div name="score" className='my-2'>
                            <div className='flex justify-between'>
                                <div name="home-team-block" className='flex items-center space-x-2'>
                                    <FlagIcon code={fixture.homeTeam.flag} size={24} />
                                    <p className='text-lg font-bold'>{fixture.homeTeam.name}</p>
                                </div>
                                <div className='font-bold'>
                                    {fixture.score[0]}
                                </div>
                            </div>
                            <div className='flex justify-between'>
                                <div name="home-team-block" className='flex items-center space-x-2'>
                                    <FlagIcon code={fixture.awayTeam.flag} size={24} />
                                    <p className='text-lg font-bold'>{fixture.awayTeam.name}</p>
                                </div>
                                <div className='font-bold'>
                                    {fixture.score[1]}
                                </div>
                            </div>
                        </div>
                        <div name="rules" className='mt-6'>
                            {rules.map(rule => {
                                if (rule.type == "overUnder") {
                                    return (
                                        <div key={rule.id} className='flex justify-between'>
                                            <p>{rule.description}</p>
                                            <p className='font-bold'>{fixture[rule.keyword]}</p>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}