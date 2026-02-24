/* eslint-disable no-undef */
document.addEventListener("DOMContentLoaded", async () => {
  const places = getPlaceElements();

  const data = await getPlacesData();
  const maxGoals = data[0].totalGoals;

  places.forEach((place, index) => {
    const entry = data[index];
    place.score.textContent = entry.totalGoals;
    place.name.textContent = entry.username;
    place.container.style.height = `calc(3rem + 1.5rem + 20px + ${entry.totalGoals / maxGoals} * var(--first-place-size))`;
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
  const res = await fetch("/api/statistics/top-goals/3");
  const data = await res.json();
  data.sort((a, b) => b.totalGoals - a.totalGoals);
  return data.slice(0, 3);
}
