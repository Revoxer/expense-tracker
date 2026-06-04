import { Router } from "express";
import { register } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import z from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const router = Router();
router.post("/register", validate(registerSchema), register);

export default router;
