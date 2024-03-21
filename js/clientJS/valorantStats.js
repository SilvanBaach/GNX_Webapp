/**
 * This function is called when the page is loaded.
 */
async function initPage() {
    try {
        // Riot IDs of the players
        const riotIds = [
            'GNX Lasym#2026',
            'GNX exosay#QLF',
            'Unknown#WSS',
            'thom#père',
            'GNX th0m#VLR',
            'tsägä 桜#さくら'
        ];

        // Get match history and calculate wins and losses for each player
        for (const riotId of riotIds) {
            const matchHistory = await getMatchHistory(riotId, 14);
            if (matchHistory && matchHistory.data && matchHistory.data.heatmap) {
                const heatmapData = matchHistory.data.heatmap;
                const { winsLast14Days, lossesLast14Days } = calculateWinsAndLossesLast14Days(heatmapData);
                console.log(`${riotId}: Wins - ${winsLast14Days}, Losses - ${lossesLast14Days}`);
            } else {
                console.error(`Match history data or heatmap data not found for ${riotId}`);
            }
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

async function getMatchHistory(riotId, timeFrame) {
    const name = riotId.split('#')[0];
    const tag = riotId.split('#')[1];
    const days = timeFrame;

    try {
        const matchHistory = await $.ajax({
            type: 'GET',
            url: '/valorant/getMatchHistory',
            data: { name: name, tag: tag, days: days }
        });

        return matchHistory;
    } catch (error) {
        console.error('Error fetching match history:', error);
        throw error;
    }
}

// Function to calculate wins and losses for the last 14 days
function calculateWinsAndLossesLast14Days(heatmapData) {
    const currentDate = new Date();
    let winsLast14Days = 0;
    let lossesLast14Days = 0;

    heatmapData.forEach(data => {
        const matchDate = new Date(data.date);
        const timeDiff = currentDate - matchDate;
        const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (diffDays <= 14) {
            winsLast14Days += data.values.wins;
            lossesLast14Days += data.values.losses;
        }
    });

    return { winsLast14Days, lossesLast14Days };
}

