import { Button } from "@/components/ui/button"
import { GiRat } from "react-icons/gi";
import { Toaster } from "@/components/ui/toaster";
import HeroCard from "@/components/forms/HeroCard";
import Link from "next/link";

export default function Layout({ children  }) {

  const hero = {
    "id": "0393b4a0-73dd-4b9f-99d5-412df20067b0",
    "name": "Florian Wirtz",
    "slug": "wirtz",
    "power": 0.2,
    "packed": false
  }

  return (
    <>
      <div className="relative px-4">
        <nav className="p-4 flex justify-between items-center">
          <div>
            <Link className="flex items-center space-x-1" href="/lobby/fixtures">
              <GiRat /><p><b>rattabets.</b></p>
            </Link>
          </div>
          <Button variant="ghost">Sair</Button>
        </nav>
        <main>{children}</main>
      </div>
      <Toaster />
      <HeroCard hero={hero} />
    </>
  )
}