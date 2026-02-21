import { retrieveUsersByGameId } from "../../../../models/gamePlayers.js";
import { retrieveCurrentGameByTableId } from "../../../../models/games.js";

export const GOALS_TO_WIN = 10;

export const isUserInGame = async (client, socket, tableId) => {
  const session = socket.request.session;
  const game = await retrieveCurrentGameByTableId(client, tableId);

  if (!game || game.status !== "active") {
    // the user should not get to this point with the UI
    socket.emit("error", "Game not active!");
    return false;
  }

  // get the user
  const users = await retrieveUsersByGameId(client, game.id);
  const user = users.find((p) => p.user_id === session.userId);

  // user is not in-game
  if (!user) {
    socket.emit("error", "You are not in the game!");
    return false;
  }

  return true;
};

export const emitGoalUpdate = async (io, roomName, goals) => {
  io.to(roomName).emit("goalUpdate", goals);
};

export const hasAnyTeamWon = (goals) => {
  return goals.black === GOALS_TO_WIN || goals.white === GOALS_TO_WIN;
};
