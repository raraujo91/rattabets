import { Button } from "@/components/ui/button"
import { GiRat } from "react-icons/gi";
import { Toaster } from "@/components/ui/toaster";

import Link from "next/link";

export default function Layout({ children  }) {

  return (
    <>
      <div className="relative px-4">
        <nav className="p-4 flex justify-between items-center">
          <div>
            <Link className="flex items-center space-x-1" href="/lobby/fixtures">
              <GiRat /><p><b>rattabets.</b></p>
            </Link>
          </div>
          <form action="/api/logout" method="POST">
            <Button type="submit" variant="ghost">Sair</Button>
          </form>
        </nav>
        <main>{children}</main>
      </div>
      <Toaster />
    </>
  )
}