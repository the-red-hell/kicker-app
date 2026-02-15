import { setGameStarted } from "../../../models/games.js";

export const startGame = async (req, res) => {
  await setGameStarted(req.body.gameId);
  res.status(200).send("Game started");
};
