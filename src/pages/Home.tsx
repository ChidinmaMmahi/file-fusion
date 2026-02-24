import { FileUpload, PageLayout, TextArea } from "./shared"

export const Home = () => {
    return (
        <PageLayout
            title="Add your sources"
            subtitle="Upload files or paste text. We'll combine everything into one document"
            buttonLabel="Review sources"
            navigateTo="/review"
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