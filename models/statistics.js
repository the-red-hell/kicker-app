// eslint-disable-next-line no-unused-vars
import { Client } from "pg";

const DEFAULT_STATS = {
  username: null,
  imageUrl: null,
  totalGames: 0,
  totalGoals: 0,
  totalVictories: 0,
  averageGoals: 0,
  winRate: 0,
};

/**
 * Retrieve player statistics with optional filtering
 * @param {Client} client
 * @param {{userId?: number, duration?: string, sortBy?: string, limit?: number}} options
 * @returns {Promise<{username: string, imageUrl: string, totalGames: number, totalGoals: number, totalVictories: number, averageGoals: number, winRate: number}[]>}
 */
export const retrievePlayersStats = async (
  client,
  { userId = null, duration = null, sortBy = "total_games", limit = null } = {}
) => {
  const res = await client.query(
    `SELECT 
        gp.user_id,
        u.username, 
        u.image_url, 
        COUNT(DISTINCT gp.game_id) AS total_games, 
        SUM(gp.goals) AS total_goals,
        SUM(gp.goals)::numeric / NULLIF(COUNT(DISTINCT gp.game_id), 0) AS average_goals,
        COUNT(DISTINCT wtv.game_id) AS total_victories,
        ROUND((COUNT(DISTINCT wtv.game_id)::numeric / NULLIF(COUNT(DISTINCT gp.game_id), 0)) * 100, 2) AS win_rate
       FROM game_players gp
       JOIN users u ON gp.user_id = u.id
       JOIN games g ON gp.game_id = g.id
       LEFT JOIN winning_teams_view wtv ON gp.game_id = wtv.game_id AND gp.team = wtv.winning_team
       WHERE ($1::int IS NULL OR gp.user_id = $1)
         AND ($2::interval IS NULL OR g.created_at >= NOW() - $2::interval)
       GROUP BY gp.user_id, u.username, u.image_url
       ORDER BY ${sortBy} DESC
       LIMIT $3`,
    [userId, duration, limit]
  );

  if (res.rows.length === 0 && userId !== null) {
    return [DEFAULT_STATS];
  }

  return res.rows.map((row) => ({
    username: row.username,
    imageUrl: row.image_url,
    totalGames: parseInt(row.total_games, 10),
    totalGoals: parseInt(row.total_goals, 10),
    totalVictories: parseInt(row.total_victories, 10),
    averageGoals: parseFloat(row.average_goals) || 0,
    winRate: parseFloat(row.win_rate) || 0,
  }));
};
