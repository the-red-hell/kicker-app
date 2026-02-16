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

socket.on("disconnect", () => {
  console.log("Disconnected from game socket server");
});
