import { Request, Response } from "express";
import { registerUser, loginUser, getMe } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await registerUser(email, password);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const data = await getMe(req.user!.userId);
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};
