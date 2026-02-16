import console from "console";
// eslint-disable-next-line no-unused-vars
import { Socket } from "socket.io";
import joinGame from "./joinGame.js";

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
    await joinGame(socket, session, tableId, team, position);
  });
};

export default gameSocket;
