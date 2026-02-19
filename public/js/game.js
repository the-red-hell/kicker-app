/* eslint-disable no-undef */
import "/api/game-socket/socket.io.js";

const TABLE_ID = window.TABLE_ID;
const TEAM = window.TEAM;
const POSITION = window.POSITION;

const socket = io({ path: "/api/game-socket" });

document.getElementById("scoreGoal").classList.add(TEAM);

socket.on("connect", () => {
  console.log("Connected to game socket server");

  fetch(`/api/tables/${TABLE_ID}`)
    .then((res) => res.json())
    .then((table) => {
      document.getElementById("tableName").textContent = table.name;
    })
    .catch((error) => {
      console.error("Error fetching table info:", error);
      document.getElementById("tableName").textContent = "Unknown Table";
    });

  socket.emit("joinGame", {
    tableId: TABLE_ID,
    team: TEAM,
    position: POSITION,
  });
});

socket.on("currentPlayers", (players) => {
  console.log("Current players in the game:", players);
  const playerDisplays = {
    black: {
      offense: document.querySelector("#players-black .offense"),
      defense: document.querySelector("#players-black .defense"),
    },
    white: {
      offense: document.querySelector("#players-white .offense"),
      defense: document.querySelector("#players-white .defense"),
    },
  };

  // Reset player display
  players.forEach((player) => {
    if (player.team && player.position && player.username) {
      const team = player.team;
      const position = player.position;
      if (playerDisplays[team] && playerDisplays[team][position]) {
        playerDisplays[team][position].textContent =
          `${player.position}: ${player.username}`;
      }
    }
  });
});

socket.on("error", (message) => {
  const errorMsg = document.querySelector(".errorBox");
  errorMsg.textContent = message;
  errorMsg.style.transition = "none";
  errorMsg.style.opacity = 1;

  setTimeout(() => {
    errorMsg.style.transition = "opacity 1s ease";
    errorMsg.style.opacity = 0;
  }, 3000);
});

socket.on("gameStarted", () => {
  console.log("Game has started!");
  document.querySelectorAll(".hiddenIfGameNotStarted").forEach((el) => {
    el.style.opacity = 1;
  });
  // TODO transition to game screen
});

socket.on("goalUpdate", (gameScore) => {
  document.querySelector("#score-black .goals").textContent = gameScore.black;
  document.querySelector("#score-white .goals").textContent = gameScore.white;
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
  // we set it back to "Score Goal" because if it was the last goal, the UI would still say "Confirm Score"
  document.getElementById("scoreGoal").textContent = "Score Goal";
  // TODO update UI to reflect undone goal
});

document.getElementById("scoreGoal").addEventListener("click", () => {
  socket.emit("goalScored", { tableId: TABLE_ID });
});

document.getElementById("undoGoal").addEventListener("click", () => {
  socket.emit("undoGoal", { tableId: TABLE_ID });
});
