const axios = require('axios');
/**
 * Get the data from the dDragon API
 * @returns {Promise<*>}
 */
const getDDragonData = async () =>
{
    let dDragonData;
    await axios.get('http://ddragon.leagueoflegends.com/cdn/12.6.1/data/en_US/champion.json')
        .then(response => {
            dDragonData = response.data;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    return dDragonData;
}

function getChampionData(championName, dDragonData)
{
    let championData = dDragonData.data[championName];
    return championData;
}

module.exports = {getDDragonData}