import { query } from "./index.js";

export const createGame = async (tableId) => {
  const res = await query(
    "INSERT INTO games (table_id) VALUES ($1) RETURNING *",
    [tableId]
  );
  return res.rows[0];
};

export const setGameStarted = async (gameId) => {
  const res = await query(
    "UPDATE games SET started_at = NOW(), status = 'active' WHERE id = $1 RETURNING *",
    [gameId]
  );
  return res.rows[0];
};

export const setGameEnded = async (gameId, pointsWhite, pointsBlack) => {
  const res = await query(
    "UPDATE games SET ended_at = NOW(), status = 'ended', points_white = $2, points_black = $3 WHERE id = $1 RETURNING *",
    [gameId, pointsWhite, pointsBlack]
  );
  return res.rows[0];
};

/**
 * Retrieves current active/waiting game for a given tableId.
 *
 * @param {string} tableId
 * @returns {Promise<Object|null>}
 */
export const retrieveCurrentGameByTableId = async (tableId) => {
  const res = await query(
    "SELECT * FROM games WHERE table_id = $1 AND (status = 'active' OR status = 'waiting')",
    [tableId]
  );
  return res.rows[0];
};
