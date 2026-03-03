type ButtonProps = {
    label: string
    extraClassnames?: string
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button = ({ label, extraClassnames, onClick, variant = 'primary' }: ButtonProps) => {
    const baseStyles = "relative px-7 py-3.5 rounded-full font-medium text-base cursor-pointer overflow-hidden transition-all duration-300 ease-out"

    const variants = {
        primary: "bg-gradient-to-r from-accent to-accent-hover text-base hover:shadow-lg hover:shadow-accent/20 active:translate-y-0",
        secondary: "bg-surface-elevated text-text-primary border border-border hover:border-accent/50 hover:bg-surface-glass",
        ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${extraClassnames}`}
            onClick={onClick}
        >
            {label}
        </button>
    )
}