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
            <label htmlFor="extra-note" className="text-lg font-medium text-text-primary flex items-center gap-2">
                {label}
            </label>
            <div className="mt-4 rounded-xl bg-surface-elevated border border-border p-5 transition-colors focus-within:border-accent/50">
                <textarea
                    rows={5}
                    id="extra-note"
                    className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none resize-none leading-relaxed"
                    placeholder={placeholder}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex justify-end pt-3 border-t border-border mt-3">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                </div>
            </div>
        </div>
    )
}