'use client'

import Image from "next/image";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";

export default function HeroCard({ hero }) {
    const [packedStatus, setPackedStatus] = useState(hero.packed)

    return (
        <div className={`${packedStatus ? '' : 'hidden'} absolute flex items-center justify-center top-0 w-full min-h-screen bg-[rgba(0,0,0,0.95)] backdrop-blur-sm`}>
            <div className="flex flex-col text-center justify-center absolute top-0 pt-14">
                <p className="text-xl font-bold">Você recebeu um Hero!</p>
                <p className="text-sm">Com um Hero, você pode aumentar seus ganhos em uma partida.</p>
            </div>
            <Card className="bg-gradient-to-t from-primary from-5% absolute flex justify-center items-end overflow-hidden border-primary shadow-[0_0_30px_-10px_rgba(0,0,0,0.3)] shadow-primary">
                <CardContent className="relative flex items-end py-0 px-6 w-[350px] h-[480px]">
                    <CardTitle className="absolute top-4 text-4xl font-bold p-2">
                        {hero.name}
                    </CardTitle>
                    <CardTitle className="absolute top-16 text-4xl font-bold p-4 ml-2 bg-primary">
                        <p>+{hero.power * 100}%</p>
                    </CardTitle>
                    {hero.packed && <Button onClick={() => setUnpackedStatus(!hero.packed)} variant="secondary" className="w-full self-end my-2 z-20 hover:cursor-pointer">Receber</Button>}
                    <Image alt={hero.name} src={`/${hero.slug}.png`} className="absolute left-1/4 bottom-0" width="600" height="600" />
                </CardContent>
            </Card>
        </div>
    )
}