import { GoPlus } from "react-icons/go"
import { PageLayout } from "../shared"
import { addFilesToApp } from "../../lib"
import { useRef } from "react";
import { SourcesReviewAccordion } from "./SourceReviewAccordion";
import { useFileStore } from "../../store";

export const SourcesReview = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const note = useFileStore((state) => state.note);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        addFilesToApp(fileList);
    };

    return (
        <PageLayout
            title="Review Sources"
            subtitle="Take a quick look to be sure everything is fine before generating your draft"
            buttonLabel="Generate Draft"
            navigateTo="/draft"
            previousPage="/"
            notice="Sources with errors will be skipped. You can also maunally reorder files"
        >
            <section>
                <div className="flex justify-between items-center mb-10">
                    <h3>Source list</h3>
                    <button className="flex items-center border px-5 py-2.5 rounded-full gap-x-3 cursor-pointer"
                        onClick={() => inputRef.current?.click()}>
                        Add another file <GoPlus className="text-xl" />
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </div>
                <SourcesReviewAccordion />
            </section>

            {note && (
                <section className="mt-10">
                    <h3 className="mb-4">Pasted Text</h3>
                    <div className="rounded-lg bg-gray-100 shadow p-4">
                        <pre className="text-gray-700 whitespace-pre-wrap">{note}</pre>
                    </div>
                </section>
            )}
        </PageLayout>
    )
}