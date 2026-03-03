import { useState } from "react";
import { useFileStore } from "../../store";
import { HiOutlineTrash, HiOutlineDocumentArrowUp, HiOutlineDocument } from "react-icons/hi2";
import { Button } from "../../components";
import { addFilesToApp, deleteFileFromApp } from "../../lib";

export const FileUpload = () => {
    const files = useFileStore((state) => state.files);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        addFilesToApp(fileList);
    };

    return (
        <div className="space-y-6">
            <label
                htmlFor="file-upload"
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                className={`
                    relative px-8 py-14 rounded-2xl cursor-pointer flex flex-col justify-center items-center
                    border-2 border-dashed transition-all duration-300
                    ${isDragging
                        ? 'border-accent bg-accent-muted'
                        : 'border-border hover:border-accent/50 bg-surface-elevated/50 hover:bg-surface-elevated'
                    }
                `}
            >
                <div className={`
                    p-4 rounded-2xl mb-6 transition-colors duration-300
                    ${isDragging ? 'bg-accent/20' : 'bg-surface-glass'}
                `}>
                    <HiOutlineDocumentArrowUp className={`text-4xl transition-colors ${isDragging ? 'text-accent' : 'text-text-secondary'}`} />
                </div>
                <p className="text-[16px] sm:text-lg text-center font-medium text-text-primary mb-2">
                    Drop your files here or click to browse
                </p>
                <p className="text-xs sm:text-sm text-text-muted mb-6 text-center">PDF, DOCX, TXT, or images up to 200MB</p>
                <Button label="Select files" variant="secondary" />

                <input
                    id="file-upload"
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </label>

            {files.length > 0 && (
                <div className="space-y-3">
                    {files.map((file, idx) => (
                        <div
                            key={idx}
                            className="group flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-border hover:border-accent/30 transition-colors"
                        >
                            <div className="flex items-center gap-x-4">
                                <div className="p-2.5 rounded-lg bg-surface-glass">
                                    <HiOutlineDocument className="text-xl text-accent" />
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <p className="text-sm text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFileFromApp(file.name);
                                }}
                                className="p-2 rounded-lg text-red-700 lg:text-text-muted lg:hover:text-red-400 lg:hover:bg-red-400/10 transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                            >
                                <HiOutlineTrash className="text-lg" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
