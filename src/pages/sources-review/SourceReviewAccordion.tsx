import { useEffect, useState } from "react";
import { useFileStore } from "../../store";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaFile, FaFilePdf, FaFileWord, FaFileImage } from "react-icons/fa";
import { MdDragIndicator, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { BsTrash3Fill } from "react-icons/bs";
import { deleteFileFromApp, getFileFromDB, getPreviewContent, type FileContent } from "../../lib";

type FileMeta = {
    name: string;
    size: number;
};

// Get file icon based on type
const getFileIcon = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.endsWith(".pdf")) {
        return <FaFilePdf className="text-2xl text-red-500" />;
    }
    if (name.endsWith(".docx") || name.endsWith(".doc")) {
        return <FaFileWord className="text-2xl text-blue-500" />;
    }
    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
        return <FaFileImage className="text-2xl text-green-500" />;
    }
    return <FaFile className="text-2xl" />;
};

const SortableItem = ({ file }: { file: FileMeta }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.name });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const [open, setOpen] = useState(true); // open by default
    const [preview, setPreview] = useState<FileContent>({ fileName: file.name, type: "text", content: "Loading..." });

    // Load file content
    useEffect(() => {
        const loadFile = async () => {
            try {
                const fileObj = await getFileFromDB(file.name);
                if (!fileObj) {
                    setPreview({ fileName: file.name, type: "text", content: "File not found" });
                    return;
                }

                const content = await getPreviewContent(fileObj, 500);
                setPreview(content);
            } catch (error) {
                console.error("Error loading file preview:", error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                setPreview({ fileName: file.name, type: "text", content: `Unable to load preview: ${errorMessage}` });
            }
        };
        loadFile();
    }, [file.name]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-x-2">
            {/* Drag Handle */}
            <div {...listeners} className="cursor-grab mt-4">
                <MdDragIndicator className="text-gray-500 text-2xl" />
            </div>

            {/* File Card */}
            <div className="rounded-lg bg-gray-100 shadow p-4 flex-1">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-x-3">
                        {getFileIcon(file.name)}
                        <p className="font-medium">{file.name}</p>
                    </div>

                    <div className="flex items-center gap-x-2">
                        {/* Accordion toggle */}
                        <button onClick={() => setOpen(!open)}>
                            {open ? (
                                <MdKeyboardArrowUp className="text-2xl cursor-pointer" />
                            ) : (
                                <MdKeyboardArrowDown className="text-2xl cursor-pointer" />
                            )}
                        </button>
                        {/* Delete button */}
                        <button onClick={() => deleteFileFromApp(file.name)}>
                            <BsTrash3Fill className="text-red-600 text-xl cursor-pointer" />
                        </button>
                    </div>
                </div>

                {/* Preview */}
                {open && (
                    <div className="mt-2">
                        {preview.type === "image" ? (
                            <img
                                src={preview.content}
                                alt={file.name}
                                className="max-w-full max-h-64 rounded object-contain"
                            />
                        ) : (
                            <pre className="text-gray-700 whitespace-pre-wrap">{preview.content}</pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const SourcesReviewAccordion = () => {
    const files = useFileStore((state) => state.files);
    const setFiles = useFileStore((state) => state.setFiles);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = files.findIndex((f) => f.name === active.id);
        const newIndex = files.findIndex((f) => f.name === over.id);

        // Move the file in the array
        const newFiles = Array.from(files);
        const [moved] = newFiles.splice(oldIndex, 1);
        newFiles.splice(newIndex, 0, moved);

        // Persist the new order
        setFiles(newFiles);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={files.map((f) => f.name)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                    {files.map((file) => (
                        <SortableItem key={file.name} file={file} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
