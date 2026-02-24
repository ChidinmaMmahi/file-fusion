import { useRef } from "react";
import { useFileStore } from "../../store";
import { BsTrash3Fill } from "react-icons/bs";
import { FaFile } from "react-icons/fa";
import { Button } from "../../components";
import { addFilesToApp, deleteFileFromApp } from "../../lib";

export const FileUpload = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const files = useFileStore((state) => state.files);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        addFilesToApp(fileList);
    };

    return (
        <div>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
                className="relative px-6 py-10 rounded-lg cursor-pointer flex flex-col justify-center items-center"
            >
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    fill="none"
                >
                    <rect
                        x="1"
                        y="1"
                        width="calc(100% - 2px)"
                        height="calc(100% - 2px)"
                        rx="8"
                        ry="8"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                        strokeDasharray="10 7"
                    />
                </svg>

                <FaFile className="text-3xl mb-8" />
                <p className="text-xl font-medium mb-1">Choose a PDF file or drag & drop it here</p>
                <p className="mb-6">Max file size is 200MB</p>
                <Button label="Browse file" />

                <input
                    ref={inputRef}
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>
            {
                files.length > 0 && (
                    <div className="mt-4">
                        <ul className="space-y-3">
                            {files.map((file, idx) => (
                                <li key={idx} className="flex justify-between items-center">
                                    <div className="flex items-center gap-x-4">
                                        <FaFile className="text-3xl" />
                                        <div>
                                            <p className="text-lg">{file.name}</p>
                                            <p className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                    <span onClick={() => deleteFileFromApp(file.name)}>
                                        <BsTrash3Fill className="text-lg text-red-600 cursor-pointer" />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
        </div>

    );
}
