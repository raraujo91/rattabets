'use client'
import { useRouter } from "next/navigation";
import { Card } from "../ui/card"
import { FlagIcon } from "react-flag-kit"

export default function MatchCard({ fixture, user }) {
    const router = useRouter()

    const betScore = fixture.bets.length > 0 ? fixture.bets.find(bet => bet.userId == user?.id) : false;

    console.log(fixture.gameId, betScore)

    let flagSize = 28;

    let matchDate = new Date(fixture.startsAt)
    let dateFormatted = `${matchDate.getDate()}/${String(matchDate.getMonth() + 1).padStart(2, '0')}`
    let hourFormatted = `${matchDate.getHours()}:${String(matchDate.getMinutes()).padStart(2, '0')}`

    return (
        <Card onClick={() => router.push(`fixtures/${fixture.championshipId}/${fixture.gameId}`)} key={fixture.id} className="bg-card-light my-2 p-8 active:bg-slate-400 hover:cursor-pointer">
            <div className="flex text-background space-x-4 items-center">
                <div className="flex flex-col items-center">
                    <div className="font-light">{dateFormatted}</div>
                    <div className="font-bold">{hourFormatted}</div>
                </div>
                <div className="w-full text-xl space-y-2">
                    <div className="flex justify-between">
                        <div className="flex space-x-2">
                            <FlagIcon className="rounded-full" code={fixture.homeTeam.flag} size={flagSize} />
                            <a>{fixture.homeTeam.name}</a>
                        </div>
                        <div>
                            <div className="flex font-bold space-x-2 justify-between">
                                {betScore && <a className="bg-secondary rounded-sm text-center text-slate-100 w-6">{betScore.homeScore}</a>}
                                <a>{fixture.score[0]}</a>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex space-x-2">
                            <FlagIcon className="rounded-full" code={fixture.awayTeam.flag} size={flagSize} />
                            <a>{fixture.awayTeam.name}</a>
                        </div>
                        <div className="flex font-bold space-x-2 justify-between">
                            {betScore && <a className="bg-secondary rounded-md text-center text-slate-100 w-6">{betScore.awayScore}</a>}
                            <a>{fixture.score[1]}</a>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}