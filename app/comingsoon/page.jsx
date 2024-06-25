import { GiRat } from "react-icons/gi";

export default async function ComingSoon() {
    return (
        <main className="flex min-h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="flex"><GiRat size={48} /><p className="text-4xl"><b>rattabets.</b></p></div>
                <div><p>Um novo site ...só para homens está para chegar</p></div>
            </div>
        </main>
    )
}