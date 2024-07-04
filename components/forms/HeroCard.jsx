'use client'

import Image from "next/image";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useCallback, useEffect, useState } from "react";

export default function HeroCard({ hero, available, id }) {
    const [packedHero, setPackedHero] = useState(false)
    const [selectedHero, setSelectedHero] = useState(null)

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
        // fetchHero()
    }, [hero_id])

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
                    <p className="text-xs">Com um Hero, você pode aumentar seus ganhos em uma partida.</p>
                </div>
                <Card className="bg-gradient-to-t from-primary from-5% absolute flex justify-center items-end overflow-hidden border-primary shadow-[0_0_30px_-10px_rgba(0,0,0,0.3)] shadow-primary">
                    <CardContent className="relative flex items-end py-0 px-6 w-[350px] h-[480px]">
                        <CardTitle className="absolute top-4 text-4xl font-bold p-2">
                            {selectedHero.name}
                        </CardTitle>
                        <CardTitle className="absolute top-16 text-4xl font-bold p-4 ml-2 bg-primary">
                            <p>+{(selectedHero.power * 100) - 100}%</p>
                        </CardTitle>
                        <Button onClick={() => storeHero(id)} variant="secondary" className="w-full self-end my-2 z-20 hover:cursor-pointer">Receber</Button>
                        <Image priority={true} alt={selectedHero.name} src={`/${selectedHero.slug}.png`} className="absolute left-1/4 bottom-0" width="600" height="600" />
                        <div className="bg-gradient-to-t from-primary via-primary from-0% via-5% absolute w-full h-full left-0 top-20"></div>
                    </CardContent>
                </Card>
            </div>
        )}</div>
    )
}