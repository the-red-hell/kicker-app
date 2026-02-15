import console from "console";
// eslint-disable-next-line no-unused-vars
import { Socket } from "socket.io";
import {
  addUserToGame,
  retrievePlayersByGameId,
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

    const players = await retrievePlayersByGameId(game.id);

    // if there are already 4 players, or if the position is already taken, we don't allow joining
    // if the user is already in the game, we allow updating their position/team
    if (players.length >= 4) {
      // game is full
      socket.emit("error", "Spiel ist voll!"); // TODO
      return socket.disconnect();
    }
    if (players.some((p) => p.user_id === session.userId)) {
      // user already in game, update them
      await updateUserFromGame(game.id, session.userId, position, team);
    } else if (
      players.some((p) => p.position === position && p.team === team)
    ) {
      // position & team already taken
      socket.emit("error", "Position bereits besetzt!"); // TODO
      return socket.disconnect();
    } else {
      // join game
      await addUserToGame(game.id, session.userId, position, team);
    }

    console.log(
      `User joining game with tableId: ${tableId}, team: ${team}, position: ${position}`
    );
    const roomName = `table-${tableId}`;
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);

    socket.to(roomName).emit("notification", `A user joined Team ${team}!`);
  });
};

export default gameSocket;
