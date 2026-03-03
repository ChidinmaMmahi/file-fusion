import { useEffect, useState } from "react";
import { useFileStore } from "../store";
import { getFileFromDB, readFileContent } from "../lib";
import { PageLayout } from "./shared";
import { RichTextEditor, DownloadModal } from "../components";

export const DraftModification = () => {
    const files = useFileStore((state) => state.files);
    const note = useFileStore((state) => state.note);
    const sourceOrder = useFileStore((state) => state.sourceOrder);

    const [htmlContent, setHtmlContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    useEffect(() => {
        const compileContent = async () => {
            try {
                const htmlParts: string[] = [];

                let orderedItems = sourceOrder.length > 0
                    ? sourceOrder.filter((item) => {
                        if (item.type === "note") return note.trim().length > 0;
                        return files.some((f) => f.name === item.name);
                    })
                    : [
                        ...files.map((f) => ({ type: "file" as const, name: f.name, size: f.size })),
                        ...(note.trim() ? [{ type: "note" as const }] : []),
                    ];

                for (const item of orderedItems) {
                    if (item.type === "note") {
                        htmlParts.push(`<h2>Additional Notes</h2>`);
                        const paragraphs = note
                            .split(/\n\n+/)
                            .map(p => p.trim())
                            .filter(p => p.length > 0)
                            .map(p => `<p>${p.replace(/\n/g, "<br />")}</p>`)
                            .join("");
                        htmlParts.push(paragraphs);
                    } else {
                        const fileObj = await getFileFromDB(item.name);
                        if (fileObj) {
                            const content = await readFileContent(fileObj);

                            htmlParts.push(`<h2>${content.fileName}</h2>`);

                            if (content.type === "image") {
                                htmlParts.push(`<p><img src="${content.content}" alt="${content.fileName}" style="max-width: 100%; height: auto;" /></p>`);
                            } else {
                                const paragraphs = content.content
                                    .split(/\n\n+/)
                                    .map(p => p.trim())
                                    .filter(p => p.length > 0)
                                    .map(p => `<p>${p.replace(/\n/g, "<br />")}</p>`)
                                    .join("");
                                htmlParts.push(paragraphs);
                            }
                        }
                    }
                }

                const compiledHtml = htmlParts.join("");

                setHtmlContent(compiledHtml);
                setIsLoading(false);
            } catch (err) {
                console.error("Error compiling content:", err);
                setError(err instanceof Error ? err.message : "Failed to compile content");
                setIsLoading(false);
            }
        };

        compileContent();
    }, [files, note, sourceOrder]);

    const handleDownloadClick = () => {
        setIsDownloadModalOpen(true);
    };

    if (isLoading) {
        return (
            <PageLayout
                title="Generating Draft"
                subtitle="Compiling your sources..."
                buttonLabel="Download"
                onButtonClick={handleDownloadClick}
                previousPage="/review"
            >
                <div className="flex flex-col justify-center items-center py-20">
                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-text-muted text-sm">Weaving your documents together...</p>
                </div>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout
                title="Error"
                subtitle="Something went wrong"
                buttonLabel="Try Again"
                navigateTo="/review"
                previousPage="/review"
            >
                <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    {error}
                </div>
            </PageLayout>
        );
    }

    return (
        <>
            <PageLayout
                title="Your Draft"
                subtitle="Review and edit your compiled document"
                buttonLabel="Download"
                onButtonClick={handleDownloadClick}
                previousPage="/review"
            >
                {htmlContent ? (
                    <RichTextEditor
                        content={htmlContent}
                        onChange={(html) => setHtmlContent(html)}
                    />
                ) : (
                    <div className="text-center py-16 text-text-muted">
                        <p className="text-lg">No content to display</p>
                        <p className="text-sm mt-1">Please add some files or text to get started</p>
                    </div>
                )}
            </PageLayout>

            <DownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                htmlContent={htmlContent}
            />
        </>
    );
};
