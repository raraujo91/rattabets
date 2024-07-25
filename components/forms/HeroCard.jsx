'use client'

import Image from "next/image";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

export default function HeroCard({ hero, available, id }) {
    const [packedHero, setPackedHero] = useState(false)
    const [selectedHero, setSelectedHero] = useState(null)
    const [heroName, setHeroName] = useState({})

    const { hero_id } = hero

    // const fetchHero = useCallback(async () => {
    //     await fetch('/api/hero').then(response => response.json()).then(hero => {
    //         setSelectedHero(hero)
    //         setPackedHero(!packedHero)
    //     })
    // })

    useEffect(() => {
        setSelectedHero(hero_id)
        setPackedHero(!packedHero)
        // setHeroName({
        //     first: selectedHero.name.split(" ")[0],
        //     last: selectedHero.name.split(" ")[1]
        // })
        // fetchHero()
    }, [hero_id])

    const [firstName, lastName] = selectedHero?.name.split(" ")

    async function storeHero(userId) {
        await fetch('/api/hero', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                heroId: selectedHero.id
            })
        })

        setPackedHero(!packedHero)
    }

    return (
        <div>{packedHero && (
            <div className={`${selectedHero ? '' : 'hidden'} absolute flex items-center justify-center top-0 left-0 w-full min-h-screen bg-[rgba(0,0,0,0.95)] backdrop-blur-sm`}>
                <div className="flex flex-col text-center justify-center absolute top-0 pt-14">
                    <p className="text-xl font-bold">Você recebeu um Hero!</p>
                </div>
                <Card className="bg-gradient-to-t from-primary from-5% absolute flex justify-center items-end overflow-hidden border-primary border-[5px] shadow-[0_0_30px_-10px_rgba(0,0,0,0.3)] shadow-primary">
                    <CardContent className="relative flex items-end py-0 px-6 w-[350px] h-[480px]">
                        <Button onClick={() => storeHero(id)} variant="secondary" className="w-full self-end my-2 z-20 hover:cursor-pointer">Receber</Button>
                        <Image priority={true} alt={selectedHero.name} src={`/${selectedHero.slug}.png`} className="absolute left-0 bottom-0" width="600" height="600" />
                        <div className="flex justify-between absolute bottom-16 w-10/12 bg-zinc-100 rounded-md content-center border-[2px] border-zinc-900">
                            <div className="flex flex-col ml-2 text-zinc-950 justify-center">
                                <span className="text-md align-text-bottom inline-block">{firstName}</span>
                                <span className="font-extrabold text-2xl align-text-top inline-block">{lastName.toUpperCase()}</span>
                            </div>
                            <CardTitle className="text-2xl font-bold p-4 m-2 bg-green-900 rounded-md">
                                <p>+{Math.round((selectedHero.power * 100) - 100)}%</p>
                            </CardTitle>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}</div>
    )
}