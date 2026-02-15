/**
 * - checks active games on table
 * - renders join game page with table id and position, which in turn creates a socket connection to the server and joins the game room
 *
 * @param {Request} req
 * @param {Response} res
 */
export const joinGame = (req, res) => {
  const { tableId, pos } = req.query;
  res.render("join-game", { title: "Join Game", tableId, pos });
};
