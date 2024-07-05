'use client'

import { Switch } from "../ui/switch";
import MatchCard from "../cards/MatchCard";
import { useState } from "react";
import Loading from "../misc/Loading";

export default function FilterWrapper({ championship, user }) {
    const [filteredResults, setFilteredResults] = useState(false)
    const [loading, setLoading] = useState(false)

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
                                    <MatchCard key={fixture.id} fixture={fixture} user={user} loadingHandler={setLoading} />
                                )
                            }
                        }
                    })
                }
            </div>
            <Loading action="Carregando..." state={loading} />
        </main>
    )
}