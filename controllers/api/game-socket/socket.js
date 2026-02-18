import console from "console";
// eslint-disable-next-line no-unused-vars
import { Server, Socket } from "socket.io";
import joinGame from "./joinGame.js";
import goalScored from "./goals/score.js";
import { possiblePositions, possibleTeams } from "../../../models/types.js";
import undoGoal from "./goals/undo.js";

/**
 * @param {Server} io
 * @param {Socket} socket
 */
const gameSocket = (io, socket) => {
  const session = socket.request.session;

  if (!session || !session.userId) {
    console.log("Unauthenticated user attempted to connect to game socket");
    socket.disconnect();
    return;
  }

  socket.on("joinGame", async ({ tableId, team, position }) => {
    await joinGame(io, socket, tableId, position, team);
  });

  socket.on("goalScored", async ({ tableId }) => {
    await goalScored(io, socket, tableId);
  });

  socket.on("undoGoal", async ({ tableId }) => {
    await undoGoal(io, socket, tableId);
  });
};

export const validateTeamAndPos = (socket, team, position) => {
  if (!possiblePositions.includes(position) || !possibleTeams.includes(team)) {
    socket.emit("error", "Ungültige Anfrage!"); // TODO
    socket.disconnect();
  }
};

export default gameSocket;
