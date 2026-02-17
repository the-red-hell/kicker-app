import { retrieveUsersByGameId } from "../../models/gamePlayers.js";
import { retrieveCurrentGameByTableId } from "../../models/games.js";
import { pool } from "../../models/index.js";
import { retrieveTableById } from "../../models/tables.js";
import { possiblePositions, possibleTeams } from "../../models/types.js";

/**
 * - checks active games on table
 * - renders join game page with table id and position, which in turn creates a socket connection to the server and joins the game room
 *
 * @param {Request} req
 * @param {Response} res
 */
export const joinGame = async (req, res) => {
  const { tableId } = req.params;
  let { position, team } = req.query;
  // is the link valid
  if (!possiblePositions.includes(position) || !possibleTeams.includes(team)) {
    return res.status(400).send("Ungültiger link!"); // TODO
  }
  // does the table exist
  if (!tableId || !(await retrieveTableById(tableId))) {
    return res.status(404).send("Tisch nicht gefunden!"); // TODO
  }

  const userInGame = await canUserJoin(
    tableId,
    req.session.userId,
    position,
    team
  );
  if (userInGame === false) {
    return res.status(400).send("Position bereits besetzt!"); // TODO
  } else if (userInGame) {
    position = userInGame.position;
    team = userInGame.team;
  }

  res.render("game/activeGame", { title: "Game", tableId, position, team });
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
 * @returns - false if the user is not obligated to join,
 *          - { position, team } if the user is in-game but want's to change position/team, / if he's in-game and the game is active
 *          - undefined if the user is not in-game and the position/team is available
 */
async function canUserJoin(tableId, userId, position, team) {
  const client = await pool.connect();
  try {
    const game = await retrieveCurrentGameByTableId(client, tableId);
    if (game) {
      const users = await retrieveUsersByGameId(client, game.id);
      const userInGame = users.find((user) => user.user_id === userId);
      const isPositionAndTeamTaken = users.some(
        (user) => user.position === position && user.team === team
      );

      if (game.status === "active" && !userInGame) {
        return false;
      }
      if (userInGame && (isPositionAndTeamTaken || game.status === "active")) {
        return { position: userInGame.position, team: userInGame.team }; // TODO: maybe show a message
      } else if (isPositionAndTeamTaken) {
        return false;
      }
    }
  } finally {
    client.release();
  }
}
