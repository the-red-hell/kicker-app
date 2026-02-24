/* eslint-disable no-undef */
document.addEventListener("DOMContentLoaded", async () => {
  const places = getPlaceElements();

  const data = await getPlacesData();
  const maxGoals = data[0].averageGoals;

  places.forEach((place, index) => {
    const entry = data[index];
    place.score.textContent = entry.averageGoals;
    place.name.textContent = entry.username;
    place.container.style.height = `calc(3rem + 1.5rem + 20px + ${entry.averageGoals / maxGoals} * var(--first-place-size))`;
  });
});

function getPlaceElements() {
  const firstPlaceContainer = document.getElementById("first-place");
  const secondPlaceContainer = document.getElementById("second-place");
  const thirdPlaceContainer = document.getElementById("third-place");

  return [
    {
      container: firstPlaceContainer,
      score: firstPlaceContainer.querySelector(".score"),
      name: firstPlaceContainer.querySelector(".name"),
    },
    {
      container: secondPlaceContainer,
      score: secondPlaceContainer.querySelector(".score"),
      name: secondPlaceContainer.querySelector(".name"),
    },
    {
      container: thirdPlaceContainer,
      score: thirdPlaceContainer.querySelector(".score"),
      name: thirdPlaceContainer.querySelector(".name"),
    },
  ];
}

async function getPlacesData() {
  const res = await fetch("/api/statistics/top-avg-goals?amount=3");
  const data = await res.json();
  data.sort((a, b) => b.averageGoals - a.averageGoals);
  return data.slice(0, 3);
}
