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
      showErrorMessage("Table not found");
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
  console.error("Error from server:", message);
  showErrorMessage(message);
});

socket.on("gameStarted", () => {
  document.querySelectorAll(".hiddenIfGameNotStarted").forEach((el) => {
    el.style.opacity = 1;
  });
  toggleControlButtons(true);
  showPopupMessage("Game Started!");
});

socket.on("goalUpdate", (gameScore) => {
  document.querySelector("#score-black .goals").textContent = gameScore.black;
  document.querySelector("#score-white .goals").textContent = gameScore.white;
});

socket.on("disconnect", () => {
  showErrorMessage("Disconnected from game.");
});

socket.on("gameOver", (data) => {
  console.log("Game over! Winner:", data);
  const time = 5000; // Show the message for 5 seconds
  if (data.winnerTeam === TEAM) {
    showPopupMessage("Congratulations! Your team won!", time);
  } else {
    showPopupMessage("Game Over! Better luck next time!", time);
  }

  toggleControlButtons(false);
});

socket.on("waitingForConfirmation", () => {
  document.getElementById("scoreGoal").textContent = "Confirm Score";
});

socket.on("undoGoal", () => {
  // we set it back to "Score Goal" because if it was the last goal, the UI would still say "Confirm Score"
  document.getElementById("scoreGoal").textContent = "Score Goal";
});

document.getElementById("scoreGoal").addEventListener("click", () => {
  socket.emit("goalScored", { tableId: TABLE_ID });
});

document.getElementById("undoGoal").addEventListener("click", () => {
  socket.emit("undoGoal", { tableId: TABLE_ID });
});

function showErrorMessage(message) {
  const errorBox = document.getElementById("errorBox");

  const child = errorBox.appendChild(document.createElement("p"));
  child.classList.add("errorMsg");
  child.textContent = message;

  setTimeout(() => {
    child.remove();
  }, 9000);
}

function showPopupMessage(message, time = 2000) {
  document.querySelector(".popup").style.animation = `display ${time}ms`;

  document.getElementById("popupMessage").textContent = message;

  setTimeout(() => {
    document.querySelector(".popup").style.animation = "";
    document.getElementById("popupMessage").textContent = "";
  }, time);
}

function toggleControlButtons(show) {
  const buttons = document.querySelectorAll(".controlButtons");
  buttons.forEach((button) => {
    if (show) {
      button.style.visibility = "visible";
      button.style.opacity = 1;
    } else {
      button.style.opacity = 0;

      setTimeout(() => {
        button.style.visibility = "hidden";
      }, 1000);
    }
  });
  document.getElementById("isPlaying").textContent = show ? "playing" : "";
}
