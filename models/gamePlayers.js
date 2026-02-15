import { query } from "./index.js";

export const addUserToGame = async (gameId, userId, position, team) => {
  const res = await query(
    `INSERT INTO game_players (game_id, user_id, position, team, goals) 
     VALUES ($1, $2, $3, $4, 0) 
     RETURNING *`,
    [gameId, userId, position, team]
  );
  return res.rows[0];
};

export const updateUserFromGame = async (gameId, userId, position, team) => {
  const res = await query(
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
 * @param {string} gameId
 * @returns {Promise<Array>} an array of users in the game
 */
export const retrievePlayersByGameId = async (gameId) => {
  const res = await query(
    `SELECT gp.*, u.username FROM game_players gp
     JOIN users u ON gp.user_id = u.id
     WHERE gp.game_id = $1`,
    [gameId]
  );
  return res.rows;
};
