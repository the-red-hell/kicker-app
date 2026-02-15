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
  const { position, team } = req.query;
  if (!possiblePositions.includes(position) || !possibleTeams.includes(team)) {
    return res.status(400).send("Ungültiger link!"); // TODO
  }
  if (!tableId || !(await retrieveTableById(tableId))) {
    return res.status(404).send("Tisch nicht gefunden!"); // TODO
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
