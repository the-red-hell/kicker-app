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

/**
 * @param {Client} client
 * @param {string} gameId
 * @param {string} userId
 */
export const removeUserFromGame = async (client, gameId, userId) => {
  await client.query(
    `DELETE FROM game_players gp
     USING games g
     WHERE gp.game_id = g.id
      AND gp.game_id = $1
      AND gp.user_id = $2
      AND g.status = 'waiting'`,
    [gameId, userId]
  );
};

export const retrieveNumTopPlayersByGoals = async (client, num) => {
  const res = await client.query(
    `SELECT u.username, u.image_url, SUM(gp.goals) AS total_goals
       FROM game_players gp
       JOIN users u ON gp.user_id = u.id
       GROUP BY gp.user_id, u.username, u.image_url
       ORDER BY total_goals DESC
     LIMIT $1`,
    [num]
  );
  return res.rows;
};

/**
 *
 * @param {Client} client
 * @param {number} num
 * @returns {Promise<{username: string, image_url: string, victories: number}[]>}
 */
// I have tried coming up with sth myself but no way
export const retrieveNumTopPlayersByVictories = async (client, num) => {
  const res = await client.query(
    `WITH game_scores AS (
        SELECT
            game_id,
            team,
            SUM(goals) as total_goals
        FROM game_players
        GROUP BY game_id, team
    ),
    winning_teams AS (
        SELECT
            gs1.game_id,
            gs1.team as winning_team
        FROM game_scores gs1
        JOIN games g on gs1.game_id = g.id
        LEFT JOIN game_scores gs2 ON gs1.game_id = gs2.game_id AND gs1.team != gs2.team
        WHERE g.status = 'ended' AND (gs2.total_goals IS NULL OR gs1.total_goals > gs2.total_goals)
    ),
    player_victories AS (
        SELECT
            gp.user_id,
            COUNT(wt.winning_team) as victories
        FROM game_players gp
        JOIN winning_teams wt ON gp.game_id = wt.game_id AND gp.team = wt.winning_team
        GROUP BY gp.user_id
    )
    SELECT
        u.username,
        u.image_url,
        pv.victories
    FROM player_victories pv
    JOIN users u ON pv.user_id = u.id
    ORDER BY pv.victories DESC
    LIMIT $1`,
    [num]
  );
  return res.rows;
};
