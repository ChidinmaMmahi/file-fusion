import { useFileStore } from "../../store";

type TextAreaProps = {
    label: string;
    placeholder?: string;
    extraClassnames?: string;
}

export const TextArea = ({ label, placeholder, extraClassnames }: TextAreaProps) => {
    const note = useFileStore((state) => state.note);
    const setNote = useFileStore((state) => state.setNote);

    const wordCount = note.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className={`${extraClassnames}`}>
            <label htmlFor="extra-note" className="text-xl font-medium">{label}</label>
            <div className="bg-gray-200 rounded-xl p-6 pb-2 mt-3">
                <textarea name=""
                    rows={6}
                    id="extra-note"
                    className="w-full focus:outline-none resize-none"
                    placeholder={placeholder}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <p className="text-end text-sm">WORD COUNT: {wordCount}</p>
            </div>
        </div>
    )
}