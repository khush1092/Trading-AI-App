import bcrypt from "bcryptjs";
import { withTransaction } from "../../config/db";
import { signAccessToken } from "../../config/jwt";
import { findUserByEmail, findUserById, createUser } from "../../repositories/users.repository";
import { AppError } from "../../utils/app-error";
import { env } from "../../config/env";

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await findUserByEmail(input.email);

  if (existing) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await withTransaction((client) =>
    createUser(client, {
      name: input.name,
      email: input.email,
      passwordHash,
      cashBalance: env.DEFAULT_VIRTUAL_BALANCE
    })
  );

  const token = signAccessToken({
    sub: user.id,
    email: user.email
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      cashBalance: Number(user.cash_balance)
    }
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signAccessToken({
    sub: user.id,
    email: user.email
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      cashBalance: Number(user.cash_balance)
    }
  };
}

export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cashBalance: Number(user.cash_balance)
  };
}
