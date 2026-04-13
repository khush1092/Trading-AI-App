import { PoolClient } from "pg";
import { pool } from "../config/db";

// CREATE USER
export async function createUser(
  client: PoolClient,
  input: {
    name: string;
    email: string;
    passwordHash: string;
    cashBalance: number;
  }
) {
  const result = await client.query(
    `
    INSERT INTO users (name, email, password, virtual_balance)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, virtual_balance
    `,
    [input.name, input.email, input.passwordHash, input.cashBalance]
  );

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    email: result.rows[0].email,
    cash_balance: result.rows[0].virtual_balance,
  };
}

// FIND USER BY EMAIL
export async function findUserByEmail(email: string) {
  const result = await pool.query(
    `
    SELECT id, name, email, password AS password_hash, virtual_balance AS cash_balance
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}

// FIND USER BY ID
export async function findUserById(id: string) {
  const result = await pool.query(
    `
    SELECT id, name, email, virtual_balance AS cash_balance
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}
export async function findUserByIdForUpdate(
  client: any,
  userId: string
) {
  const result = await client.query(
    `
    SELECT id, name, email, virtual_balance AS cash_balance
    FROM users
    WHERE id = $1
    FOR UPDATE
    `,
    [userId]
  );

  return result.rows[0] || null;
}
export async function updateUserCashBalance(
  client: any,
  userId: string,
  newBalance: number
) {
  const result = await client.query(
    `
    UPDATE users
    SET virtual_balance = $1
    WHERE id = $2
    RETURNING id, name, email, virtual_balance
    `,
    [newBalance, userId]
  );

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    email: result.rows[0].email,
    cash_balance: result.rows[0].virtual_balance,
  };
}