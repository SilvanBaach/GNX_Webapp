let userId = 0;
let riotId = '';
/**
 * This function is called when the page is loaded.
 */
async function initPage(uId, rId) {
    userId = uId;
    riotId = rId;

    $('#openSettings').click(function () {
        loadPage('settings')
    });

    const isRiotIdValid = await checkIfRiotIdIsValid(riotId);

    if(!isRiotIdValid) {
        $('#invalidRiotId').removeClass('hidden')
        $('#validRiotId').addClass('hidden')
        $('#loading').addClass('hidden')
        return;
    }else{
        $('#invalidRiotId').addClass('hidden')
        $('#validRiotId').removeClass('hidden')
    }

    const playerCard1 = await buildPlayerCard();
    $('#playerCardContainer').append(playerCard1);

    $('#loading').addClass('hidden')
}

/**
 * This function checks if the riotId is valid
 */
function checkIfRiotIdIsValid(riotId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/riot/isRiotIdValid',
            data: { riotId: riotId },
            success: function(data) {
                if(data.isValid) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reject(new Error('Error checking Riot ID validity: ' + textStatus));
            }
        });
    });
}

/**
 * Builds the player card
 * @returns {string}
 */
async function buildPlayerCard() {
    const icon = await getSummonerIcon();
    let summonerInfo = await getSummonerInfo();
    let rankInfo = summonerInfo.summonerInfo.rankInfo[0];
    summonerInfo = summonerInfo.summonerInfo.summonerInfo;

    let winrate = Math.round(100 / (rankInfo.wins + rankInfo.losses) * rankInfo.wins);
    let customColor = '';
    if (winrate >= 50) {
        customColor = 'text-success'
    }else{
        customColor = 'text-error'
    }

    console.log(summonerInfo);
    console.log(rankInfo);

    let mainContainer = $('<div>').addClass('relative bg-grey-level2 w-64 p-4');
    let summonerIcon = $('<img>').attr('src', icon.icon).addClass('w-32 h-32 rounded-full mx-auto z-0');
    let summonerName = $('<p>').text(summonerInfo.name).addClass('text-center text-white text-xl font-semibold font-montserrat mt-2 font-bold');
    let levelContainer = $('<div>').addClass('mx-auto mt-1 w-12 z-10');
    let levelText = $('<p>').text(summonerInfo.summonerLevel).addClass('text-white text-center text-sm font-semibold font-montserrat font-bold bg-grey-level1 rounded-3xl p-0.5');
    let rankRoleContainer = $('<div>').addClass('flex justify-center items-center gap-8 mt-2 mx-auto w-full');
    let rankIcon = $('<img>').attr('src', `/res/riot/ranks/${rankInfo.tier}.png`).addClass('w-10 h-10 bg-grey-level1 rounded-full pt-1 pr-1 pl-1');
    let roleIcon = $('<img>').attr('src', `/res/riot/roles/mid.png`).addClass('w-10 h-10 bg-grey-level1 rounded-full p-[6px]');
    let rankedText = $('<p>').text(`${rankInfo.tier.charAt(0) + rankInfo.tier.slice(1).toLowerCase()} ${rankInfo.rank} - ${rankInfo.leaguePoints} LP`).addClass('text-almost-white text-center text-sm font-semibold font-montserrat font-bold mt-6');
    let progressMainContainer = $('<div>').addClass('flex justify-between items-center mt-2 mx-auto w-full');
    let progressContainer = $('<div>').addClass('relative items-center flex mt-2 mx-auto w-full bg-error rounded-2xl h-5');
    let progressFill = $('<div>').addClass(`bg-success h-5 rounded-2xl`).css('width', `${winrate}%`)
    let progressTextContainer = $('<div>').addClass('flex justify-between items-center absolute right-0 left-0 bottom-0 top-0');
    let progressTextWin = $('<p>').text(`${rankInfo.wins} W`).addClass('text-sm font-montserrat font-bold ml-2');
    let progressTextLoose = $('<p>').text(`${rankInfo.losses} L`).addClass('text-sm font-montserrat font-bold mr-2');
    let winRate = $('<p>').text(`${winrate}%`).addClass('text-almost-white text-sm font-montserrat font-semibold ml-4 mt-2 italic').addClass(customColor);

    mainContainer.append(summonerIcon).append(levelContainer.append(levelText)).append(summonerName).append(rankRoleContainer.append(rankIcon)
        .append(roleIcon)).append(rankedText)
        .append(progressMainContainer.append(progressContainer.append(progressFill).append(progressTextContainer.append(progressTextWin).append(progressTextLoose))).append(winRate));

    return mainContainer;
}

/**
 * Fetches the summoner icon from a player
 * @returns {Promise<unknown>}
 */
function getSummonerIcon() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/riot/getPlayerIcon',
            data: { riotId: riotId },
            success: function(data) {
                resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reject(new Error('Error getting summoner icon: ' + textStatus));
            }
        });
    });
}

/**
 * Fetches the summoner info from a player
 * @returns {Promise<unknown>}
 */
function getSummonerInfo(){
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/riot/getSummonerInfo',
            data: { riotId: riotId },
            success: function(data) {
                resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reject(new Error('Error getting summoner name: ' + textStatus));
            }
        });
    });
}