import { AiFillFile } from "react-icons/ai"

export const Header = () => {
    return (
        <header className="py-7">
            <div className="text-blue-900 flex items-center gap-x-2">
                <AiFillFile className="text-2xl" />
                <h1 className="text-3xl">DocsWeaver</h1>
            </div>
        </header>
    )
}