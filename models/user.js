import { query } from "./index.js";

export const createUser = async (username, email, passwordHash) => {
  const insertQuery = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, created_at
  `;
  const result = await query(insertQuery, [username, email, passwordHash]);
  return result.rows[0];
};

export const findUserByUsername = async (username) => {
  const selectQuery = "SELECT * FROM users WHERE username = $1";
  const result = await query(selectQuery, [username]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const selectQuery =
    "SELECT id, username, email, created_at FROM users WHERE id = $1";
  const result = await query(selectQuery, [id]);
  return result.rows[0];
};

// TODO: update user, delete user, etc.
