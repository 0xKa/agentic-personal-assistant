import multer from "multer";
import os from "node:os";
import path from "node:path";

const createTempFilename = (originalName: string): string => {
    const ext = path.extname(originalName || "");
    return `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
};

const isPdfFile = (file: Express.Multer.File): boolean => {
    return (
        file.mimetype === "application/pdf" ||
        (file.originalname || "").toLowerCase().endsWith(".pdf")
    );
};

export const uploadPdf = multer({
    storage: multer.diskStorage({
        destination: os.tmpdir(),
        filename: (_req, file, cb) => {
            cb(null, createTempFilename(file.originalname));
        },
    }),
    fileFilter: (_req, file, cb) => {
        if (!isPdfFile(file)) {
            cb(new Error("Only PDF files are allowed"));
            return;
        }

        cb(null, true);
    },
    limits: { fileSize: 25 * 1024 * 1024 },
});