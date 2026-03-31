import { Router } from "express";
import { chatController } from "../controllers/chatController.ts";
import { ingestController } from "../controllers/ingestController.ts";
import { uploadPdf } from "../middleware/pdfUpload.ts";

const apiRouter = Router();

apiRouter.post("/chat", chatController);
apiRouter.post("/ingest", uploadPdf.single("file"), ingestController);

export { apiRouter };