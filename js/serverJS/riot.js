const axios = require('axios');
/**
 * Get the data from the dDragon API
 * @returns {Promise<*>}
 */
const getDDragonDataFromRiot = async () =>
{

    let dDragonData;
    await axios.get('http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion.json')
        .then(response => {
            dDragonData = response.data;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    return dDragonData;
}

/**
 * Get the dDragon data from the project
 * @returns {Promise<*>}
 */
async function getDDragonDataFromProject(){
    return require('../../res/riot/dragonData.json');
}

/**
 * Get the account info from the riot API
 * @param riotId
 * @returns {Promise<{isValid: string}>}
 */
async function getAccountInfo(riotId) {
    const [ingameName, tagLine] = riotId.split('#');
    try {
        const response = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(ingameName)}/${encodeURIComponent(tagLine)}`, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        });
        return {isValid: 'true', data: response.data};
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404 && error.response.data && error.response.data.status && error.response.data.status.message.includes('No results found for player with riot id')) {
                return {isValid: 'false', message: 'No results found for player with riot id'};
            } else {
                console.error('Error message:', error.message);
                return {isValid: 'false', message: 'There was an error processing your request.'};
            }
        } else {
            console.error('Error message:', error.message);
            return {isValid: 'false', message: 'There was an error processing your request.'};
        }
    }
}

/**
 * Get the Summoner info
 * @param puuid
 * @returns {Promise<{isValid: string}>}
 */
async function getSummonerInfo(puuid) {
    try {
        const response = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        });

        const response2 = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${response.data.id}`, {
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        });
        return {isValid: 'true', summonerInfo: response.data, rankInfo: response2.data};
    } catch (error) {
        console.error('Error message:', error.message);
        return {isValid: 'false', message: 'There was an error processing your request.'};
    }
}

module.exports = {getDDragonData: getDDragonDataFromRiot, getDDragonDataFromProject,getAccountInfo,getSummonerInfo}