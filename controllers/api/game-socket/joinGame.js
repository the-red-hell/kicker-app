import console from "console";
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
import { pool } from "../../../models/index.js";
// eslint-disable-next-line no-unused-vars
import { Session } from "express-session";

const joinGame = async (socket, session, tableId, position, team) => {
  const client = await pool.connect();
  await client.query("BEGIN");

  try {
    await handleJoinGame(client, socket, session, tableId, position, team);
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error handling joinGame:", error);
    await client.query("ROLLBACK");

    // postgres unique_violation
    if (error.code === "23505") {
      socket.emit("error", "Zu langsam! Position oder Team bereits besetzt!"); // TODO
    } else if (error.message === "GAME_FULL") {
      // game is full
      socket.emit("error", "Spiel ist voll!"); // TODO
    } else if (error.message === "GAME_ACTIVE") {
      socket.emit("error", "Spiel ist bereits aktiv!"); // TODO
    } else {
      console.error(error);
      socket.emit("error", "Fehler beim Beitreten des Spiels!"); // TODO
    }

    socket.disconnect();
  }
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
 * @param {string} position
 * @param {string} team
 */
async function handleJoinGame(
  client,
  socket,
  session,
  tableId,
  position,
  team
) {
  const game = await createAndGetGameIfNotExists(
    client,
    tableId,
    session.userId
  );

  console.log("Game found/created:", game);
  await updateOrAddPlayer(client, game, session.userId, position, team);

  const roomName = `table-${tableId}`;
  socket.join(roomName);

  const users = await emitUserUpdate(client, socket, roomName, game.id);

  // start game if there are 4 players
  if (users.length === 2) {
    // TODO: set to 4
    await startGame(client, socket, game.id, roomName);
  }
}

async function createAndGetGameIfNotExists(client, tableId, userId) {
  const game = await retrieveCurrentGameByTableId(client, tableId);
  const users = await retrieveUsersByGameId(client, game?.id);
  const doesGameExist = !!game;
  const isGameActive = game && game.status === "active";

  // if there's no started game, we start a new one
  // if there is an active game, we don't allow joining unless the user is already in the game (rejoining after refresh)
  // only if the game is in state 'waiting' we allow joining
  if (!doesGameExist) {
    return await createGame(client, tableId);
  } else if (isGameActive && !isUserInGame(users, userId)) {
    throw new Error("GAME_ACTIVE");
  }

  return game;
}

async function updateOrAddPlayer(client, game, userId, position, team) {
  const users = await retrieveUsersByGameId(client, game.id);

  // if there are already 4 players, or if the position is already taken, we don't allow joining
  if (users.length >= 4) {
    throw new Error("GAME_FULL");
  }

  // the user is already in the game as checked in the previous function, but we don't allow updating position/team
  if (game.status === "active") return;

  // if the user is already in the game we allow updating their position/team
  // condition checking is done by postgres constraints
  if (isUserInGame(users, userId)) {
    return await updateUserFromGame(client, game.id, userId, position, team);
  } else {
    return await addUserToGame(client, game.id, userId, position, team);
  }
}

function isUserInGame(users, userId) {
  return users.some((p) => p.user_id === userId);
}

async function emitUserUpdate(client, socket, roomName, gameId) {
  const users = await retrieveUsersByGameId(client, gameId);
  socket.emit("currentPlayers", users); // send to the user who just joined
  socket.to(roomName).emit("currentPlayers", users); // send to others in the room

  return users;
}

async function startGame(client, socket, gameId, roomName) {
  await setGameStarted(client, gameId);
  socket.to(roomName).emit("gameStarted");
  socket.emit("gameStarted");
}

export default joinGame;
