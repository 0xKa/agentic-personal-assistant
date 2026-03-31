import { unlink } from "node:fs/promises";
import { ingestData } from "../ai/ingest.ts";

export const ingestUploadedFile = async (filePath: string): Promise<void> => {
    try {
        await ingestData(filePath);
    } finally {
        await unlink(filePath).catch(() => undefined);
    }
};