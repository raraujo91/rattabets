'use client'

import { Switch } from "../ui/switch";
import MatchCard from "../cards/MatchCard";
import { useState } from "react";

export default function FilterWrapper({ championship, user }) {
    const [filteredResults, setFilteredResults] = useState(false) 

    return (
        <main className="w-full">
            <div className="flex justify-between py-4">
                <span className="text-xl">Mostrar partidas encerradas?</span>
                <Switch className="data-[state=unchecked]:bg-zinc-500" checked={filteredResults} onCheckedChange={() => { setFilteredResults(!filteredResults) }} />
            </div>
            <div>
                {
                    championship.fixtures.map(fixture => {
                        if (fixture.championshipId.includes(championship.slug)) {
                            if(fixture.isFinished == filteredResults) {
                                return (
                                    <MatchCard key={fixture.id} fixture={fixture} user={user} />
                                )
                            }
                        }
                    })
                }
            </div>
        </main>
    )
}