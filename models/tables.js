import { query } from "./index.js";
import { possibleStatuses } from "./types.js";

export const createTable = async (name, location) => {
  const insertQuery = `
    INSERT INTO tables (name, location)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await query(insertQuery, [name, location]);
  return result.rows[0];
};

export const retrieveTableById = async (id) => {
  const res = await query("SELECT * FROM tables WHERE id = $1", [id]);
  return res.rows[0];
};

/**
 *
 * @param {string} status
 * @param {string} userId
 * @returns {Promise<{id: string, name: string, location: string, is_active: boolean}[]>}
 */
export const retrieveStatusTablesByUserId = async (client, status, userId) => {
  if (!possibleStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const res = await client.query(
    `
    SELECT t.*
    FROM tables t
    JOIN games g ON g.table_id = t.id
    JOIN game_players gp ON gp.game_id = g.id
    WHERE gp.user_id = $1 AND g.status = $2
  `,
    [userId, status]
  );
  return res.rows;
};
