import { IoArrowBack, IoInformationCircle } from "react-icons/io5";
import { Button } from "../../components"
import { useNavigate } from "react-router-dom"

type PageLayoutProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    notice?: string;
    buttonLabel: string;
    navigateTo?: "/" | "/review" | "/draft"
    previousPage?: "/" | "/review" | "/draft"
}

export const PageLayout = ({ title, subtitle, children, notice, buttonLabel, navigateTo, previousPage }: PageLayoutProps) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        if (navigateTo) navigate(navigateTo)
    }

    const handlePreviousPage = () => {
        previousPage && navigate(previousPage)
    }

    return (
        <div className="w-full max-w-lg mx-auto py-12 ">
            {previousPage &&
                <div className="bg-gray-100 p-2.5 inline-flex rounded-full cursor-pointer mb-10" onClick={handlePreviousPage}>
                    <IoArrowBack className="text-xl" />
                </div>
            }
            <div className="space-y-1 mb-7">
                <h2 className="text-2xl font-medium">{title}</h2>
                {subtitle && <p className="text-lg">{subtitle}</p>}
            </div>
            {children}
            <div className="mt-20">
                {notice &&
                    <p className="mb-5 flex items-start justify-center gap-x-2">
                        <IoInformationCircle className="text-2xl" />
                        {notice}
                    </p>
                }
                <Button label={buttonLabel} onClick={handleNavigate} extraClassnames="w-full" />
            </div>
        </div>
    )
}