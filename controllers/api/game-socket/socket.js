import console from "console";
// eslint-disable-next-line no-unused-vars
import { Socket } from "socket.io";

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

  socket.on("joinGame", ({ tableId, team, position }) => {
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
