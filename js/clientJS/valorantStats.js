// Riot IDs of the players
const RIOTIDS = [
    'GNX Lasym#2026',
    'GNX exosay#QLF',
    'Unknown#WSS',
    'thom#père',
    'GNX th0m#VLR',
    'tsägä 桜#さくら'
];

const MODES = ['competitive', 'premier', 'team-deathmatch', 'deathmatch'];

const DM_TDM_GAMES = 30
const COMP_PREMIER_GAMES = 20

/**
 * This function is called when the page is loaded.
 */
async function initPage() {
    await getValorantStats(RIOTIDS, MODES, 14);

}

/**
 * This function calculates the wins and losses of each player in each mode for a specific amount of days.
 * It also checks if the requirements are met.
 *
 * @param riotIds
 * @param modes
 * @param amountOfDays
 * @returns {Promise<void>}
 */
async function getValorantStats(riotIds, modes, amountOfDays) {
    try {
        // Get match history and calculate stats for each player
        for (const riotId of riotIds) {

            const isRiotIdValid = await checkIfRiotIdIsValid(riotId);
            if (!isRiotIdValid){continue}
            let modeAndJsonArray = await getMatchHistory(riotId, modes);
            if (modeAndJsonArray) {
                let modeStats = {}; // Object to store mode-wise stats for this player
                // Initialize mode-wise stats
                modes.forEach(mode => {
                    modeStats[mode] = { wins: 0, losses: 0 };
                });
                // Calculate total wins and losses for each mode
                modeAndJsonArray.forEach(modeAndJson => {
                    const mode = modeAndJson[0];
                    const jsonData = modeAndJson[1];
                    if (jsonData && jsonData.data && jsonData.data.heatmap) {
                        const heatmapData = jsonData.data.heatmap;
                        const { wins, losses } = calculateWinsAndLosses(heatmapData, amountOfDays);
                        // Update mode-wise stats
                        modeStats[mode].wins += wins;
                        modeStats[mode].losses += losses;
                    }
                });
                // Output mode-wise stats for this player
                console.log(`Stats for ${riotId}:`);
                Object.keys(modeStats).forEach(mode => {
                    console.log(`${mode}: Total Wins - ${modeStats[mode].wins}, Total Losses - ${modeStats[mode].losses}`);
                });

                // Check requirements for this player
                const teamDeathmatchTotal = modeStats['team-deathmatch'].wins + modeStats['team-deathmatch'].losses;
                const deathmatchTotal = modeStats['deathmatch'].wins + modeStats['deathmatch'].losses;
                const competitiveTotal = modeStats['competitive'].wins + modeStats['competitive'].losses
                const premierTotal = modeStats['premier'].wins; + modeStats['premier'].losses;

                let requirementsMet = true;
                let unmetRequirements = [];

                if (teamDeathmatchTotal + deathmatchTotal < DM_TDM_GAMES) {
                    unmetRequirements.push(`Both Team Deathmatch and Deathmatch must have at least ${DM_TDM_GAMES} games played`);
                    requirementsMet = false;
                }
                if (competitiveTotal + premierTotal < COMP_PREMIER_GAMES) {
                    unmetRequirements.push(`Both Team Competitive and Premiere must have at least ${COMP_PREMIER_GAMES} games played`);
                    requirementsMet = false;
                }

                if (requirementsMet) {
                    console.log(`${riotId}: Congratulations! All requirements are met. Keep it up!`);
                } else {
                    console.log(`${riotId}: The following requirements are not met - ${unmetRequirements.join(", ")}`);
                }
            } else {
                console.error(`Match history data not found for ${riotId}`);
            }
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

/**
 * Get the match history for every mode
 * @param riotId
 * @returns {Promise<JQuery.jqXHR<any>>}
 */
async function getMatchHistory(riotId, modes) {
    const name = riotId.split('#')[0];
    const tag = riotId.split('#')[1];

    try {
        const matchHistory = await $.ajax({
            type: 'GET',
            url: '/valorant/getMatchHistory',
            data: { name: name, tag: tag, modes: modes }
        });

        return matchHistory;
    } catch (error) {
        console.error('Error fetching match history:', error);
        throw error;
    }
}

/**
 * Calculate the wins and loses for the set amount of days
 * @param heatmapData The match history data
 * @param amountOfDays The amount of days to track
 * @returns {{wins: number, losses: number}}
 */
function calculateWinsAndLosses(heatmapData, amountOfDays) {
    const currentDate = new Date();
    let wins = 0;
    let losses = 0;

    heatmapData.forEach(data => {
        const matchDate = new Date(data.date);
        const timeDiff = currentDate - matchDate;
        const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (diffDays <= amountOfDays) {
            wins += data.values.wins;
            losses += data.values.losses;
        }
    });

    return { wins: wins, losses: losses };
}
/**
 * This function checks if the riotId is valid
 */
function checkIfRiotIdIsValid(riotId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/valorant/isRiotIdValid',
            data: {riotId: riotId},
            success: function (data) {
                if (data.isValid === 'true') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(new Error('Error checking Riot ID validity: ' + textStatus));
            }
        });
    });
}

