import { HiOutlineDocumentDuplicate } from "react-icons/hi2"
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2"
import { useTheme } from "../context/ThemeContext"

export const Header = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="relative border-b border-border">
            <div className="max-w-7xl mx-auto p-6 flex items-center gap-x-3">
                <div className="p-2 rounded-xl bg-accent-muted">
                    <HiOutlineDocumentDuplicate className="text-2xl text-accent" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                    Docs Weaver
                </h1>
                <button
                    onClick={toggleTheme}
                    className="ml-auto p-2 rounded-xl border border-border hover:border-border-accent hover:bg-accent-muted cursor-pointer"
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                    {theme === "dark" ? (
                        <HiOutlineSun className="text-xl text-accent" />
                    ) : (
                        <HiOutlineMoon className="text-xl text-accent" />
                    )}
                </button>
            </div>
        </header>
    )
}
