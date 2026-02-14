import { query } from "./index.js";

export const possibleTablePositions = [
  "attack-white",
  "defense-white",
  "attack-black",
  "defense-black",
];

export const retrieveTables = async () => {
  const res = await query("SELECT * FROM tables");
  return res.rows;
};

export const retrieveTableById = async (id) => {
  const res = await query("SELECT * FROM tables WHERE id = $1", [id]);
  return res.rows[0];
};
