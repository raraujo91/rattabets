'use client'

import { GiRat } from "react-icons/gi"
import { useRef } from "react"

export default function Loading({ action }) {
    const getWindowTop = useRef(window.visualViewport.pageTop)

    return (
        <div style={{ top: `${getWindowTop.current}px` }} className={`absolute flex flex-col items-center justify-center left-0 w-full min-h-screen text-3xl bg-[rgba(0,0,0,0.95)] backdrop-blur-sm`}>
            <GiRat  size={128} />
            <span>
                { action }
            </span>
        </div>
    )
}