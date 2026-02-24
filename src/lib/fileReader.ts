import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Configure PDF.js worker using CDN - version must match the installed package
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export type FileContent = {
    fileName: string;
    type: "text" | "image";
    content: string;
};

// Read PDF files using pdfjs-dist
export const readPdfContent = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
            fullText += pageText + "\n\n";
        }

        return fullText.trim() || "[PDF contains no extractable text]";
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw error;
    }
};

// Read Word documents using mammoth
export const readDocxContent = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim() || "[Document contains no extractable text]";
};

// Read image files as base64 data URL
export const readImageContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};

// Read text files
export const readTextContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

// Main file content reader
export const readFileContent = async (file: File): Promise<FileContent> => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // PDF files
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        const text = await readPdfContent(file);
        return { fileName: file.name, type: "text", content: text };
    }

    // Word documents
    if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
    ) {
        const text = await readDocxContent(file);
        return { fileName: file.name, type: "text", content: text };
    }

    // Images
    if (fileType.startsWith("image/") || fileName.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
        const dataUrl = await readImageContent(file);
        return { fileName: file.name, type: "image", content: dataUrl };
    }

    // Text-based files
    const textTypes = ["text/", "application/json", "application/javascript", "application/xml"];
    const isTextFile =
        textTypes.some((type) => fileType.startsWith(type)) ||
        fileName.match(/\.(txt|md|csv|json|js|ts|tsx|jsx|html|css|xml|yaml|yml|rtf)$/i);

    if (isTextFile) {
        const text = await readTextContent(file);
        return { fileName: file.name, type: "text", content: text };
    }

    // Unsupported file type
    return { fileName: file.name, type: "text", content: `[Preview not available for this file type: ${fileType || "unknown"}]` };
};

// Get preview content (truncated)
export const getPreviewContent = async (file: File, maxLength: number = 500): Promise<FileContent> => {
    const content = await readFileContent(file);

    if (content.type === "text" && content.content.length > maxLength) {
        return {
            ...content,
            content: content.content.slice(0, maxLength) + "...",
        };
    }

    return content;
};
