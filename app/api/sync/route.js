import { NextResponse } from "next/server"
import { rule } from "postcss"

export async function GET(request) {
    // const json = await request.json()

    const fixturesResponse = await fetch('http://localhost:7000/fixtures?isSynced=false', {
        cache: 'no-store'
    })

    const listOfFixtures = await fixturesResponse.json()

    const fixtureIds = listOfFixtures.map(fixture => fixture.id)

    const betsResponse = await fetch(`http://localhost:7000/bets?fixtureId=${fixtureIds.toString()}`, {
        cache: "no-store"
    })

    const listOfBets = await betsResponse.json()

    // console.log(listOfBets)

    const rulesResponse = await fetch('http://localhost:7000/rules')

    const listOfRules = await rulesResponse.json()

    let finalResult = (home, away) => {
        let scoreResult = home - away

        if (scoreResult > 0) {
            return { result: "home", score: [home, away], difference: scoreResult }
        }

        if (scoreResult == 0) {
            return { result: "draw", score: [home, away], difference: scoreResult }
        }

        if (scoreResult < 0) {
            return { result: "away", score: [home, away], difference: Math.abs(scoreResult) }
        }
    }

    let syncedFixtures = listOfFixtures.map(fixture => {

        let gameResult = finalResult(fixture.score[0], fixture.score[1])

        let betResults = listOfBets.map(bet => {
            let betResult = finalResult(bet.homeScore, bet.awayScore)
            let betCalcs = {
                id: bet.id,
                totalPoints: 0,
                correctChoices: []
            }

            // PLACAR EXATO
            if (betResult.score[0] == gameResult.score[0] && betResult.score[1] == gameResult.score[1]) {
                let bullseye = listOfRules.find(rule => rule.keyword == "bullseye")
                betCalcs.totalPoints += bullseye.points
                betCalcs.correctChoices.push("bullseye")
                if (betResult.difference > 3) {
                    betCalcs.totalPoints += 5
                    betCalcs.correctChoices.push("threeGoalsDifference")
                }
            }

            if (!betCalcs.correctChoices.includes("bullseye")) {
                listOfRules.forEach(rule => {
                    if (rule.type == "score") {
                        switch (rule.keyword) {
                            // EMPATE
                            case "draw":
                                if (gameResult.result == "draw" && gameResult.result == betResult.result) {
                                    betCalcs.totalPoints += 4
                                    betCalcs.correctChoices.push("draw")
                                };
                                break;
                            // VENCEDOR
                            case "winner":
                                if (gameResult.result != "draw" && gameResult.result == betResult.result) {
                                    betCalcs.totalPoints += 4
                                    betCalcs.correctChoices.push("winner")

                                    // GOLS DO VENCEDOR 
                                    if (gameResult.result == "home" && gameResult.score[0] == betResult.score[0]) {
                                        betCalcs.totalPoints += 6
                                        betCalcs.correctChoices.push("winnerGoals")
                                    }

                                    if (gameResult.result == "away" && gameResult.score[1] == betResult.score[1]) {
                                        betCalcs.totalPoints += 6
                                        betCalcs.correctChoices.push("winnerGoals")
                                    }

                                    // GOLS DO PERDEDOR 
                                    if (gameResult.result == "home" && gameResult.score[1] == betResult.score[1]) {
                                        betCalcs.totalPoints += 4
                                        betCalcs.correctChoices.push("loserGoals")
                                    }

                                    if (gameResult.result == "away" && gameResult.score[0] == betResult.score[0]) {
                                        betCalcs.totalPoints += 4
                                        betCalcs.correctChoices.push("loserGoals")
                                    }
                                };
                                break;
                        }
                    }
                    
                    if (rule.type == "overUnder") {
                        let checkOverUnder = fixture[rule.keyword] > rule.defaultSpread ? "over" : "under"
                        switch (checkOverUnder) {
                            case "over":
                                if (checkOverUnder == bet[rule.keyword]) {
                                    betCalcs.totalPoints += rule.pointsOver
                                    betCalcs.correctChoices.push(rule.keyword)
                                } else {
                                    betCalcs.totalPoints -= rule.pointsUnder/2
                                }
                                break;
                            case "under":
                                if (checkOverUnder == bet[rule.keyword]) {
                                    betCalcs.totalPoints += rule.pointsUnder
                                    betCalcs.correctChoices.push(rule.keyword)
                                } else {
                                    betCalcs.totalPoints -= rule.pointsOver/2
                                }
                                break;
                        } 
                    }
                })
            }

            // TODO: Implementar logica de PENALTIS
            return betCalcs;

        })

        // betResults.forEach(bet => {
        //     fetch(`http://localhost:7000/bets/${bet.id}`, {
        //         method: 'PUT',
        //         body: JSON.stringify({
        //             totalPoints: bet.totalPoints,
        //             synced: true
        //         })
        //     })
        // })

        // fetch(`http://localhost:7000/fixtures/${fixture.id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify({
        //         isSynced: true
        //     })
        // })

        return {
            id: fixture.id,
            bets: betResults
        }
    })

    return NextResponse.json(
        {
            syncedFixtures,
            sync: listOfBets.length == 0 ? false : true
        }
    )
}