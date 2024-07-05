'use client'

import { GiRat } from "react-icons/gi"

export default function Loading({ state, action }) {
    return (
        <div className={`${ state ? '' : 'hidden' } absolute flex flex-col items-center justify-center left-0 top-0 w-full min-h-screen text-3xl bg-[rgba(0,0,0,0.95)] backdrop-blur-sm`}>
            <GiRat  size={128} />
            <span>
                { action }
            </span>
        </div>
    )
}