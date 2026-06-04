import express, { Request, Response, Application } from "express";
import cors from "cors";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/test", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app;
