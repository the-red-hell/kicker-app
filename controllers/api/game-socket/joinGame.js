import console from "console";
import {
    addUserToGame,
    removeUserFromGame,
    retrieveUsersByGameId,
    updateUserFromGame,
} from "../../../models/gamePlayers.js";
import {
    createGame,
    deleteGameById,
    retrieveCurrentGameByTableId,
    retrieveGoalsPerTeamByGameId,
    setGameStarted,
} from "../../../models/games.js";
import { pool } from "../../../models/index.js";
import { emitGoalUpdate, hasAnyTeamWon } from "./goals/common.js";
import { possiblePositions, possibleTeams } from "../../../models/types.js";
import { getRoomName } from "./socket.js";
import {
    retrieveStatusTablesByUserId,
    retrieveTableById,
} from "../../../models/tables.js";
// eslint-disable-next-line no-unused-vars
import { Client } from "pg";
// eslint-disable-next-line no-unused-vars
import { Socket } from "socket.io";

const TABLE_IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minute

const joinGame = async (io, socket, tableId, position, team) => {
    validateTeamAndPos(socket, team, position);

    const client = await pool.connect();
    await client.query("BEGIN");

    try {
        await handleJoinGame(client, io, socket, tableId, position, team);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");

        // postgres unique_violation
        if (error.code === "23505") {
            socket.emit("error", "Too slow! Position or team already taken!");
        } else if (error.message === "GAME_FULL") {
            // game is full
            socket.emit("error", "Table is already full!");
        } else if (error.message === "TABLE_NOT_FOUND") {
            socket.emit("error", "Table not found!");
        } else {
            console.error("Error handling joinGame:", error);
            socket.emit("error", "Error joining the game!");
        }

        socket.disconnect();
    } finally {
        client.release();
    }
};

/**
 * - creates a new game if there is no active/waiting game for the given tableId
 * - checks if the user can join the game (not already in, position/team not taken, game not full)
 * - adds/updates the user in the game_players table
 * - emits the updated player list to all users in the game room
 *
 * @param {Socket} socket
 * @param {number} tableId
 * @param {string} position
 * @param {string} team
 */
async function handleJoinGame(client, io, socket, tableId, position, team) {
    const session = socket.request.session;

    await handleIdleTable(client, io, tableId);

    // first, check whether the user is already on another table
    if (
        await handleUserAlreadyPlayingAnotherGame(
            client,
            socket,
            tableId,
            session
        )
    )
        return;

    const game = await createAndGetGameIfNotExists(client, tableId);
    const users = await retrieveUsersByGameId(client, game?.id);

    const roomName = getRoomName(tableId);
    socket.join(roomName);

    // send current players out, no matter if the user is obligated to join
    // (if your position is taken, you gotta know whom to blame)
    socket.emit("currentPlayers", users);

    const isCurrentUserInGame = isUserInGame(users, session.userId);
    const isGameActive = game && game.status === "active";
    await handleActiveGame(
        client,
        socket,
        game,
        isGameActive,
        isCurrentUserInGame
    );
    if (isGameActive && !isCurrentUserInGame) return;

    await updateOrAddPlayer(io, client, game, session.userId, position, team);
    const updatedUsers = await emitUserUpdate(client, io, roomName, game.id);

    // start game if there are 4 players
    if (updatedUsers.length === 4 && !isGameActive) {
        await startGame(client, io, game.id, roomName);
    }
}

async function handleIdleTable(client, io, tableId) {
    // if the table doesn't exist, error
    const table = await retrieveTableById(client, tableId);
    if (!table) {
        throw new Error("TABLE_NOT_FOUND");
    }

    // check if timeout is exceeded
    const game = await retrieveCurrentGameByTableId(client, tableId);
    if (
        game &&
        game.status === "waiting" &&
        Date.now() - new Date(game.created_at) >= TABLE_IDLE_TIMEOUT
    ) {
        io.to(getRoomName(tableId)).emit(
            "error",
            "Previous game on this table has timed out due to inactivity. Starting a new game..."
        );

        await deleteGameById(client, game.id);
    }
}

