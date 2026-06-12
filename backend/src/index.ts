import express, { Request, Response, Application } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import categoryRoutes from "./routes/category.routes";
import { errorHandler } from "./middleware/error.middleware";
import { notFound } from "./middleware/notFound.middleware";
import morgan from "morgan";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/categories", categoryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
