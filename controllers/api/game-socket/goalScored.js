import console from "console";
import { pool } from "../../../models/index.js";
import { retrieveUsersByGameId } from "../../../models/gamePlayers.js";
import {
  retrieveCurrentGameByTableId,
  retrieveGoalsPerTeamByGameId,
  retrieveGoalsPerUserByGameId,
  scoreGoal,
  setGameEnded,
} from "../../../models/games.js";
// eslint-disable-next-line no-unused-vars
import { Client } from "pg";
// eslint-disable-next-line no-unused-vars
import { Server, Socket } from "socket.io";

const GOAL_COOLDOWN_MS = 5000;
const GOALS_TO_WIN = 10;

const goalScored = async (io, socket, tableId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updatedGoals = await handleGoalScored(client, io, socket, tableId);

    if (updatedGoals) {
      await client.query("COMMIT");
      const roomName = `table-${tableId}`;
      await emitGoalUpdate(io, roomName, updatedGoals);
    } else {
      await client.query("ROLLBACK");
    }
  } catch (error) {
    console.error("Error handling goalScored:", error);
    await client.query("ROLLBACK");
    socket.emit("error", "Fehler beim Verarbeiten des Torerfolgs!");
  } finally {
    client.release();
  }
};

/**
 *
 * @param {Server} io
 * @param {Client} client
 * @param {Socket} socket
 * @param {string} tableId
 * @returns the updated goals if successful, undefined otherwise
 */
async function handleGoalScored(client, io, socket, tableId) {
  const now = new Date();
  const session = socket.request.session;

  const game = await retrieveCurrentGameByTableId(client, tableId);

  // game is not active
  if (!game || game.status !== "active") {
    return;
  }

  const gamePlayers = await retrieveUsersByGameId(client, game.id);
  const gamePlayer = gamePlayers.find((p) => p.user_id === session.userId);
  // user is not in-game
  if (!gamePlayer) {
    return;
  }

  // no goal has been scored in the last GOAL_COOLDOWN_MS milliseconds
  if (now - new Date(game.last_goal_time) < GOAL_COOLDOWN_MS) {
    return;
  }

  // Update the score within the transaction
  const updatedGame = await scoreGoal(client, game.id, session.userId);

  if (!updatedGame) {
    throw new Error("Game not found or not active when scoring!");
  }

  // check if the game has been won
  const goals = await retrieveGoalsPerTeamByGameId(client, game.id);
  if (goals.black === GOALS_TO_WIN || goals.white === GOALS_TO_WIN) {
    await setGameEnded(client, game.id);

    const roomName = `table-${tableId}`;
    await emitGoalUpdate(io, roomName, goals);
    const goalsPerUser = await retrieveGoalsPerUserByGameId(client, game.id);
    io.to(roomName).emit("gameOver", {
      winnerTeam: goals.black === GOALS_TO_WIN ? "black" : "white",
      stats: {
        goalsPerUser,
      },
    });

    io.in(roomName).disconnectSockets();
  }

  return goals;
}

export const emitGoalUpdate = async (io, roomName, goals) => {
  io.to(roomName).emit("goalUpdate", goals);
};

export default goalScored;
