import { useEffect, useState } from "react";
import { useFileStore, type SourceItem } from "../../store";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HiOutlineDocument, HiOutlineDocumentText, HiOutlinePhoto, HiOutlinePencilSquare, HiOutlineTrash, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { RxDragHandleDots2 } from "react-icons/rx";
import { deleteFileFromApp, getFileFromDB, getPreviewContent, type FileContent } from "../../lib";

type FileMeta = {
    name: string;
    size: number;
};

const getFileIcon = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.endsWith(".pdf")) {
        return <HiOutlineDocumentText className="text-xl text-red-400" />;
    }
    if (name.endsWith(".docx") || name.endsWith(".doc")) {
        return <HiOutlineDocumentText className="text-xl text-blue-400" />;
    }
    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
        return <HiOutlinePhoto className="text-xl text-emerald-400" />;
    }
    return <HiOutlineDocument className="text-xl text-text-secondary" />;
};

const NOTE_ID = "__additional_notes__";

const SortableFileItem = ({ file }: { file: FileMeta }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.name });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const [open, setOpen] = useState(true);
    const [preview, setPreview] = useState<FileContent>({ fileName: file.name, type: "text", content: "Loading..." });

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
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                setPreview({ fileName: file.name, type: "text", content: `Unable to load preview: ${errorMessage}` });
            }
        };
        loadFile();
    }, [file.name]);

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="group flex items-start gap-x-3">
            <div {...listeners} className="cursor-grab mt-5 p-1 rounded opacity-40 hover:opacity-100 hover:bg-surface-elevated transition-all">
                <RxDragHandleDots2 className="text-text-white/10 text-lg" />
            </div>

            <div className="rounded-xl bg-surface-elevated border border-border hover:border-accent/30 p-5 flex-1 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-x-3">
                        <div className="p-2 rounded-lg bg-surface-glass">
                            {getFileIcon(file.name)}
                        </div>
                        <p className="font-medium text-text-primary">{file.name}</p>
                    </div>

                    <div className="flex items-center gap-x-1">
                        <button
                            onClick={() => setOpen(!open)}
                            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-glass transition-colors"
                        >
                            {open ? (
                                <HiChevronUp className="text-lg" />
                            ) : (
                                <HiChevronDown className="text-lg" />
                            )}
                        </button>
                        <button
                            onClick={() => deleteFileFromApp(file.name)}
                            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <HiOutlineTrash className="text-lg" />
                        </button>
                    </div>
                </div>

                {open && (
                    <div className="mt-4 pt-4 border-t border-border">
                        {preview.type === "image" ? (
                            <img
                                src={preview.content}
                                alt={file.name}
                                className="max-w-full max-h-64 rounded-lg object-contain border border-border"
                            />
                        ) : (
                            <pre className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed font-mono">{preview.content}</pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const SortableNoteItem = () => {
    const note = useFileStore((state) => state.note);
    const setNote = useFileStore((state) => state.setNote);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: NOTE_ID });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const [open, setOpen] = useState(true);
    const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="group flex items-start gap-x-3">
            <div {...listeners} className="cursor-grab mt-5 p-1 rounded opacity-40 hover:opacity-100 hover:bg-surface-elevated transition-all">
                <RxDragHandleDots2 className="text-text-white/10 text-lg" />
            </div>

            <div className="rounded-xl bg-accent-muted border border-accent/20 hover:border-accent/40 p-5 flex-1 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-x-3">
                        <div className="p-2 rounded-lg bg-accent/20">
                            <HiOutlinePencilSquare className="text-xl text-accent" />
                        </div>
                        <div>
                            <p className="font-medium text-text-primary">Additional Notes</p>
                            <p className="text-sm text-text-muted">{wordCount} {wordCount === 1 ? 'word' : 'words'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-x-1">
                        <button
                            onClick={() => setOpen(!open)}
                            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-accent/20 transition-colors"
                        >
                            {open ? (
                                <HiChevronUp className="text-lg" />
                            ) : (
                                <HiChevronDown className="text-lg" />
                            )}
                        </button>
                        <button
                            onClick={() => setNote("")}
                            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <HiOutlineTrash className="text-lg" />
                        </button>
                    </div>
                </div>

                {open && (
                    <div className="mt-4 pt-4 border-t border-accent/20">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-4 rounded-xl bg-surface-elevated border border-border focus:outline-none focus:border-accent/50 resize-none text-text-primary placeholder:text-text-muted transition-colors"
                            rows={4}
                            placeholder="Add your notes, emails, or any additional text here..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export const SourcesReviewAccordion = () => {
    const files = useFileStore((state) => state.files);
    const sourceOrder = useFileStore((state) => state.sourceOrder);
    const setSourceOrder = useFileStore((state) => state.setSourceOrder);

    const sensors = useSensors(useSensor(PointerSensor));

    const getOrderedItems = (): SourceItem[] => {
        if (sourceOrder.length > 0) {
            const validItems = sourceOrder.filter((item) => {
                if (item.type === "note") return true;
                return files.some((f) => f.name === item.name);
            });

            const hasNote = validItems.some((item) => item.type === "note");

            const existingFileNames = new Set(
                validItems.filter((i) => i.type === "file").map((i) => i.type === "file" ? i.name : "")
            );
            const newFiles = files.filter((f) => !existingFileNames.has(f.name));
            const newFileItems: SourceItem[] = newFiles.map((f) => ({
                type: "file" as const,
                name: f.name,
                size: f.size,
            }));

            const result = [...validItems, ...newFileItems];

            if (!hasNote) {
                result.push({ type: "note" as const });
            }

            return result;
        }

        const items: SourceItem[] = files.map((f) => ({
            type: "file" as const,
            name: f.name,
            size: f.size,
        }));

        items.push({ type: "note" as const });

        return items;
    };

    const orderedItems = getOrderedItems();

    useEffect(() => {
        const orderChanged = orderedItems.length !== sourceOrder.length ||
            orderedItems.some((item, index) => {
                const storeItem = sourceOrder[index];
                if (!storeItem) return true;
                if (item.type !== storeItem.type) return true;
                if (item.type === "file" && storeItem.type === "file") {
                    return item.name !== storeItem.name;
                }
                return false;
            });

        if (orderChanged) {
            setSourceOrder(orderedItems);
        }
    }, [orderedItems, sourceOrder, setSourceOrder]);

    const getSortableId = (item: SourceItem): string => {
        return item.type === "note" ? NOTE_ID : item.name;
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = orderedItems.findIndex((item) => getSortableId(item) === active.id);
        const newIndex = orderedItems.findIndex((item) => getSortableId(item) === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = Array.from(orderedItems);
        const [moved] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved);

        setSourceOrder(newOrder);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedItems.map(getSortableId)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                    {orderedItems.map((item) => {
                        if (item.type === "note") {
                            return <SortableNoteItem key={NOTE_ID} />;
                        }
                        return (
                            <SortableFileItem
                                key={item.name}
                                file={{ name: item.name, size: item.size }}
                            />
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
};
