import { IoArrowBack, IoInformationCircle } from "react-icons/io5";
import { Button } from "../../components"
import { useNavigate } from "react-router-dom"

type PageLayoutProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    notice?: string;
    buttonLabel?: string;
    navigateTo?: "/" | "/review" | "/draft"
    previousPage?: "/" | "/review" | "/draft"
    onButtonClick?: () => void;
    classname?: string;
    buttonDisabled?: boolean;
}

export const PageLayout = ({ title, subtitle, children, notice, buttonLabel, navigateTo, previousPage, onButtonClick, classname, buttonDisabled }: PageLayoutProps) => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        if (onButtonClick) {
            onButtonClick();
        } else if (navigateTo) {
            navigate(navigateTo);
        }
    }

    const handlePreviousPage = () => {
        previousPage && navigate(previousPage)
    }

    return (
        <div className={`w-full max-w-5xl mx-auto py-16 px-6 ${classname}`}>
            {previousPage &&
                <button
                    onClick={handlePreviousPage}
                    className="group flex items-center gap-2 mb-12 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                    <span className="p-2 rounded-lg bg-surface-elevated border border-border group-hover:border-accent/30 transition-colors">
                        <IoArrowBack className="text-lg" />
                    </span>
                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Back</span>
                </button>
            }

            <div className="space-y-3 mb-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">{title}</h2>
                {subtitle && <p className="text-sm sm:text-[16px] md:text-lg text-text-secondary leading-relaxed">{subtitle}</p>}
            </div>
            {children}
            {notice &&
                <div className="mt-2 text-accent-muted  flex items-start justify-center gap-x-3">
                    <IoInformationCircle className="text-xl text-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary leading-relaxed">{notice}</p>
                </div>
            }
            {buttonLabel && <div className="flex justify-end mt-8">
                <Button label={buttonLabel} onClick={handleButtonClick} disabled={buttonDisabled} />
            </div>}
        </div>
    )
}