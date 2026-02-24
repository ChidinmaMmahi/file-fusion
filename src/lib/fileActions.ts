import { saveFileToDB, deleteFileFromDB } from "./fileDB";
import { useFileStore } from "../store";

export const addFilesToApp = async (fileList: FileList | File[]) => {
  const files = useFileStore.getState().files;
  const addFiles = useFileStore.getState().addFiles;

  const existingNames = new Set(files.map(f => f.name));

  const newFiles = Array.from(fileList).filter(
    f => !existingNames.has(f.name)
  );

  for (const file of newFiles) {
    await saveFileToDB(file);
  }

  const metaFiles = newFiles.map(file => ({
    name: file.name,
    size: file.size
  }));

  addFiles(metaFiles);
};

export const deleteFileFromApp = async (name: string) => {
  const removeFile = useFileStore.getState().removeFile;

  await deleteFileFromDB(name);
  removeFile(name);
};
