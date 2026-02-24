// eslint-disable-next-line no-unused-vars
import { Client } from "pg";

/**
 *
 * @param {Client} client
 * @param {number} num
 * @param {string|null} duration
 * @returns {Promise<{username: string, imageUrl: string, averageGoals: number}[]>}
 */
export const retrieveNumTopPlayersByAvgGoals = async (
  client,
  num,
  duration
) => {
  const res = await client.query(
    `SELECT u.username, u.image_url, SUM(gp.goals) / COUNT(DISTINCT(gp.game_id)) AS average_goals
       FROM game_players gp
       JOIN users u ON gp.user_id = u.id
       JOIN games g ON gp.game_id = g.id
       WHERE ($2::interval IS NULL OR g.created_at >= NOW() - $2::interval)
       GROUP BY gp.user_id, u.username, u.image_url
       ORDER BY average_goals DESC
     LIMIT $1`,
    [num, duration]
  );
  return res.rows.map((row) => ({
    username: row.username,
    imageUrl: row.image_url,
    averageGoals: parseInt(row.average_goals, 10),
  }));
};

/**
 *
 * @param {Client} client
 * @param {number} num
 * @param {string|null} duration
 * @returns {Promise<{username: string, imageUrl: string, victories: number}[]>}
 */
// I have tried coming up with sth myself but no way
export const retrieveTopPlayersByVictories = async (client, num, duration) => {
  const res = await client.query(
    `WITH player_victories AS (
        SELECT
            gp.user_id,
            COUNT(wtv.winning_team) as victories
        FROM game_players gp
        JOIN games g ON gp.game_id = g.id
        JOIN winning_teams_view wtv ON gp.game_id = wtv.game_id AND gp.team = wtv.winning_team
        WHERE ($2::interval IS NULL OR g.created_at >= NOW() - $2::interval)
        GROUP BY gp.user_id
    )
    SELECT
        u.username,
        u.image_url AS imageUrl,
        pv.victories
    FROM player_victories pv
    JOIN users u ON pv.user_id = u.id
    ORDER BY pv.victories DESC
    LIMIT $1`,
    [num, duration]
  );
  return res.rows.map((row) => ({
    username: row.username,
    imageUrl: row.imageUrl,
    victories: parseInt(row.victories, 10),
  }));
};

/**
 *
 * @param {Client} client
 * @param {number} num
 * @param {string|null} duration
 * @returns {Promise<{username: string, imageUrl: string, totalGames: number, totalGoals: number}[]>}
 */
export const retrieveTopPlayersByAbsolutes = async (client, num, duration) => {
  const res = await client.query(
    `SELECT u.username, u.image_url, COUNT(DISTINCT gp.game_id) AS total_games, SUM(gp.goals) AS total_goals
       FROM game_players gp
       JOIN users u ON gp.user_id = u.id
       JOIN games g ON gp.game_id = g.id

       WHERE ($2::interval IS NULL OR g.created_at >= NOW() - $2::interval)
       GROUP BY gp.user_id, u.username, u.image_url
       ORDER BY total_games DESC
     LIMIT $1`,
    [num, duration]
  );
  return res.rows.map((row) => ({
    username: row.username,
    imageUrl: row.image_url,
    totalGames: parseInt(row.total_games, 10),
    totalGoals: parseInt(row.total_goals, 10),
  }));
};

export const retrieveGoalCountByUserId = async (client, userId) => {
  const res = await client.query(
    `SELECT SUM(gp.goals) AS total_goals
       FROM game_players gp
       WHERE gp.user_id = $1`,
    [userId]
  );
  return parseInt(res.rows[0].total_goals, 10) || 0;
};

export const retrieveVictoryCountByUserId = async (client, userId) => {
  const res = await client.query(
    `SELECT COUNT(*) AS victories
      FROM game_players gp
      JOIN winning_teams_view wtv ON gp.game_id = wtv.game_id AND gp.team = wtv.winning_team
      WHERE gp.user_id = $1`,
    [userId]
  );
  return parseInt(res.rows[0].victories, 10) || 0;
};

export const retrieveGamesCountByUserId = async (client, userId) => {
  const res = await client.query(
    `SELECT COUNT(DISTINCT game_id) AS total_games
       FROM game_players
       WHERE user_id = $1`,
    [userId]
  );
  return parseInt(res.rows[0].total_games, 10) || 0;
};
