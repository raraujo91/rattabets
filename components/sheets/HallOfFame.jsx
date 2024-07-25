'use client'

import { Button } from "../ui/button"
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet"

export default function HallOfFame() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Hall da Fama</Button>
            </SheetTrigger>
            <SheetContent>
                <div>
                    
                </div>
            </SheetContent>
        </Sheet>
    )
}
