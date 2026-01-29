'use client'

import { Around } from "@theme-toggles/react"
import "@theme-toggles/react/css/Around.css"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react"

export default function ThemeToggle() {
    const [dark, setDark] = useState(false)
    
    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [dark])
    
    return (
        // @ts-ignore
        <Around 
            duration={750}
            toggled={dark}
            toggle={() => setDark(!dark)}
            className="text-gray-800 dark:text-gray-200 pr-3"
            style={{ fontSize: '27px' }}
        />
    )
}