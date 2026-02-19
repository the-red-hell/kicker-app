import console from "console";
import { pool } from "../../../../models/index.js";
import {
  retrieveCurrentGameByTableId,
  retrieveGoalsPerTeamByGameId,
  retrieveGoalsPerUserByGameId,
  scoreGoal,
  setGameEnded,
} from "../../../../models/games.js";
// eslint-disable-next-line no-unused-vars
import { Client } from "pg";
// eslint-disable-next-line no-unused-vars
import { Server, Socket } from "socket.io";
import { emitGoalUpdate, isUserInGame } from "./common.js";
import { getRoomName } from "../socket.js";

const GOAL_COOLDOWN_MS = 1000;
const GOALS_TO_WIN = 10;

const goalScored = async (io, socket, tableId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updatedGoals = await handleGoalScored(client, io, socket, tableId);

    if (updatedGoals) {
      await client.query("COMMIT");
      await emitGoalUpdate(io, getRoomName(tableId), updatedGoals);
    } else {
      await client.query("ROLLBACK");
    }
  } catch (error) {
    console.error("Error handling goalScored:", error);
    await client.query("ROLLBACK");
    socket.emit("error", "Error handling scoring the goal!");
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
  // check if user is part of the game
  if (!(await isUserInGame(client, socket, tableId))) return;

  // no goal has been scored in the last GOAL_COOLDOWN_MS milliseconds
  const now = new Date();
  const game = await retrieveCurrentGameByTableId(client, tableId);
  if (now - new Date(game.last_goal_time) < GOAL_COOLDOWN_MS) {
    return;
  }

  // check if game is won
  const roomName = getRoomName(tableId);
  if (await isGameWon(io, client, game.id, roomName)) return;

  // update the score
  const session = socket.request.session;
  const updatedGame = await scoreGoal(client, game.id, session.userId);

  if (!updatedGame) {
    throw new Error("Game not found or not active when scoring!");
  }

  const updatedGoals = await retrieveGoalsPerTeamByGameId(client, game.id);

  // announce that (if it's the last goal) it has to be confirmed
  if (hasAnyTeamWon(updatedGoals)) {
    io.to(roomName).emit("waitingForConfirmation");
  }
  return updatedGoals;
}

async function isGameWon(io, client, gameId, roomName) {
  const goals = await retrieveGoalsPerTeamByGameId(client, gameId);

  if (hasAnyTeamWon(goals)) {
    await handleEndGame(io, client, goals, gameId, roomName);
    return true;
  }
  return false;
}

async function handleEndGame(io, client, goals, gameId, roomName) {
  await setGameEnded(client, gameId);

  await emitGoalUpdate(io, roomName, goals);
  const goalsPerUser = await retrieveGoalsPerUserByGameId(client, gameId);

  io.to(roomName).emit("gameOver", {
    winnerTeam: goals.black === GOALS_TO_WIN ? "black" : "white",
    stats: {
      goalsPerUser,
    },
  });

  io.in(roomName).disconnectSockets();
}

function hasAnyTeamWon(goals) {
  return goals.black === GOALS_TO_WIN || goals.white === GOALS_TO_WIN;
}

export default goalScored;
