import { useEffect, useRef } from "react"
import { useTheme } from "../context/ThemeContext"

export function MouseGlow() {
    const ref = useRef<HTMLDivElement>(null)
    const { theme } = useTheme()

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const onMove = (e: MouseEvent) => {
            el.style.left = `${e.clientX}px`
            el.style.top = `${e.clientY}px`
            el.style.opacity = "1"
        }

        const onLeave = () => {
            el.style.opacity = "0"
        }

        window.addEventListener("mousemove", onMove)
        document.addEventListener("mouseleave", onLeave)
        return () => {
            window.removeEventListener("mousemove", onMove)
            document.removeEventListener("mouseleave", onLeave)
        }
    }, [])

    const glowColor =
        theme === "dark"
            ? "rgba(212, 165, 116, 0.12)"
            : "rgba(160, 110, 50, 0.18)"

    return (
        <div
            ref={ref}
            style={{
                position: "fixed",
                pointerEvents: "none",
                width: 500,
                height: 500,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${glowColor} 0%, ${glowColor.replace(/[\d.]+\)$/, "0.04)")} 40%, transparent 70%)`,
                transform: "translate(-50%, -50%)",
                opacity: 0,
                zIndex: 9999,
                transition: "opacity 0.3s ease",
                filter: "blur(30px)",
            }}
        />
    )
}
