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
  setGameStarted,
} from "../../../models/games.js";
import { query } from "../../../models/index.js";
// eslint-disable-next-line no-unused-vars
import { Session } from "express-session";

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
    await query("BEGIN");

    try {
      await handleJoinGame(socket, session, tableId, team, position);
      await query("COMMIT");
    } catch (error) {
      console.error("Error handling joinGame:", error);
      await query("ROLLBACK");
      socket.emit("error", "Fehler beim Beitreten des Spiels!"); // TODO
      socket.disconnect();
    }
  });
};

/**
 * - creates a new game if there is no active/waiting game for the given tableId
 * - checks if the user can join the game (not already in, position/team not taken, game not full)
 * - adds/updates the user in the game_players table
 * - emits the updated player list to all users in the game room
 *
 * @param {Socket} socket
 * @param {Session} session
 * @param {string} tableId
 * @param {string} team
 * @param {string} position
 */
async function handleJoinGame(socket, session, tableId, team, position) {
  const game = await createAndGetGameIfNotExists(
    socket,
    tableId,
    session.userId
  );

  console.log("Game found/created:", game);
  await updateOrAddPlayer(socket, game, session.userId, position, team);

  const roomName = `table-${tableId}`;
  socket.join(roomName);

  const users = await emitUpdatedUsers(socket, roomName, game.id);

  // start game if there are 4 players
  if (users.length === 3) {
    // TODO: set to 4
    await startGame(socket, game.id, roomName);
  }
}

async function createAndGetGameIfNotExists(socket, tableId, userId) {
  const game = await retrieveCurrentGameByTableId(tableId);
  const users = await retrieveUsersByGameId(game?.id);
  const doesGameExist = !!game;
  const isGameActive = game && game.status === "active";

  // if there's no started game, we start a new one
  // if there is an active game, we don't allow joining unless the user is already in the game (rejoining after refresh)
  // only if the game is in state 'waiting' we allow joining
  if (!doesGameExist) {
    return await createGame(tableId);
  } else if (isGameActive && !isUserInGame(users, userId)) {
    socket.emit("error", "Spiel ist bereits aktiv!"); // TODO
    return socket.disconnect();
  }

  return game;
}

async function updateOrAddPlayer(socket, game, userId, position, team) {
  const users = await retrieveUsersByGameId(game.id);

  // if there are already 4 players, or if the position is already taken, we don't allow joining
  if (users.length >= 4) {
    // game is full
    socket.emit("error", "Spiel ist voll!"); // TODO
    return socket.disconnect();
  }

  // the user is already in the game as checked in the previous function, but we don't allow updating position/team
  if (game.status === "active") return;

  // if the user is already in the game we allow updating their position/team
  // condition checking is done by postgres constraints
  if (isUserInGame(users, userId)) {
    return await updateUserFromGame(game.id, userId, position, team);
  } else {
    return await addUserToGame(game.id, userId, position, team);
  }
}

function isUserInGame(users, userId) {
  return users.some((p) => p.user_id === userId);
}

async function emitUpdatedUsers(socket, roomName, gameId) {
  const users = await retrieveUsersByGameId(gameId);
  socket.emit("currentPlayers", users); // send to the user who just joined
  socket.to(roomName).emit("currentPlayers", users); // send to others in the room

  return users;
}

async function startGame(socket, gameId, roomName) {
  await setGameStarted(gameId);
  socket.to(roomName).emit("gameStarted");
  socket.emit("gameStarted");
}

export default gameSocket;
