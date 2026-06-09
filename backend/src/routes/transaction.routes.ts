import { Router } from "express";
import { create, findAll } from "../controllers/transaction.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import z from "zod";

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string(),
  categoryId: z.string().optional(),
});

const router = Router();

router.post("/", authMiddleware, validate(createTransactionSchema), create);
router.get("/", authMiddleware, findAll);

export default router;
