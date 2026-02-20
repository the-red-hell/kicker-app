// eslint-disable-next-line no-unused-vars
import { Client } from "pg";

export const addUserToGame = async (client, gameId, userId, position, team) => {
  const res = await client.query(
    `INSERT INTO game_players (game_id, user_id, position, team, goals) 
     VALUES ($1, $2, $3, $4, 0) 
     RETURNING *`,
    [gameId, userId, position, team]
  );
  return res.rows[0];
};

export const updateUserFromGame = async (
  client,
  gameId,
  userId,
  position,
  team
) => {
  const res = await client.query(
    `UPDATE game_players 
     SET position = $3, team = $4
     WHERE game_id = $1 AND user_id = $2
     RETURNING *`,
    [gameId, userId, position, team]
  );
  return res.rows[0];
};

/**
 * retrieves all users in a game, including their username and position/team in the game
 *
 * @param {Client} client
 * @param {string} gameId
 * @returns {Promise<Array<{ id: string, user_id: string, position: string, team: string, goals: number, username: string }>>} an array of users in the game
 */
export const retrieveUsersByGameId = async (client, gameId) => {
  const res = await client.query(
    `SELECT gp.*, u.username FROM game_players gp
     JOIN users u ON gp.user_id = u.id
     WHERE gp.game_id = $1`,
    [gameId]
  );
  return res.rows;
};
