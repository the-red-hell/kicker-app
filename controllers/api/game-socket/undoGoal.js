import {
  retrieveCurrentGameByTableId,
  retrieveGoalsPerTeamByGameId,
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
async function undoGoal(io, socket, tableId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updatedGoals = await handleUndoGoal(client, socket, tableId);

    if (updatedGoals) {
      const roomName = `table-${tableId}`;
      await emitGoalUpdate(io, roomName, updatedGoals);
      await client.query("COMMIT");
    } else {
      await client.query("ROLLBACK");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error undoing goal:", error);
    socket.emit("error", "Error undoing goal!"); // TODO
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
 * @returns the updated game if successful, undefined otherwise
 */
async function handleUndoGoal(client, socket, tableId) {
  const session = socket.request.session;
  const game = await retrieveCurrentGameByTableId(client, tableId);

  if (!game || game.status !== "active") {
    // the user should not get to this point with the UI
    socket.emit("error", "Ungültige Anfrage!"); // TODO
    return;
  }

  // get the user
  const users = await retrieveUsersByGameId(client, game.id);
  const user = users.find((p) => p.user_id === session.userId);

  // user is not in-game
  if (!user) {
    return game;
  }

  // finally, undo the goal
  await undoGoalInGame(client, game.id);
  const updatedGoals = await retrieveGoalsPerTeamByGameId(client, game.id);
  return updatedGoals;
}

export default undoGoal;
