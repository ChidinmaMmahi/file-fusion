import { HiOutlinePlus } from "react-icons/hi2"
import { PageLayout } from "../shared"
import { addFilesToApp } from "../../lib"
import { SourcesReviewAccordion } from "./SourceReviewAccordion";
import { useFileStore } from "../../store";

export const SourcesReview = () => {
    const files = useFileStore((state) => state.files);

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
            notice="Sources with errors will be skipped. You can also manually reorder files"
            buttonDisabled={files.length === 0}
        >
            <section>
                <div className="flex justify-end items-center mb-8">
                    <label htmlFor="file-upload"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-accent/50 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                        <HiOutlinePlus className="text-lg" />
                        <span className="text-sm font-medium">Add file</span>
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            multiple
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </label>
                </div>
                <SourcesReviewAccordion />
            </section>
        </PageLayout>
    )
}