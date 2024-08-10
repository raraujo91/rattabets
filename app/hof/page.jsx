import { Card, CardTitle } from "@/components/ui/card";
import { GiRat } from "react-icons/gi";

export default function HallOfFame() {
    const ranking = {
        users: [
            {
                name: "Renan",
                titles: ["Copa do Mundo 2018", "Eurocopa 2024"]
            },
            {
                name: "Luiz",
                titles: ["Copa America 2024", "Jogos Olimpicos 2024"]
            },
            {
                name: "Vinicius",
                titles: ["Copa do Mundo 2022"]
            },
            {
                name: "Fellipe",
                titles: []
            },
            {
                name: "Leandro",
                titles: []
            }
        ]
    };

    return (
        <main className="h-screen flex items-center justify-center">
            <section>
                <div className="flex justify-center pb-4">
                    <GiRat size={48} /><p className="text-4xl"><b>rattabets.</b></p>
                </div>
                <Card className="p-4 w-[400px]">
                    <CardTitle className="pb-4 text-3xl font-bold">Hall da Fama</CardTitle>
                    {
                        ranking.users.map((user, i) => {
                            return (
                                <div key={i} className="flex flex-col my-4">
                                    <div className="flex justify-between font-bold pb-1 text-xl">
                                        <span>{user.name}</span>
                                        <span>{user.titles.length}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        {
                                            user.titles.map((title, i) => {
                                                return (
                                                    <span key={i}>🏆 {title}</span>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </Card>
            </section>
        </main>

    )
}