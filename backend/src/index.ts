import "dotenv/config";
import express, { Request, Response, Application } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.get("/api/v1/test", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app;
