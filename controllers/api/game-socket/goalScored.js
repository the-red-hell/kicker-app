import console from "console";
import { pool } from "../../../models/index.js";
import { retrieveUsersByGameId } from "../../../models/gamePlayers.js";
import {
  retrieveCurrentGameByTableId,
  retrieveGoalsByGameId,
  scoreGoal,
} from "../../../models/games.js";

const GOAL_COOLDOWN_MS = 5000;

const goalScored = async (socket, tableId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updatedGameId = await handleGoalScored(client, socket, tableId);

    await client.query("COMMIT");

    const roomName = `table-${tableId}`;
    if (updatedGameId) await emitGoalUpdate(socket, roomName, updatedGameId);
  } catch (error) {
    console.error("Error handling goalScored:", error);
    await client.query("ROLLBACK");
    socket.emit("error", "Fehler beim Verarbeiten des Torerfolgs!");
  } finally {
    client.release();
  }
};

async function handleGoalScored(client, socket, tableId) {
  const now = new Date();
  const session = socket.request.session;

  const game = await retrieveCurrentGameByTableId(client, tableId);

  // game is not active
  if (!game || game.status !== "active") {
    await client.query("ROLLBACK");
    return;
  }

  const gamePlayers = await retrieveUsersByGameId(client, game.id);
  const gamePlayer = gamePlayers.find((p) => p.user_id === session.userId);
  // user is not in-game
  if (!gamePlayer) {
    await client.query("ROLLBACK");
    return;
  }

  // no goal has been scored in the last GOAL_COOLDOWN_MS milliseconds
  if (now - new Date(game.last_goal_time) < GOAL_COOLDOWN_MS) {
    await client.query("ROLLBACK");
    return;
  }

  // Update the score within the transaction
  const updatedGame = await scoreGoal(client, game.id, session.userId);

  if (!updatedGame) {
    throw new Error("Game not found or not active when scoring!");
  }

  return updatedGame.id;
}

export const emitGoalUpdate = async (socket, roomName, gameId) => {
  const goalUpdate = await retrieveGoalsByGameId(pool, gameId);

  socket.to(roomName).emit("goalUpdate", goalUpdate);
  socket.emit("goalUpdate", goalUpdate);
};

export default goalScored;
