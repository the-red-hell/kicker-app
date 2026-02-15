import { query } from "./index.js";

export const createTable = async (name, location) => {
  const insertQuery = `
    INSERT INTO tables (name, location)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await query(insertQuery, [name, location]);
  return result.rows[0];
};

export const retrieveTables = async () => {
  const res = await query("SELECT * FROM tables");
  return res.rows;
};

export const retrieveTableById = async (id) => {
  const res = await query("SELECT * FROM tables WHERE id = $1", [id]);
  return res.rows[0];
};
