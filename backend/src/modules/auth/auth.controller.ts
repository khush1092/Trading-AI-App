import { Request, Response } from "express";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";

export async function register(req: Request, res: Response) {
  const result = await registerUser(req.body);
  return res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(req.body);
  return res.status(200).json(result);
}

export async function me(req: Request, res: Response) {
  const result = await getCurrentUser(req.user!.id);
  return res.status(200).json({ user: result });
}
