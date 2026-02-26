/* eslint-disable no-undef */
let goalsPerGame = [];
let winRates = [];
let totalGames = [];

document.addEventListener("DOMContentLoaded", async () => {
  await getStatistics("3m");
  updateAllStatistics();

  const radioButtons = document.querySelectorAll('input[name="duration"]');
  radioButtons.forEach((radioButton) => {
    radioButton.addEventListener("click", () => {
      if (radioButton.checked) {
        getStatistics(radioButton.value).then(() => {
          updateAllStatistics();
        });
      }
    });
  });
});

function updateAllStatistics() {
  updateGoalsPerGame();
  updateWinRates();
  updateTotalGames();
}

function updateGoalsPerGame() {
  const usernames = goalsPerGame.map((goal) => goal.username);
  const values = goalsPerGame.map((goal) => goal.averageGoals.toFixed(2));
  updateSingleStatistic(usernames, values, "goals-per-game");
}

function updateWinRates() {
  const usernames = winRates.map((winRate) => winRate.username);
  const values = winRates.map((winRate) => `${winRate.winRate}%`);
  updateSingleStatistic(usernames, values, "win-rate");
}

function updateTotalGames() {
  const usernames = totalGames.map((totalGame) => totalGame.username);
  const values = totalGames.map((totalGame) => totalGame.totalGames);
  updateSingleStatistic(usernames, values, "total-games");
}

function updateSingleStatistic(usernames, values, containerId) {
  const container = document.getElementById(containerId);

  // remove all children of container
  while (container.lastChild !== document.querySelector(`#${containerId} h2`)) {
    container.removeChild(container.lastChild);
  }

  for (let i = 0; i < usernames.length; i++) {
    // create a line
    const line = document.createElement("div");
    line.classList.add("line");

    // create a span for username and value
    const userName = document.createElement("span");
    userName.textContent = usernames[i];
    const value = document.createElement("span");
    value.textContent = values[i];

    // append to container
    line.appendChild(userName);
    line.appendChild(value);
    container.appendChild(line);
  }
}

async function getStatistics(duration) {
  let stats = [];

  try {
    const response = await fetch(
      "/api/statistics/top-players?duration=" + duration
    );
    stats = await response.json();
  } catch (error) {
    console.error("Error fetching top players by average goals:", error);
  }

  goalsPerGame = stats
    .map((stat) => ({
      username: stat.username,
      averageGoals: stat.averageGoals,
    }))
    .toSorted((a, b) => b.averageGoals - a.averageGoals);

  winRates = stats
    .map((stat) => ({
      username: stat.username,
      winRate: stat.winRate,
    }))
    .toSorted((a, b) => b.winRate - a.winRate);

  totalGames = stats
    .map((stat) => ({
      username: stat.username,
      totalGames: stat.totalGames,
    }))
    .toSorted((a, b) => b.totalGames - a.totalGames);
}
