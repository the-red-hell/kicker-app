import { retrieveUsersByGameId } from "../../models/gamePlayers.js";
import { retrieveCurrentGameByTableId } from "../../models/games.js";
import { pool } from "../../models/index.js";
import { possiblePositions, possibleTeams } from "../../models/types.js";

/**
 * - checks active games on table
 * - renders join game page with table id and position, which in turn creates a socket connection to the server and joins the game room
 *
 * @param {Request} req
 * @param {Response} res
 */
export const joinGame = async (req, res) => {
    const client = await pool.connect();
    try {
        const { tableId } = req.params;
        let { position, team } = req.query;

        // is the link valid
        if (
            !possiblePositions.includes(position) ||
            !possibleTeams.includes(team)
        ) {
            const originalUrl =
                req.headers["x-original-uri"] || req.originalUrl;
            return res.status(400).render("404", {
                title: "404 - Not Found",
                originalUrl,
                message: "Invalid position or team in the URL",
            });
        }

        const userInGame = await getUserTeamPos(
            tableId,
            req.session.userId,
            position,
            team
        );
        if (userInGame) {
            position = userInGame.position;
            team = userInGame.team;
        }

        res.render("game/activeGame", {
            title: "Game",
            tableId,
            position,
            team,
        });
    } finally {
        client.release();
    }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
export const gamePage = (req, res) => {
    res.render("game", { title: "Game" });
};

/**
 *
 * @param {string} tableId
 * @param {string} userId
 * @param {string} position
 * @param {string} team
 * @returns - { position, team } if the user is in-game but want's to change position/team, / if he's in-game and the game is active
 *          - undefined if the user is not in-game and the position/team is available
 */
async function getUserTeamPos(tableId, userId, position, team) {
    const client = await pool.connect();
    try {
        const game = await retrieveCurrentGameByTableId(client, tableId);

        if (game) {
            const users = await retrieveUsersByGameId(client, game.id);
            const userInGame = users.find((user) => user.user_id === userId);
            const isPositionAndTeamTaken = users.some(
                (user) => user.position === position && user.team === team
            );

            if (
                userInGame &&
                (isPositionAndTeamTaken || game.status === "active")
            ) {
                return { position: userInGame.position, team: userInGame.team }; // TODO: maybe show a message
            }
        }
    } finally {
        client.release();
    }
}
