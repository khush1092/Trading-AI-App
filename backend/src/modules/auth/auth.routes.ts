import { Router } from "express";
import { login, me, register } from "./auth.controller";
import { validateBody } from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(login));
authRouter.get("/me", authMiddleware, asyncHandler(me));
