import { possiblePositions, possibleTeams } from "../../models/types.js";

/**
 * - checks active games on table
 * - renders join game page with table id and position, which in turn creates a socket connection to the server and joins the game room
 *
 * @param {Request} req
 * @param {Response} res
 */
export const joinGame = (req, res) => {
  const { tableId, position, team } = req.query;
  if (!possiblePositions.includes(position) || !possibleTeams.includes(team)) {
    return res.status(400).send("Ungültiger link!");
  }
  res.render("game", { title: "Game", tableId, position, team });
};
