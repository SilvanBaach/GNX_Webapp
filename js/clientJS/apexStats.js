const API_KEY = "4f38daad574095e6994ac6ab16143f7c";
const PLATFORM = "PC";

function fillApexStats(divID, playerName) {
    fetch(`https://api.mozambiquehe.re/bridge?auth=${API_KEY}&player=${playerName}&platform=${PLATFORM}`)
        .then(response => response.json())
        .then(data => {
            const shadowBoxContainer = $(`#` + divID);
            const legendName = data.legends.selected.LegendName;

            const newHTML =
                `<img class="legend-image" src="${data.legends.selected.ImgAssets.icon}" alt="legend image">` +
                `<p class="player-name">${data.global.name}</p>` +
                `<p class="small-text">${data.legends.selected.LegendName}</p>` +
                `<img class="rank-image" src="${data.global.rank.rankImg}" alt="legend image">` +
                `<p class="small-text">${data.global.rank.rankName} ${data.global.rank.rankDiv}</p>` +
                `<div class="stats-container">` +
                `<div class="stats">` +
                `<p class="small-title">${(() => {
                    try {
                        return data.legends.selected.data[0].name.toString().replace("BR ", "");
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `<p class="count">${(() => {
                    try {
                        return data.legends.selected.data[0].value;
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `<p class="top-percentage">${(() => {
                    try {
                        const topPercent = data.legends.all[legendName].data.find(item => item.name === data.legends.selected.data[0].name).rank.topPercent;
                        return topPercent !== undefined ? `${topPercent} %` : '';
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `</div>` +
                `<div class="stats">` +
                `<p class="small-title">${(() => {
                    try {
                        return data.legends.selected.data[1].name.toString().replace("BR ", "");
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `<p class="count">${(() => {
                    try {
                        return data.legends.selected.data[1].value;
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `<p class="top-percentage">${(() => {
                    try {
                        const topPercent = data.legends.all[legendName].data.find(item => item.name === data.legends.selected.data[1].name).rank.topPercent;
                        return topPercent !== undefined ? `${topPercent} %` : '';
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `</div>` +
                `<div class="stats">` +
                `<p class="small-title">${(() => {
                    try {
                        return data.legends.selected.data[2].name.toString().replace("BR ", "");
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `<p class="count">${(() => {
                    try {
                        return data.legends.selected.data[2].value;
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `<p class="top-percentage">${(() => {
                    try {
                        const topPercent = data.legends.all[legendName].data.find(item => item.name === data.legends.selected.data[2].name).rank.topPercent;
                        return topPercent !== undefined ? `${topPercent} %` : '';
                    } catch (error) {
                        return '';
                    }
                })()}</p>` +
                `</div>` +
                `</div>`
            shadowBoxContainer.append(newHTML);
        })
        .catch(error => {
            // Handle the error
            console.log(error)
        });

}

async function getRPGain(playerName) {
    const start = Date.now();
    const startTimestamp = Math.floor(start / 1000); // Convert to seconds

    const end = Date.now(); // Returns the number of milliseconds since January 1, 1970, 00:00:00 UTC
    const oneDayAgo = end - (48 * 60 * 60 * 1000); // Subtract 24 hours in milliseconds
    const endTimestamp = Math.floor(oneDayAgo / 1000); // Convert to seconds

    const data = await fetchMatchHistory(playerName, startTimestamp, endTimestamp);

    let totalRP = 0;
    data.forEach(match => {
        totalRP+=match.BRScoreChange;
    });

    return totalRP;
}

async function fetchMatchHistory(player, start, end) {
    const playerUID1 = await fetchPlayerUID(player);

    const response = await fetch(`https://api.mozambiquehe.re/games?auth=${API_KEY}&uid=${playerUID1}&start=${end}&end=${start}&mode=BATTLE_ROYALE`)
    const data = await response.json();

    return data;
}

async function fetchPlayerUID(playerName) {
    const response = await fetch(`https://api.mozambiquehe.re/nametouid?auth=${API_KEY}&player=${playerName}&platform=${PLATFORM}`);
    const data = await response.json();
    return data.uid;
}

async function getSessionHistory(playerName){

}
