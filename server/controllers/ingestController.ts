import type { Request, Response } from "express";
import { ingestUploadedFile } from "../services/ingestionService.ts";
import type { ErrorResponse, IngestResponse } from "../types/api.ts";
import { toErrorMessage } from "../utils/errors.ts";

type UploadRequest = Request & { file?: Express.Multer.File };

export const ingestController = async (
    req: UploadRequest,
    res: Response<IngestResponse | ErrorResponse>
): Promise<void> => {
    const filePath = req.file?.path;

    if (!filePath) {
        res.status(400).json({ error: "Missing PDF file" });
        return;
    }

    try {
        await ingestUploadedFile(filePath);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: toErrorMessage(error, "Upload failed") });
    }
};