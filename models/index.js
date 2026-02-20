import { Pool } from "pg";
import process from "process";

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
  max: 20,
});

export const query = (text, params) => {
  return pool.query(text, params);
};
