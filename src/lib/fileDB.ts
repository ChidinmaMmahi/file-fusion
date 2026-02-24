import { openDB } from "idb";

const dbPromise = openDB("pdf-store", 1, {
  upgrade(db) {
    db.createObjectStore("files");
  },
});

export const saveFileToDB = async (file: File) => {
  const db = await dbPromise;
  await db.put("files", file, file.name);
};

export const getAllFilesFromDB = async (): Promise<File[]> => {
  const db = await dbPromise;
  return await db.getAll("files");
};

export const deleteFileFromDB = async (name: string) => {
  const db = await dbPromise;
  await db.delete("files", name);
};

export const getFileFromDB = async (name: string): Promise<File | undefined> => {
  const db = await dbPromise;
  return await db.get("files", name);
};
