import { Router } from "express";
import { findAll, findById } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, findAll);
router.get("/:id", authMiddleware, findById);

export default router;
