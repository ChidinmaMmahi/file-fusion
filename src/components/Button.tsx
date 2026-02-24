type ButtonProps = {
    label: string
    extraClassnames?: string
    onClick?: () => void;
}

export const Button = ({ label, extraClassnames, onClick }: ButtonProps) => {
    return (
        <button className={`bg-gray-950/85 text-white px-7 py-3 rounded-2xl text-lg cursor-pointer ${extraClassnames}`} onClick={onClick}>{label}</button>
    )
}