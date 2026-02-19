import "/api/game-socket/socket.io.js";

const TABLE_ID = window.TABLE_ID;
const TEAM = window.TEAM;
const POSITION = window.POSITION;

console.log(
  `Joining game with tableId: ${TABLE_ID}, team: ${TEAM}, position: ${POSITION}`
);

const socket = io({ path: "/api/game-socket" });

socket.on("connect", () => {
  console.log("Connected to game socket server");

  socket.emit("joinGame", {
    tableId: TABLE_ID,
    team: TEAM,
    position: POSITION,
  });
});

socket.on("currentPlayers", (players) => {
  console.log("Current players in the game:", players);
  // TODO display current players in UI
});

socket.on("notification", (message) => {
  console.log("Received notification:", message);
  // TODO display notification in UI
});

socket.on("error", (message) => {
  console.error("Received error:", message);
  // TODO display error in UI
});

socket.on("gameStarted", () => {
  console.log("Game has started!");
  // TODO transition to game screen
});

socket.on("goalUpdate", (gameState) => {
  console.log("Received goal update:", gameState);
  // TODO update score and game state in UI
});

socket.on("disconnect", () => {
  console.log("Disconnected from game socket server");
  // window.location.href = "/game"; // Redirect to lobby on disconnect
});

socket.on("gameOver", (data) => {
  console.log("Game over! Winner:", data);
  // TODO display game over screen with winner and stats
});

socket.on("waitingForConfirmation", () => {
  console.log("Waiting for goal confirmation...");
  document.getElementById("scoreGoal").textContent = "Confirm Score";
  // TODO display confirmation UI
});

socket.on("undoGoal", () => {
  console.log("Goal has been undone");
  document.getElementById("scoreGoal").textContent = "Score Goal";
  // TODO update UI to reflect undone goal
});

document.getElementById("scoreGoal").addEventListener("click", () => {
  console.log("Score Goal button clicked");
  socket.emit("goalScored", { tableId: TABLE_ID });
});

document.getElementById("undoGoal").addEventListener("click", () => {
  console.log("Undo Goal button clicked");
  socket.emit("undoGoal", { tableId: TABLE_ID });
});
