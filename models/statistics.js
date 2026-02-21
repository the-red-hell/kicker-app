/**
 *
 * @param {Client} client
 * @param {number} num
 * @returns {Promise<{username: string, imageUrl: string, totalGoals: number}[]>}
 */
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
  return res.rows.map((row) => ({
    username: row.username,
    imageUrl: row.image_url,
    totalGoals: parseInt(row.total_goals, 10),
  }));
};

/**
 *
 * @param {Client} client
 * @param {number} num
 * @returns {Promise<{username: string, imageUrl: string, victories: number}[]>}
 */
// I have tried coming up with sth myself but no way
export const retrieveTopPlayersByVictories = async (client, num) => {
  const res = await client.query(
    `WITH player_victories AS (
        SELECT
            gp.user_id,
            COUNT(wtv.winning_team) as victories
        FROM game_players gp
        JOIN winning_teams_view wtv ON gp.game_id = wtv.game_id AND gp.team = wtv.winning_team
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
    [num]
  );
  return res.rows.map((row) => ({
    username: row.username,
    imageUrl: row.imageUrl,
    victories: parseInt(row.victories, 10),
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
