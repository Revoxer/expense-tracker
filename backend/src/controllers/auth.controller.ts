import { Request, Response } from "express";
import { registerUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await registerUser(email, password);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
