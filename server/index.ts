import "dotenv/config";
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import multer from "multer";
import { unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runAgent } from "./agent.js";
import { ingestData } from "./ingest.js";

interface ChatRequestBody {
  message?: string;
  sessionId?: string;
}

interface ChatResponse {
  answer: string;
}

interface IngestResponse {
  ok: true;
}

interface ErrorResponse {
  error: string;
}

type UploadRequest = Request & { file?: Express.Multer.File };

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  return fallback;
};

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      (file.originalname || "").toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      cb(new Error("Only PDF files are allowed"));
      return;
    }

    cb(null, true);
  },
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.post(
  "/api/chat",
  async (
    req: Request<unknown, unknown, ChatRequestBody>,
    res: Response<ChatResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const { message, sessionId } = req.body;

      if (typeof message !== "string" || message.trim() === "") {
        res.status(400).json({ error: "Message required" });
        return;
      }

      const answer = await runAgent({ message, sessionId });
      const output = answer.output.trim();

      if (output === "") {
        res.json({
          answer:
            "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?",
        });
        return;
      }

      res.json({ answer: output });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: toErrorMessage(error, "Chat request failed") });
    }
  }
);

app.post(
  "/api/ingest",
  upload.single("file"),
  async (
    req: UploadRequest,
    res: Response<IngestResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const filePath = req.file?.path;

      if (!filePath) {
        res.status(400).json({ error: "Missing PDF file" });
        return;
      }

      await ingestData(filePath);
      await unlink(filePath).catch(() => undefined);

      res.json({ ok: true });
    } catch (error) {
      const filePath = req.file?.path;
      if (filePath) {
        await unlink(filePath).catch(() => undefined);
      }

      res.status(500).json({ error: toErrorMessage(error, "Upload failed") });
    }
  }
);

const port = 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));