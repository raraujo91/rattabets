"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { FlagIcon } from 'react-flag-kit'
import { useEffect, useState } from 'react'
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useToast } from '../ui/use-toast'
import { Separator } from '../ui/separator'
import { createClient } from '@/utils/supabase/client'

const formSchema = z.object({
    yellowCards: z.string(),
    redCards: z.string(),
    cornerKicks: z.string(),
    freeKickGoals: z.string(),
    headerGoals: z.string(),
    longRangeGoals: z.string(),
    penaltyGoals: z.string()
})


export default function BetForm({ fixture, rules, user }) {
    const supabase = createClient()

    const { bets } = fixture

    let [homeScore, setHomeScore] = useState(0)
    let [awayScore, setAwayScore] = useState(0)
    let [userBet, setUserBet] = useState({})
    let [mode, setMode] = useState("create")

    useEffect(() => {
        console.log("--useEffect called--")
        if (bets) {
            let bet = bets.find(bet => bet.userId == user?.id)
            if (bet) {
                setHomeScore(bet.homeScore)
                setAwayScore(bet.awayScore)
                setUserBet(bet)
                setMode("edit")
            }
        }
    }, [bets, user.id])

    const { toast } = useToast()
    const router = useRouter()

    async function onSubmit() {
        let payload = {
            fixtureId: fixture.id,
            userId: user.id,
            championshipId: fixture.championshipId,
            ...userBet
        }

        payload.homeScore = homeScore
        payload.awayScore = awayScore

        if (mode == "create") {
            const { error: createError } = await supabase.from('bets').insert(payload)
            if (createError) {
                throw new Error(JSON.stringify(createError, null, 2))
            }

            toast({
                variant: "default",
                title: "Aposta criada"
            })
        }

        if (mode == "edit") {
            console.log(payload)
                const { error: editError } = await supabase.from('bets').upsert(payload)
                if (editError) {
                    throw new Error(JSON.stringify(editError, null, 2))
                }

            toast({
                variant: "default",
                title: "Aposta editada"
            })
        }

        router.push(`/lobby/fixtures?goto=${fixture.championshipId}`)

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
        <>
            <div className='flex justify-between w-full'>
                <div className='flex flex-col font-bold text-4xl w-1/4 justify-center items-center'>
                    <FlagIcon code={fixture.homeTeam.flag} size={64} /><p>{fixture.homeTeam.initials}</p></div>
                <div className='flex flex-col justify-center items-center w-1/4'>
                    <div className='flex w-full items-end'>
                        <Button onClick={() => setHomeScore(homeScore + 1)} name="addHomeScore" variant="ghost" className="w-full">
                            <MdKeyboardArrowUp size={64} />
                        </Button>
                    </div>
                    <div className="flex justify-center w-full font-bold text-8xl">
                        <p>{homeScore}</p>
                    </div>
                    <div className='w-full pt-2'>
                        <Button onClick={() => { homeScore > 0 ? setHomeScore(homeScore - 1) : false }} variant="ghost" className="w-full">
                            <MdKeyboardArrowDown size={64} />
                        </Button>
                    </div>
                </div>
                <div className='flex flex-col justify-center items-center w-1/4'>
                    <div className='flex w-full items-end'>
                        <Button onClick={() => {
                            setAwayScore(awayScore + 1)
                        }} variant="ghost" className="w-full">
                            <MdKeyboardArrowUp size={64} />
                        </Button>
                    </div>
                    <div className="flex justify-center w-full font-bold text-8xl">
                        <p>{awayScore}</p>
                    </div>
                    <div className='w-full pt-2'>
                        <Button onClick={() => awayScore > 0 ? setAwayScore(awayScore - 1) : false} variant="ghost" className="w-full">
                            <MdKeyboardArrowDown size={64} />
                        </Button>
                    </div>
                </div>
                <div className='flex flex-col font-bold text-4xl w-1/4 justify-center items-center'>
                    <FlagIcon code={fixture.awayTeam.flag} size={64} /><p>{fixture.awayTeam.initials}</p></div>
            </div>
            <Card className="w-full py-6 px-10 mb-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {
                            rules.map((rule) => {
                                if (rule.active && rule.type == "overUnder") {
                                    return (
                                        <FormField
                                            key={rule.id}
                                            control={form.control}
                                            name={rule.keyword}
                                            render={({ field }) => (
                                                <>
                                                    <FormItem>
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
                                                                <ToggleGroupItem className='w-full text-2xl' value="over"><FaPlus /><p>{rule.defaultSpread}</p></ToggleGroupItem>
                                                                <ToggleGroupItem className='w-full text-2xl' value="under"><FaMinus /><p>{rule.defaultSpread}</p></ToggleGroupItem>
                                                            </ToggleGroup>
                                                        </FormControl>
                                                    </FormItem>
                                                    <Separator className="bg-zinc-500" />
                                                </>
                                            )} />
                                    )
                                }
                            })
                        }
                        <div className={`w-full max-w-screen bottom-2`} >
                            <Button type="submit" className="w-full hover:bg-green-700 active:bg-green-800">{mode == "create" ? "Salvar" : "Editar"}</Button>
                        </div>
                    </form>
                </Form>
            </Card>
        </>
    )
}