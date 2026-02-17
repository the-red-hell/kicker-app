// eslint-disable-next-line no-unused-vars
import { Client } from "pg";
import { possibleTeams } from "./types.js";
import { parse } from "postgres-array";

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
  const sql = `UPDATE games SET last_goal_time = NOW(), last_goal_teams = array_append(last_goal_teams, $2), ${pointsColumn} = ${pointsColumn} + 1 WHERE id = $1 RETURNING *`;
  const res = await client.query(sql, [gameId, team]);
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

/**
 *
 * @param {Client} client
 * @param {string} gameId
 * @returns array of teams that scored the goals in order, e.g. ["white", "black", "white"]
 */
export const undoGoalInGame = async (client, gameId) => {
  // first, get the last scoring team
  const gameRes = await client.query(
    "SELECT last_goal_teams FROM games WHERE id = $1 FOR UPDATE",
    [gameId]
  );

  const lastGoalTeam = pgToJsArray(gameRes.rows[0].last_goal_teams).pop();
  if (!lastGoalTeam) {
    // no goals to undo
    return gameRes.rows[0];
  }

  const pointsColumn =
    lastGoalTeam === "white" ? "points_white" : "points_black";

  // finally, update the game
  const res = await client.query(
    `UPDATE games 
     SET 
       last_goal_teams = last_goal_teams[1:array_length(last_goal_teams, 1)-1],
       ${pointsColumn} = ${pointsColumn} - 1
     WHERE id = $1 
     RETURNING *`, // postgresql arrays start at 1
    [gameId]
  );
  return res.rows[0];
};

export const pgToJsArray = (pgArray) => {
  if (!pgArray) return [];
  return parse(pgArray);
};
