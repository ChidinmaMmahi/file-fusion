import { HiOutlineDocumentDuplicate } from "react-icons/hi2"

export const Header = () => {
    return (
        <header className="relative border-b border-border">
            <div className="max-w-7xl mx-auto p-6 flex items-center gap-x-3">
                <div className="p-2 rounded-xl bg-accent-muted">
                    <HiOutlineDocumentDuplicate className="text-2xl text-accent" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                    File Fusion
                </h1>
            </div>
        </header>
    )
}