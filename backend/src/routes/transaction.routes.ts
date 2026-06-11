import { Router } from "express";
import {
  create,
  findAll,
  findById,
  update,
  remove,
  stats,
} from "../controllers/transaction.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import z from "zod";

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string(),
  categoryId: z.string().optional(),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
});

const router = Router();

router.post("/", authMiddleware, validate(createTransactionSchema), create);
router.get("/", authMiddleware, findAll);
router.get("/:id", authMiddleware, findById);
router.patch("/:id", authMiddleware, validate(updateTransactionSchema), update);
router.delete("/:id", authMiddleware, remove);
router.get("/stats", authMiddleware, stats);

export default router;
