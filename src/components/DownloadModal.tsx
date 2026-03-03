import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiOutlineDocumentText, HiOutlineDocument, HiOutlineCodeBracket } from "react-icons/hi2";
import { SiMarkdown } from "react-icons/si";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from "docx";
import jsPDF from "jspdf";
import { Button } from "./Button";

type DownloadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string;
};

type FormatOption = {
    id: string;
    name: string;
    extension: string;
    icon: React.ReactNode;
    description: string;
};

const formatOptions: FormatOption[] = [
    {
        id: "html",
        name: "HTML",
        extension: ".html",
        icon: <HiOutlineCodeBracket className="text-orange-400" />,
        description: "Web page format, preserves all formatting",
    },
    {
        id: "txt",
        name: "Plain Text",
        extension: ".txt",
        icon: <HiOutlineDocument className="text-text-secondary" />,
        description: "Simple text without formatting",
    },
    {
        id: "md",
        name: "Markdown",
        extension: ".md",
        icon: <SiMarkdown className="text-violet-400" />,
        description: "Lightweight markup format",
    },
    {
        id: "docx",
        name: "Word Document",
        extension: ".docx",
        icon: <HiOutlineDocumentText className="text-blue-400" />,
        description: "Microsoft Word format",
    },
    {
        id: "pdf",
        name: "PDF",
        extension: ".pdf",
        icon: <HiOutlineDocumentText className="text-red-400" />,
        description: "Portable Document Format",
    },
];

// Convert HTML to plain text
const htmlToText = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
};

// Convert HTML to Markdown
const htmlToMarkdown = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;

    let markdown = "";

    const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || "";
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }

        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const children = Array.from(node.childNodes).map(processNode).join("");

        switch (tagName) {
            case "h1":
                return `# ${children}\n\n`;
            case "h2":
                return `## ${children}\n\n`;
            case "h3":
                return `### ${children}\n\n`;
            case "p":
                return `${children}\n\n`;
            case "strong":
            case "b":
                return `**${children}**`;
            case "em":
            case "i":
                return `*${children}*`;
            case "u":
                return `<u>${children}</u>`;
            case "s":
            case "strike":
                return `~~${children}~~`;
            case "ul":
                return `${children}\n`;
            case "ol":
                return `${children}\n`;
            case "li":
                const parent = element.parentElement;
                if (parent?.tagName.toLowerCase() === "ol") {
                    const index = Array.from(parent.children).indexOf(element) + 1;
                    return `${index}. ${children}\n`;
                }
                return `- ${children}\n`;
            case "br":
                return "\n";
            case "img":
                const src = element.getAttribute("src") || "";
                const alt = element.getAttribute("alt") || "image";
                return `![${alt}](${src})`;
            default:
                return children;
        }
    };

    markdown = Array.from(div.childNodes).map(processNode).join("");
    return markdown.trim();
};

// Helper to convert base64 data URL to Uint8Array
const base64ToUint8Array = (dataUrl: string): Uint8Array => {
    const base64 = dataUrl.split(",")[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// Helper to get image dimensions from base64
const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            resolve({ width: 400, height: 300 }); // Default dimensions
        };
        img.src = dataUrl;
    });
};