async function handleUserAlreadyPlayingAnotherGame(
    client,
    socket,
    tableId,
    session
) {
    const activeTable = (
        await retrieveStatusTablesByUserId(client, "active", session.userId)
    )[0];

    if (activeTable && activeTable.id != tableId) {
        socket.emit(
            "error",
            `You are already in a game on table ${activeTable.name}! Please finish it before joining another one.`
        );
        socket.disconnect();
    }
}

/**
 * If the game doesn't exist, creates one
 * If it does, returns the current waiting game or even the active one if the user is in-game
 *
 * @param {Client} client
 * @param {string} tableId
 * @param {string} userId
 * @returns
 */
async function createAndGetGameIfNotExists(client, tableId) {
    const game = await retrieveCurrentGameByTableId(client, tableId);
    const doesGameExist = !!game;

    // if there's no started game, we start a new one
    // if there is an active game, we don't allow joining unless the user is already in the game (rejoining after refresh)
    // only if the game is in state 'waiting' we allow joining
    if (!doesGameExist) {
        return await createGame(client, tableId);
    }
    return game;
}

/**
 * game is active, user is rejoining after refresh, we just emit the current player list and game state to the user
 * or someone else might join who just wants to spectate
 *
 * returns whether the
 */
async function handleActiveGame(
    client,
    socket,
    game,
    isGameActive,
    isCurrentUserInGame
) {
    // is game already active?
    if (isGameActive) {
        const goals = await retrieveGoalsPerTeamByGameId(client, game.id);
        socket.emit("goalUpdate", goals);

        if (!isCurrentUserInGame) {
            // user can still join but no controls are given via `gameStarted` or `waitingForConfirmation`
            socket.emit("error", "Game is already active, you are spectating.");
        } else {
            socket.emit("gameStarted");
            // if the game is active and any team has already 10 points, it means that it hasn't been confirmed yet
            if (hasAnyTeamWon(goals)) socket.emit("waitingForConfirmation");
        }
    }
}

async function updateOrAddPlayer(io, client, game, userId, position, team) {
    const users = await retrieveUsersByGameId(client, game.id);
    const user = getUserFromGame(users, userId);

    // if the user is already in the game we allow updating their position/team
    // condition checking is done by postgres constraints
    if (user !== undefined && user.game_id == game.id) {
        return await updateUserFromGame(
            client,
            game.id,
            userId,
            position,
            team
        );
    } else {
        const waitingTable = (
            await retrieveStatusTablesByUserId(client, "waiting", userId)
        )[0];
        if (waitingTable && waitingTable.id !== game.table_id) {
            await removeUserFromGame(client, waitingTable.game_id, userId);
            await emitUserUpdate(
                client,
                io,
                getRoomName(waitingTable.id),
                waitingTable.game_id
            );
        }
        return await addUserToGame(client, game.id, userId, position, team);
    }
}

function isUserInGame(users, userId) {
    return users.some((p) => p.user_id === userId);
}

function getUserFromGame(users, userId) {
    return users.find((p) => p.user_id === userId);
}

async function emitUserUpdate(client, io, roomName, gameId) {
    const users = await retrieveUsersByGameId(client, gameId);
    io.to(roomName).emit("currentPlayers", users); // send to all users in the room

    return users;
}

async function startGame(client, io, gameId, roomName) {
    await setGameStarted(client, gameId);
    io.to(roomName).emit("gameStarted");
    const goals = await retrieveGoalsPerTeamByGameId(client, gameId);
    await emitGoalUpdate(io, roomName, goals);
}

function validateTeamAndPos(socket, team, position) {
    if (
        !possiblePositions.includes(position) ||
        !possibleTeams.includes(team)
    ) {
        socket.emit("error", "Invalid request!");
        socket.disconnect();
    }
}

export default joinGame;
