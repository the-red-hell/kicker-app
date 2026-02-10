import { query } from "./index.js";

export const retrievePlayerById = async (id) => {
  const res = await query("SELECT * FROM player WHERE id = $1", [id]);
  return res.rows[0];
};
