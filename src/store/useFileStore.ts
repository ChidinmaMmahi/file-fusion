import {create} from "zustand"
import { persist } from "zustand/middleware";

type FileMeta = {
    name: string;
    size: number;
};

type FileStore = {
    files: FileMeta[];
    note: string;

    addFile: (file: FileMeta) => void;
    addFiles: (files: FileMeta[]) => void;
    setFiles: (files: FileMeta[]) => void;
    removeFile: (fieldName: string) => void;

    setNote: (value:string) => void;
}

export const useFileStore = create<FileStore>()(
    persist(
        (set) => ({
            files: [],
            note: "",
            addFile: (file) =>
                set((state) => ({ files: [...state.files, file] })),
            addFiles: (files) =>
                set((state) => ({
                    files: [...state.files, ...files],
                })),
            setFiles: (files) => set({ files }),
            removeFile: (fileName) =>
                set((state) => ({
                files: state.files.filter((f) => f.name !== fileName),
                })),
            setNote: (value) => set({ note: value })
        }),
        {name: "file-storage"}
    ),
);