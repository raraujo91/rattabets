'use client'

import { useRouter } from "next/navigation";
import { FlagIcon } from "react-flag-kit"
import { Card } from "../ui/card"
import { useLoadingContext } from "@/context/loading";

export default function MatchCard({ fixture, user }) {
    const router = useRouter()
    const { setLoading } = useLoadingContext()

    const betScore = fixture.bets.length > 0 ? fixture.bets.find(bet => bet.userId.id == user?.id) : false;

    let flagSize = 32;

    let matchDate = new Date(fixture.startsAt)
    let dateFormatted = `${String(matchDate.getDate()).padStart(2, '0')}/${String(matchDate.getMonth() + 1).padStart(2, '0')}`
    let hourFormatted = `${matchDate.getHours()}:${String(matchDate.getMinutes()).padStart(2, '0')}`

    const handleOnClick = () => {
        setLoading(true)
        router.push(`fixtures/${fixture.championshipId}/${fixture.gameId}`)
    }

    return (
        <Card onClick={handleOnClick} key={fixture.id} className="bg-card-light my-2 p-6 active:bg-slate-400 hover:cursor-pointer hover:bg-slate-200">
            <div className="flex text-background space-x-4 items-center">
                <div className="flex flex-col items-center">
                    <div className="bg-zinc-900 p-1 rounded-md w-full align-middle text-center">
                        <p className="text-zinc-100 text-sm font-bold">J{fixture.gameId}</p>
                    </div>
                    <div className="font-light">{dateFormatted}</div>
                    <div className="font-bold">{hourFormatted}</div>
                </div>
                <div className="w-full text-xl space-y-2">
                    <div className="flex justify-between">
                        <div className="flex space-x-2">
                            <a className="flex items-center justify-center"><FlagIcon className="rounded-lg h-full" code={fixture.homeTeam.flag} size={flagSize} /></a>
                            <a>{fixture.homeTeam.name}</a>
                        </div>
                        <div className="w-12">
                            <div className="flex font-bold space-x-2 items-center justify-between w-full">
                                {betScore && <a className="bg-secondary rounded-sm text-center text-slate-100 w-6">{betScore.homeScore}</a>}
                                <a>{fixture.score[0]}</a>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex space-x-2">
                            <a className="flex items-center justify-center"><FlagIcon className="rounded-lg h-full" code={fixture.awayTeam.flag} size={flagSize} /></a>
                            <a>{fixture.awayTeam.name}</a>
                        </div>
                        <div className="w-12">
                            <div className="flex font-bold space-x-2 items-center justify-between w-full">
                                {betScore && <a className="bg-secondary rounded-md text-center text-slate-100 w-6">{betScore.awayScore}</a>}
                                <a>{fixture.score[1]}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}