// Parse HTML and create DOCX
const htmlToDocx = async (html: string): Promise<Blob> => {
    const div = document.createElement("div");
    div.innerHTML = html;

    const children: Paragraph[] = [];

    const processElement = async (element: Element): Promise<void> => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent || "";

        switch (tagName) {
            case "h1":
                children.push(
                    new Paragraph({
                        text,
                        heading: HeadingLevel.HEADING_1,
                    })
                );
                break;
            case "h2":
                children.push(
                    new Paragraph({
                        text,
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                break;
            case "h3":
                children.push(
                    new Paragraph({
                        text,
                        heading: HeadingLevel.HEADING_3,
                    })
                );
                break;
            case "p":
                // Check if paragraph contains an image
                const imgInP = element.querySelector("img");
                if (imgInP) {
                    const src = imgInP.getAttribute("src");
                    if (src && src.startsWith("data:")) {
                        try {
                            const dimensions = await getImageDimensions(src);
                            // Scale image to fit within document width (max 500px width)
                            const maxWidth = 500;
                            const scale = dimensions.width > maxWidth ? maxWidth / dimensions.width : 1;
                            const width = Math.round(dimensions.width * scale);
                            const height = Math.round(dimensions.height * scale);

                            children.push(
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: base64ToUint8Array(src),
                                            transformation: { width, height },
                                            type: "png",
                                        }),
                                    ],
                                })
                            );
                        } catch (e) {
                            console.error("Error adding image to DOCX:", e);
                        }
                    }
                    break;
                }

                const runs: TextRun[] = [];
                const processInline = (node: Node): void => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        runs.push(new TextRun(node.textContent || ""));
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        const tag = el.tagName.toLowerCase();
                        const content = el.textContent || "";

                        if (tag === "strong" || tag === "b") {
                            runs.push(new TextRun({ text: content, bold: true }));
                        } else if (tag === "em" || tag === "i") {
                            runs.push(new TextRun({ text: content, italics: true }));
                        } else if (tag === "u") {
                            runs.push(new TextRun({ text: content, underline: {} }));
                        } else if (tag === "s" || tag === "strike") {
                            runs.push(new TextRun({ text: content, strike: true }));
                        } else if (tag === "br") {
                            runs.push(new TextRun({ text: "", break: 1 }));
                        } else {
                            runs.push(new TextRun(content));
                        }
                    }
                };
                Array.from(element.childNodes).forEach(processInline);
                if (runs.length > 0) {
                    children.push(new Paragraph({ children: runs }));
                }
                break;
            case "img":
                const src = element.getAttribute("src");
                if (src && src.startsWith("data:")) {
                    try {
                        const dimensions = await getImageDimensions(src);
                        const maxWidth = 500;
                        const scale = dimensions.width > maxWidth ? maxWidth / dimensions.width : 1;
                        const width = Math.round(dimensions.width * scale);
                        const height = Math.round(dimensions.height * scale);

                        children.push(
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: base64ToUint8Array(src),
                                        transformation: { width, height },
                                        type: "png",
                                    }),
                                ],
                            })
                        );
                    } catch (e) {
                        console.error("Error adding image to DOCX:", e);
                    }
                }
                break;
            case "ul":
            case "ol":
                Array.from(element.children).forEach((li, index) => {
                    const prefix = tagName === "ol" ? `${index + 1}. ` : "• ";
                    children.push(
                        new Paragraph({
                            children: [new TextRun(prefix + (li.textContent || ""))],
                        })
                    );
                });
                break;
            default:
                // Process child elements
                for (const child of Array.from(element.children)) {
                    await processElement(child);
                }
        }
    };

    for (const child of Array.from(div.children)) {
        await processElement(child);
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children,
            },
        ],
    });

    return await Packer.toBlob(doc);
};

// Create PDF from HTML using text-based approach
const htmlToPdf = async (html: string): Promise<Blob> => {
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPosition = margin;

    // Parse HTML
    const div = document.createElement("div");
    div.innerHTML = html;

    const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
        }
    };

    // Helper to add image to PDF
    const addImageToPdf = async (src: string): Promise<void> => {
        if (!src.startsWith("data:")) return;

        try {
            const dimensions = await getImageDimensions(src);
            // Convert to mm (assuming 96 DPI)
            const pxToMm = 0.264583;
            let imgWidth = dimensions.width * pxToMm;
            let imgHeight = dimensions.height * pxToMm;

            // Scale to fit content width if needed
            if (imgWidth > contentWidth) {
                const scale = contentWidth / imgWidth;
                imgWidth = contentWidth;
                imgHeight = imgHeight * scale;
            }

            // Check if we need a new page
            addNewPageIfNeeded(imgHeight + 5);

            // Determine image format
            const format = src.includes("image/png") ? "PNG" : "JPEG";

            pdf.addImage(src, format, margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;
        } catch (e) {
            console.error("Error adding image to PDF:", e);
        }
    };

    const processNode = async (node: Node): Promise<void> => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
                addNewPageIfNeeded(10);
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "normal");
                const lines = pdf.splitTextToSize(text, contentWidth);
                lines.forEach((line: string) => {
                    addNewPageIfNeeded(7);
                    pdf.text(line, margin, yPosition);
                    yPosition += 7;
                });
            }
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
            case "h1":
                addNewPageIfNeeded(15);
                yPosition += 5;
                pdf.setFontSize(22);
                pdf.setFont("helvetica", "bold");
                const h1Text = element.textContent || "";
                const h1Lines = pdf.splitTextToSize(h1Text, contentWidth);
                h1Lines.forEach((line: string) => {
                    addNewPageIfNeeded(10);
                    pdf.text(line, margin, yPosition);
                    yPosition += 10;
                });
                yPosition += 3;
                break;

            case "h2":
                addNewPageIfNeeded(12);
                yPosition += 4;
                pdf.setFontSize(18);
                pdf.setFont("helvetica", "bold");
                const h2Text = element.textContent || "";
                const h2Lines = pdf.splitTextToSize(h2Text, contentWidth);
                h2Lines.forEach((line: string) => {
                    addNewPageIfNeeded(8);
                    pdf.text(line, margin, yPosition);
                    yPosition += 8;
                });
                yPosition += 2;
                break;

            case "h3":
                addNewPageIfNeeded(10);
                yPosition += 3;
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                const h3Text = element.textContent || "";
                const h3Lines = pdf.splitTextToSize(h3Text, contentWidth);
                h3Lines.forEach((line: string) => {
                    addNewPageIfNeeded(7);
                    pdf.text(line, margin, yPosition);
                    yPosition += 7;
                });
                yPosition += 2;
                break;

            case "p":
                // Check if paragraph contains an image
                const imgInP = element.querySelector("img");
                if (imgInP) {
                    const src = imgInP.getAttribute("src");
                    if (src) {
                        await addImageToPdf(src);
                    }
                    break;
                }

                addNewPageIfNeeded(10);
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "normal");
                const pText = element.textContent || "";
                if (pText.trim()) {
                    const pLines = pdf.splitTextToSize(pText, contentWidth);
                    pLines.forEach((line: string) => {
                        addNewPageIfNeeded(6);
                        pdf.text(line, margin, yPosition);
                        yPosition += 6;
                    });
                    yPosition += 3;
                }
                break;

            case "ul":
            case "ol":
                Array.from(element.children).forEach((li, index) => {
                    addNewPageIfNeeded(8);
                    pdf.setFontSize(12);
                    pdf.setFont("helvetica", "normal");
                    const prefix = tagName === "ol" ? `${index + 1}. ` : "• ";
                    const liText = prefix + (li.textContent || "");
                    const liLines = pdf.splitTextToSize(liText, contentWidth - 10);
                    liLines.forEach((line: string, lineIndex: number) => {
                        addNewPageIfNeeded(6);
                        pdf.text(line, margin + (lineIndex > 0 ? 5 : 0), yPosition);
                        yPosition += 6;
                    });
                });
                yPosition += 3;
                break;

            case "img":
                const src = element.getAttribute("src");
                if (src) {
                    await addImageToPdf(src);
                }
                break;

            case "br":
                yPosition += 4;
                break;

            default:
                // Process child nodes
                for (const child of Array.from(element.childNodes)) {
                    await processNode(child);
                }
        }
    };

    for (const child of Array.from(div.childNodes)) {
        await processNode(child);
    }

    return pdf.output("blob");
};

