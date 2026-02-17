// eslint-disable-next-line no-unused-vars
import { Socket } from "socket.io";
import {
  pgToJsArray,
  retrieveCurrentGameByTableId,
  undoGoalInGame,
} from "../../../models/games.js";
import { pool } from "../../../models/index.js";
// eslint-disable-next-line no-unused-vars
import { Client } from "pg";
import { emitGoalUpdate } from "./goalScored.js";
import { retrieveUsersByGameId } from "../../../models/gamePlayers.js";
import console from "console";

/**
 *
 * @param {Socket} socket
 * @param {string} tableId
 * @param {string} team
 */
async function undoGoal(socket, tableId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updatedGame = await handleUndoGoal(client, socket, tableId);

    await client.query("COMMIT");

    emitGoalUpdate(socket, tableId, updatedGame);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error undoing goal:", error);
    socket.emit("error", "Fehler beim Rückgängig machen des Tores!"); // TODO
  } finally {
    client.release();
  }
}

/**
 * checks:
 * - if the game is active
 * - if the user is part of the game
 * - if the last goal was scored by the user's team
 *
 * @param {Client} client
 * @param {Socket} socket
 * @param {string} tableId
 * @param {string} team
 * @returns
 */
async function handleUndoGoal(client, socket, tableId) {
  const session = socket.request.session;
  const game = await retrieveCurrentGameByTableId(client, tableId);

  if (!game || game.status !== "active") {
    // the user should not get to this point with the UI
    socket.emit("error", "Ungültige Anfrage!"); // TODO
    await client.query("ROLLBACK");
    return;
  }

  // get the user
  const users = await retrieveUsersByGameId(client, game.id);
  const user = users.find((p) => p.user_id === session.userId);

  // user is not in-game
  if (!user) {
    await client.query("ROLLBACK"); // TODO
    return game;
  }

  // goal is not from team
  if (user.team !== pgToJsArray(game.last_goal_teams).pop()) {
    socket.emit("error", "Das letzte Tor ist nicht von deinem Team.");
    await client.query("ROLLBACK"); // TODO
    return game;
  }

  // finally, undo the goal
  const updatedGame = await undoGoalInGame(client, game.id);
  return updatedGame;
}

export default undoGoal;
