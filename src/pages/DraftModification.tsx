import { useEffect, useState } from "react";
import { useFileStore } from "../store";
import { getFileFromDB, readFileContent } from "../lib";
import { PageLayout } from "./shared";
import { RichTextEditor } from "../components";

export const DraftModification = () => {
    const files = useFileStore((state) => state.files);
    const note = useFileStore((state) => state.note);

    const [htmlContent, setHtmlContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const compileContent = async () => {
            try {
                const htmlParts: string[] = [];

                // Read all files in order
                for (const fileMeta of files) {
                    const fileObj = await getFileFromDB(fileMeta.name);
                    if (fileObj) {
                        const content = await readFileContent(fileObj);

                        // Add section header
                        htmlParts.push(`<h2>${content.fileName}</h2>`);

                        if (content.type === "image") {
                            // Add image inline
                            htmlParts.push(`<p><img src="${content.content}" alt="${content.fileName}" style="max-width: 100%; height: auto;" /></p>`);
                        } else {
                            // Convert plain text to HTML paragraphs
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

                // Add pasted text note if exists
                if (note) {
                    htmlParts.push(`<h2>Additional Notes</h2>`);
                    const paragraphs = note
                        .split(/\n\n+/)
                        .map(p => p.trim())
                        .filter(p => p.length > 0)
                        .map(p => `<p>${p.replace(/\n/g, "<br />")}</p>`)
                        .join("");
                    htmlParts.push(paragraphs);
                }

                // Combine all content
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
    }, [files, note]);

    if (isLoading) {
        return (
            <PageLayout
                title="Generating Draft"
                subtitle="Compiling your sources..."
                buttonLabel="Download"
                navigateTo="/draft"
                previousPage="/review"
            >
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Your Draft"
            subtitle="Review and edit your compiled document"
            buttonLabel="Download"
            navigateTo="/draft"
            previousPage="/review"
        >
            {htmlContent ? (
                <RichTextEditor
                    content={htmlContent}
                    onChange={(html) => setHtmlContent(html)}
                />
            ) : (
                <div className="text-center py-10 text-gray-500">
                    No content to display. Please add some files or text.
                </div>
            )}
        </PageLayout>
    );
};