export const DownloadModal = ({ isOpen, onClose, htmlContent }: DownloadModalProps) => {
    const [downloading, setDownloading] = useState<string | null>(null);

    const downloadFile = async (format: FormatOption) => {
        setDownloading(format.id);

        try {
            let blob: Blob;
            let filename = `draft${format.extension}`;

            switch (format.id) {
                case "html":
                    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Draft</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
        h1 { font-size: 2em; margin-bottom: 0.5em; }
        h2 { font-size: 1.5em; margin-bottom: 0.5em; margin-top: 1.5em; }
        h3 { font-size: 1.2em; margin-bottom: 0.5em; margin-top: 1em; }
        p { margin-bottom: 1em; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
                    blob = new Blob([fullHtml], { type: "text/html" });
                    break;

                case "txt":
                    const textContent = htmlToText(htmlContent);
                    blob = new Blob([textContent], { type: "text/plain" });
                    break;

                case "md":
                    const markdownContent = htmlToMarkdown(htmlContent);
                    blob = new Blob([markdownContent], { type: "text/markdown" });
                    break;

                case "docx":
                    blob = await htmlToDocx(htmlContent);
                    break;

                case "pdf":
                    blob = await htmlToPdf(htmlContent);
                    break;

                default:
                    throw new Error("Unknown format");
            }

            // Create download link and trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            onClose();
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Failed to download file. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface-elevated border border-border p-6 shadow-2xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-xl font-semibold text-text-primary mb-2"
                                >
                                    Download Draft
                                </Dialog.Title>

                                <p className="text-sm text-text-muted mb-6">
                                    Choose a format to export your document
                                </p>

                                <div className="space-y-2">
                                    {formatOptions.map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => downloadFile(format)}
                                            disabled={downloading !== null}
                                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-glass border border-border hover:border-accent/40 hover:bg-accent-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <span className="text-2xl p-2 rounded-lg bg-surface-elevated group-hover:bg-surface-glass transition-colors">
                                                {format.icon}
                                            </span>
                                            <div className="text-left flex-1">
                                                <div className="font-medium text-text-primary">
                                                    {format.name}
                                                    <span className="text-text-muted font-normal ml-1.5 text-sm">
                                                        {format.extension}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-text-muted">
                                                    {format.description}
                                                </div>
                                            </div>
                                            {downloading === format.id && (
                                                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <Button label="Cancel" variant="secondary" onClick={onClose} extraClassnames="w-full mt-6 text-sm rounded-lg" />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
