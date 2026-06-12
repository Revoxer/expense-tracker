import { Router } from "express";
import { findAll } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, findAll);

export default router;
