import cors from "cors";
import express from "express";
import { apiRouter } from "./routes/apiRouter.ts";

export const createApp = () => {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use("/api", apiRouter);

    return app;
};