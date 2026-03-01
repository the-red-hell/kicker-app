/* eslint-disable no-undef */
document.addEventListener("DOMContentLoaded", async () => {
    const places = getPlaceElements();

    const data = await getPlacesData();
    const maxWinRate = data[0].winRate || 1;

    places.forEach((place, index) => {
        const entry = data[index];
        place.score.textContent = `${entry.winRate ? entry.winRate + "%" : "0%"} / ${entry.totalVictories}`;
        place.name.textContent = entry.username;
        place.container.style.height = `calc(1.5rem + 20px + ${entry.winRate / maxWinRate} * var(--first-place-size))`;
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
    const res = await fetch(
        "/api/statistics/top-players?limit=3&sortBy=winRate"
    );
    const data = await res.json();
    return data.slice(0, 3);
}
