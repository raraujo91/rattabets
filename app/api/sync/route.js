import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const revalidate = 0

export async function GET(request) {

    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const championship = searchParams.get('championship')

    const supabase = createClient()

    const { data: fixtures, error: fixturesError, status } = await supabase.from('fixtures').select('*, championshipId(*, heros(*)), bets(*)').eq('isSynced', false).eq('isFinished', true).eq('gameId', Number(gameId)).eq('championshipId', championship)

    if (fixturesError) {
        return NextResponse.json({ failedAt: "fixtures", error: fixturesError }, { status })
    }

    if(fixtures.length == 0) {
        return NextResponse.json({ failedAt: "emptyFixtures", data: fixtures }, { status })
    }

    const { data: rules, error: rulesError } = await supabase.from('rules').select()

    if (rulesError) {
        return NextResponse.json({ failedAt: "rules", error: rulesError }, { status })
    }

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

    let syncedFixtures = fixtures.map(fixture => {

        let gameResult = finalResult(fixture.score[0], fixture.score[1])

        let betResults = fixture.bets.map(bet => {
            let betResult = finalResult(bet.homeScore, bet.awayScore)
            let betCalcs = {
                id: bet.id,
                points: 0,
                correctChoices: []
            }

            // PLACAR EXATO
            if (betResult.score[0] == gameResult.score[0] && betResult.score[1] == gameResult.score[1]) {
                let bullseye = rules.find(rule => rule.keyword == "bullseye")
                betCalcs.points += bullseye.points
                betCalcs.correctChoices.push("bullseye")
                if (betResult.difference > 3) {
                    betCalcs.points += 5
                    betCalcs.correctChoices.push("threeGoalsDifference")
                }
            }

            if (!betCalcs.correctChoices.includes("bullseye")) {
                rules.forEach(rule => {
                    if (rule.type == "score") {
                        switch (rule.keyword) {
                            // EMPATE
                            case "draw":
                                if (gameResult.result == "draw" && gameResult.result == betResult.result) {
                                    betCalcs.points += 4
                                    betCalcs.correctChoices.push("draw")
                                };
                                break;
                            // VENCEDOR
                            case "winner":
                                if (gameResult.result != "draw" && gameResult.result == betResult.result) {
                                    betCalcs.points += 4
                                    betCalcs.correctChoices.push("winner")

                                    // GOLS DO VENCEDOR 
                                    if (gameResult.result == "home" && gameResult.score[0] == betResult.score[0]) {
                                        betCalcs.points += 6
                                        betCalcs.correctChoices.push("winnerGoals")
                                    }

                                    if (gameResult.result == "away" && gameResult.score[1] == betResult.score[1]) {
                                        betCalcs.points += 6
                                        betCalcs.correctChoices.push("winnerGoals")
                                    }

                                    // GOLS DO PERDEDOR 
                                    if (gameResult.result == "home" && gameResult.score[1] == betResult.score[1]) {
                                        betCalcs.points += 4
                                        betCalcs.correctChoices.push("loserGoals")
                                    }

                                    if (gameResult.result == "away" && gameResult.score[0] == betResult.score[0]) {
                                        betCalcs.points += 4
                                        betCalcs.correctChoices.push("loserGoals")
                                    }
                                };
                                break;
                        }
                    }

                })
            }

            rules.map(rule => {
                if (rule.type == "overUnder") {
                    let checkOverUnder = fixture[rule.keyword] > rule.defaultSpread ? "over" : "under"
                    switch (checkOverUnder) {
                        case "over":
                            if (checkOverUnder == bet[rule.keyword]) {
                                betCalcs.points += rule.pointsOver
                                betCalcs.correctChoices.push(rule.keyword)
                            } else {
                                if(rule.keyword == "freeKickGoals") {
                                    betCalcs.points -= rule.pointsUnder
                                } else {
                                    betCalcs.points -= rule.pointsUnder / 2
                                }
                            }
                            break;
                        case "under":
                            if (checkOverUnder == bet[rule.keyword]) {
                                betCalcs.points += rule.pointsUnder
                                betCalcs.correctChoices.push(rule.keyword)
                            } else {
                                if(rule.keyword == "freeKickGoals") {
                                    betCalcs.points -= rule.pointsOver - 4
                                } else {
                                    betCalcs.points -= rule.pointsOver / 2
                                }
                            }
                            break;
                    }
                }
            })

            /*
                TODO: prorrogação ou penaltis
                    - Se mata-mata = TRUE
                        - Se terminou em (OU) 
                            - AET
                            - PK
                    - Se apostador foi de empate
                        -  +5 pontos
                    - Se apostador for de casa/fora
                        - E vencedor for o mesmo da prorrogação
                            - +3 pontos
            */ 

            // FIX LOGIC FOR PLUS POINTS AFTER OT

            if(fixture.isPlayoff == true) {
                if(fixture.endedIn == "OT" || fixture.endedIn == "PK") {
                    if(betResult == "draw" && fixture.finalResult ==  "draw" && bet.postRegulationResult == fixture.postRegulationResult) {
                        betCalcs.points += 5
                    }

                    if(betResult == "home" || betResult == "away" && fixture.postRegulationResult == betResult) {
                        betCalcs.points += 3
                    }
                }
            }

            if(bet.isHeroUsed) {
                let heroMetadata = fixture.championshipId.heros.find(hero => hero.id == bet.heroId)
                betCalcs.points = Math.ceil(betCalcs.points * heroMetadata.power)
            }

            return betCalcs;

        })

        return {
            id: fixture.id,
            bets: betResults
        }
    })

    let [syncedFixture] = syncedFixtures

    const { error: bulkUpdateError } = await supabase.from('bets').upsert(syncedFixture.bets)

    if (bulkUpdateError) {
        return NextResponse.json({ failedAt: "bulkUpdate", error: bulkUpdateError }, { status })
    }

    const { data: fixtureUpdate, error: fixtureUpdateError } = await supabase.from('fixtures').update({ isSynced: true }).eq('id', syncedFixture.id)

    if (fixtureUpdateError) {
        return NextResponse.json({ failedAt: "fixtureUpdate", error: fixtureUpdateError }, { status })
    }

    return NextResponse.json(
        {
            syncedFixture,
            sync: !!fixtureUpdate
        }
    )
}