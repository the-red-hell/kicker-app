import console from "console";
import { pool } from "../../../models/index.js";
import { retrieveUsersByGameId } from "../../../models/gamePlayers.js";
import {
  retrieveCurrentGameByTableId,
  scoreGoal,
} from "../../../models/games.js";

const GOAL_COOLDOWN_MS = 5000;

const goalScored = async (socket, session, tableId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await handleGoalScored(client, socket, session, tableId);

    await client.query("COMMIT");
  } catch (error) {
    console.error("Error handling goalScored:", error);
    await client.query("ROLLBACK");
    socket.emit("error", "Fehler beim Verarbeiten des Torerfolgs!");
  } finally {
    client.release();
  }
};

async function handleGoalScored(client, socket, session, tableId) {
  const now = new Date();

  const game = await retrieveCurrentGameByTableId(client, tableId);

  // game is not active
  if (!game || game.status !== "active") {
    await client.query("ROLLBACK");
    return;
  }

  const users = await retrieveUsersByGameId(client, game.id);
  const user = users.find((p) => p.user_id === session.userId);
  // user is not in-game
  if (!user) {
    await client.query("ROLLBACK");
    return;
  }

  // no goal has been scored in the last GOAL_COOLDOWN_MS milliseconds
  if (now - new Date(game.last_goal_time) < GOAL_COOLDOWN_MS) {
    await client.query("ROLLBACK");
    return;
  }

  // Update the score within the transaction
  const updatedGame = await scoreGoal(client, game.id, user.team);

  if (!updatedGame) {
    throw new Error("Game not found or not active when scoring!");
  }

  await emitGoalUpdate(socket, tableId, updatedGame);
}

async function emitGoalUpdate(socket, tableId, updatedGame) {
  const roomName = `table-${tableId}`;
  const update = {
    pointsWhite: updatedGame.points_white,
    pointsBlack: updatedGame.points_black,
  };
  socket.to(roomName).emit("goalUpdate", update);
  socket.emit("goalUpdate", update);
}

export default goalScored;
