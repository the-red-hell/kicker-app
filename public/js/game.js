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
