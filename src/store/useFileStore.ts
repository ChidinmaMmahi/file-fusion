import {create} from "zustand"
import { persist } from "zustand/middleware";

type FileMeta = {
    name: string;
    size: number;
};

// Represents an item in the ordered list (either a file or the note)
export type SourceItem =
    | { type: "file"; name: string; size: number }
    | { type: "note" };

type FileStore = {
    files: FileMeta[];
    note: string;
    // Ordered list of source items (files and note)
    sourceOrder: SourceItem[];

    addFile: (file: FileMeta) => void;
    addFiles: (files: FileMeta[]) => void;
    setFiles: (files: FileMeta[]) => void;
    removeFile: (fieldName: string) => void;

    setNote: (value:string) => void;
    setSourceOrder: (order: SourceItem[]) => void;
}

export const useFileStore = create<FileStore>()(
    persist(
        (set) => ({
            files: [],
            note: "",
            sourceOrder: [],
            addFile: (file) =>
                set((state) => {
                    const newFiles = [...state.files, file];
                    const newSourceOrder = [...state.sourceOrder, { type: "file" as const, name: file.name, size: file.size }];
                    return { files: newFiles, sourceOrder: newSourceOrder };
                }),
            addFiles: (files) =>
                set((state) => {
                    const newFiles = [...state.files, ...files];
                    const newSourceItems = files.map(f => ({ type: "file" as const, name: f.name, size: f.size }));
                    const newSourceOrder = [...state.sourceOrder, ...newSourceItems];
                    return { files: newFiles, sourceOrder: newSourceOrder };
                }),
            setFiles: (files) => set((state) => {
                // Update sourceOrder to match the new files order while preserving note position
                const noteItem = state.sourceOrder.find(item => item.type === "note");
                const noteIndex = state.sourceOrder.findIndex(item => item.type === "note");

                const fileItems: SourceItem[] = files.map(f => ({ type: "file" as const, name: f.name, size: f.size }));

                if (noteItem && noteIndex !== -1) {
                    // Insert note at its current relative position
                    const adjustedIndex = Math.min(noteIndex, fileItems.length);
                    fileItems.splice(adjustedIndex, 0, noteItem);
                }

                return { files, sourceOrder: fileItems };
            }),
            removeFile: (fileName) =>
                set((state) => ({
                    files: state.files.filter((f) => f.name !== fileName),
                    sourceOrder: state.sourceOrder.filter((item) =>
                        item.type === "note" || item.name !== fileName
                    ),
                })),
            setNote: (value) => set({ note: value }),
            setSourceOrder: (order) => set({ sourceOrder: order }),
        }),
        {name: "file-storage"}
    ),
);