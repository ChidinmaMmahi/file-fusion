import { FileUpload, PageLayout, TextArea } from "./shared"
import { useFileStore } from "../store"

export const Home = () => {
    const files = useFileStore((state) => state.files);

    return (
        <PageLayout
            title="Add your sources"
            subtitle="Upload files or paste text. We'll combine everything into one document"
            buttonLabel="Review sources"
            navigateTo="/review"
            buttonDisabled={files.length === 0}
        >
            <FileUpload />
            <TextArea
                label="Paste text (Optional)"
                placeholder="Notes, emails,copied sections, anything relevant"
                extraClassnames="mt-14"
            />
        </PageLayout>
    )
}