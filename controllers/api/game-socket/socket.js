import console from "console";
// eslint-disable-next-line no-unused-vars
import { Socket } from "socket.io";
import {
  addUserToGame,
  retrieveUsersByGameId,
  updateUserFromGame,
} from "../../../models/gamePlayers.js";
import {
  createGame,
  retrieveCurrentGameByTableId,
} from "../../../models/games.js";

/**
 *
 * @param {Socket} socket
 */
const gameSocket = (socket) => {
  const session = socket.request.session;
  console.log("A user connected to the game socket, ", session);

  if (!session || !session.userId) {
    console.log("Unauthenticated user attempted to connect to game socket");
    socket.disconnect();
    return;
  }

  socket.on("joinGame", async ({ tableId, team, position }) => {
    const game = await retrieveCurrentGameByTableId(tableId);
    const doesGameExist = !!game;
    const isGameActive = game && game.status === "active";

    // if there's no started game, we start a new one
    // if there is an active game, we don't allow joining
    // only if the game is in state 'waiting' we allow joining, but only if there are less than 4 players
    console.log({ doesGameExist, isGameActive, game });
    if (!doesGameExist) {
      await createGame(tableId);
    } else if (isGameActive) {
      socket.emit("error", "Spiel ist nicht aktiv!"); // TODO
      return socket.disconnect();
    }

    const users = await retrieveUsersByGameId(game.id);

    // if there are already 4 players, or if the position is already taken, we don't allow joining
    // if the user is already in the game, we allow updating their position/team
    if (users.length >= 4) {
      // game is full
      socket.emit("error", "Spiel ist voll!"); // TODO
      return socket.disconnect();
    }
    if (users.some((p) => p.user_id === session.userId)) {
      // user already in game, update them
      await updateUserFromGame(game.id, session.userId, position, team);
    } else if (users.some((p) => p.position === position && p.team === team)) {
      // position & team already taken
      socket.emit("error", "Position bereits besetzt!"); // TODO
      return socket.disconnect();
    } else {
      // join game
      await addUserToGame(game.id, session.userId, position, team);
    }

    const roomName = `table-${tableId}`;
    socket.join(roomName);

    const usersNow = await retrieveUsersByGameId(game.id);
    socket.emit("currentPlayers", usersNow); // send to the user who just joined
    socket.to(roomName).emit("currentPlayers", usersNow); // send to others in the room

    // TODO: if the game is now full, we start it and emit an event to all players in the room
  });
};

export default gameSocket;
