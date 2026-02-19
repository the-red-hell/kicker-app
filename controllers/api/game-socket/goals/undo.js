import {
  retrieveCurrentGameByTableId,
  retrieveGoalsPerTeamByGameId,
  undoGoalInGame,
} from "../../../../models/games.js";
import { pool } from "../../../../models/index.js";
// eslint-disable-next-line no-unused-vars
import { Client } from "pg";
import console from "console";
import { emitGoalUpdate, isUserInGame } from "./common.js";
// eslint-disable-next-line no-unused-vars
import { Server } from "socket.io";

/**
 *
 * @param {Server} io
 * @param {Socket} socket
 * @param {string} tableId
 */
async function undoGoal(io, socket, tableId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (!(await isUserInGame(client, socket, tableId)))
      await client.query("ROLLBACK");
    else {
      const updatedGoals = await handleUndoGoal(client, tableId);
      const roomName = `table-${tableId}`;
      await emitGoalUpdate(io, roomName, updatedGoals);
      io.to(roomName).emit("undoGoal");
      await client.query("COMMIT");
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
 * @param {string} tableId
 * @param {string} team
 * @returns the updated game if successful, undefined otherwise
 */
async function handleUndoGoal(client, tableId) {
  const game = await retrieveCurrentGameByTableId(client, tableId);

  await undoGoalInGame(client, game.id);
  const updatedGoals = await retrieveGoalsPerTeamByGameId(client, game.id);
  return updatedGoals;
}

export default undoGoal;
