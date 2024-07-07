'use client'
import { useLoadingContext } from "@/context/loading"
import { useEffect } from "react"

export default function CleanLoading() {

    const { loading, setLoading } = useLoadingContext()

    useEffect(() => {
        if(loading == true) setLoading(false)
    }, [])
}