// eslint-disable-next-line no-unused-vars
import { Client } from "pg";

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

export const setGameEnded = async (client, gameId) => {
    const res = await client.query(
        "UPDATE games SET ended_at = NOW(), status = 'ended' WHERE id = $1 RETURNING *",
        [gameId]
    );
    return res.rows[0];
};

export const scoreGoal = async (client, gameId, userId) => {
    const gamePlayersUpdateRes = await client.query(
        `UPDATE game_players SET goals = goals + 1 WHERE game_id = $1 AND user_id = $2 RETURNING *`,
        [gameId, userId]
    );
    const gameUpdateSql = `UPDATE games SET last_goal_time = NOW(), last_goal_player_ids = array_append(last_goal_player_ids, $2) WHERE id = $1 RETURNING *`;
    const gameUpdateRes = await client.query(gameUpdateSql, [
        gameId,
        gamePlayersUpdateRes.rows[0].user_id,
    ]);

    return gameUpdateRes.rows[0];
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
 * @returns {Promise<{white: number, black: number}>}
 */
export const retrieveGoalsPerTeamByGameId = async (client, gameId) => {
    const res = await client.query(
        `SELECT team, SUM(goals) as total_goals FROM game_players 
     WHERE game_id = $1
     GROUP BY team`,
        [gameId]
    );

    const goals = { white: 0, black: 0 };
    res.rows.forEach((row) => {
        goals[row.team] = parseInt(row.total_goals, 10);
    });
    return goals;
};

/**
 *
 * @param {Client} client
 * @param {string} gameId
 * @returns {Promise<Array<{username: string, goals: number}>>}
 */
export const retrieveGoalsPerUserByGameId = async (client, gameId) => {
    const res = await client.query(
        `SELECT u.username, gp.goals FROM game_players gp
     JOIN users u ON gp.user_id = u.id
     WHERE gp.game_id = $1`,
        [gameId]
    );

    return res.rows.map((row) => ({
        username: row.username,
        goals: row.goals,
    }));
};

/**
 *
 * @param {Client} client
 * @param {string} gameId
 * @returns {Promise<Object>} the game with the updated last_goal_player_ids array
 */
export const undoGoalInGame = async (client, gameId) => {
    // first, get the last scoring game_player
    const gameRes = await client.query(
        "SELECT last_goal_player_ids FROM games WHERE id = $1 FOR UPDATE",
        [gameId]
    );

    const lastGoalGamePlayerId = gameRes.rows[0].last_goal_player_ids.pop();
    if (!lastGoalGamePlayerId) {
        // no goals to undo
        return gameRes.rows[0];
    }

    // update the game_player's goals
    await client.query(
        `UPDATE game_players 
     SET goals = goals - 1 
     WHERE game_id = $1 AND user_id = $2
     RETURNING *`,
        [gameId, lastGoalGamePlayerId]
    );

    // update the game
    const updateGames = await client.query(
        `UPDATE games 
     SET 
       last_goal_player_ids = last_goal_player_ids[1:array_length(last_goal_player_ids, 1)-1]
     WHERE id = $1 
     RETURNING *`, // postgresql arrays start at 1
        [gameId]
    );
    return updateGames.rows[0];
};

export const deleteGameById = async (client, gameId) => {
    await client.query("DELETE FROM games WHERE id = $1", [gameId]);
};
