// eslint-disable-next-line no-unused-vars
import { Client } from "pg";
import { possibleTeams } from "./types.js";

export const createGame = async (client, tableId) => {
  const res = await client.query(
    "INSERT INTO games (table_id) VALUES ($1) RETURNING *",
    [tableId]
  );
  return res.rows[0];
};

export const setGameStarted = async (client, gameId) => {
  const res = await client.query(
    "UPDATE games SET started_at = NOW(), status = 'active', last_goal_time = NOW() WHERE id = $1 RETURNING *",
    [gameId]
  );
  return res.rows[0];
};

export const setGameEnded = async (
  client,
  gameId,
  pointsWhite,
  pointsBlack
) => {
  const res = await client.query(
    "UPDATE games SET ended_at = NOW(), status = 'ended', points_white = $2, points_black = $3 WHERE id = $1 RETURNING *",
    [gameId, pointsWhite, pointsBlack]
  );
  return res.rows[0];
};

export const scoreGoal = async (client, gameId, team) => {
  if (!possibleTeams.includes(team)) {
    throw new Error("Invalid team");
  }
  const pointsColumn = team === "white" ? "points_white" : "points_black";
  const sql = `UPDATE games SET last_goal_time = NOW(), ${pointsColumn} = ${pointsColumn} + 1 WHERE id = $1 RETURNING *`;
  const res = await client.query(sql, [gameId]);
  return res.rows[0];
};

/**
 * Retrieves current active/waiting game for a given tableId.
 *
 * @param {Client} client
 * @param {string} tableId
 * @returns {Promise<Object|null>}
 */
export const retrieveCurrentGameByTableId = async (client, tableId) => {
  const res = await client.query(
    "SELECT * FROM games WHERE table_id = $1 AND (status = 'active' OR status = 'waiting') FOR UPDATE",
    [tableId]
  );
  return res.rows[0];
};
