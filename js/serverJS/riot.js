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

module.exports = {getDDragonData: getDDragonDataFromRiot, getDDragonDataFromProject}