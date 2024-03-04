let playerCardCount = 0;

/**
 * This function is called when the page is loaded.
 */
async function initPage(userId, riotId) {
    $('#playerCardContainer').empty();

    $('#openSettings').click(function () {
        loadPage('settings')
    });

    const definition = await fetchLolstatsDefinitions();
    let pagesetup = definition.pagesetup

    const isRiotIdValid = await checkIfRiotIdIsValid(riotId);

    if(!isRiotIdValid) {
        $('#invalidRiotId').removeClass('hidden')
        $('#validRiotId').addClass('hidden')
        $('#loading').addClass('hidden')
        return;
    }else{
        $('#invalidRiotId').addClass('hidden')
    }

    setupAddPlayerPopup();

    pagesetup = pagesetup.sort((a, b) => a.order - b.order);
    playerCardCount = pagesetup.length;
    for (const def of pagesetup) {
        let isCurrentUser = false;
        if (def.riotid === '[MYSELF]') {
            def.riotid = riotId;
            isCurrentUser = true;
        }
        const playerCard = await buildPlayerCard(isCurrentUser, def.riotid, def.order);
        $('#playerCardContainer').append(playerCard);
    }

    $('#loading').addClass('hidden');
    $('#validRiotId').removeClass('hidden')

    /*$.ajax({
    type: 'GET',
    url: '/league/getMatchHistory',
    success: function(data) {
        console.log(data);
    },
})*/
}


/**
 * This function fetches the definitions for the lolstats page
 */
function fetchLolstatsDefinitions() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/league/getLolstatsDefinition',
            success: function (data) {
                resolve(data);
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                displayError(data.responseJSON.message);
                reject(new Error('Error fetching lolstats definitions: ' + data.responseJSON.message));
            }
        });
    });
}

/**
 * This function checks if the riotId is valid
 */
function checkIfRiotIdIsValid(riotId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/league/isRiotIdValid',
            data: { riotId: riotId },
            success: function(data) {
                if(data.isValid === 'true') {
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
async function buildPlayerCard(ownPlayerCard = false, riotId, order) {
    let icon;
    let summonerInfo;
    let rankInfo;
    let rankInfoFound = true;
    let winrate;
    let customColor;
    let rankedText;

    try{
        icon = await getSummonerIcon(riotId);
        summonerInfo = await getSummonerInfo(riotId);
        rankInfo = summonerInfo.summonerInfo.rankInfo[0];
        summonerInfo = summonerInfo.summonerInfo.summonerInfo;
    }catch (e) {
        console.error(e);
        let mainContainer = $('<div>').addClass('relative bg-grey-level2 w-64 p-4 flex items-center');
        let infoText = $('<p>').text(`The Player with Riot-ID "${riotId}" does not exist!`).addClass('text-center text-error text-lg font-semibold font-montserrat mt-2');
        let removeIconLink = $('<a>').attr('href', '#').addClass('absolute top-0 right-0 p-2 hover:cursor-pointer').append($('<i>').addClass('ri-close-line ri-lg text-error w-6 h-6'));
        removeIconLink.click(function(e) {
            e.preventDefault();
            removePlayer(order, riotId);
        });

        return mainContainer.append(infoText).append(removeIconLink);
    }

    if (rankInfo == undefined || rankInfo.queueType !== 'RANKED_SOLO_5x5') {
        rankInfoFound = false;
        rankInfo.tier = 'NO_DATA'
        rankedText = 'No Data Found'
    }else{
        rankedText = `${rankInfo.tier.charAt(0) + rankInfo.tier.slice(1).toLowerCase()} ${rankInfo.rank} - ${rankInfo.leaguePoints} LP`
        winrate = Math.round(100 / (rankInfo.wins + rankInfo.losses) * rankInfo.wins);
        customColor = '';
        if (winrate >= 50) {
            customColor = 'text-success'
        }else{
            customColor = 'text-error'
        }
    }

    console.log(summonerInfo);
    console.log(rankInfo);

    let mainContainer = $('<div>').addClass('relative bg-grey-level2 w-64 p-4');
    let summonerIcon = $('<img>').attr('src', icon.icon).addClass('w-32 h-32 rounded-full mx-auto z-0');
    let summonerName = $('<p>').text(summonerInfo.name).addClass('text-center text-white text-xl font-semibold font-montserrat mt-2 font-bold');
    let levelContainer = $('<div>').addClass('mx-auto mt-1 w-12 z-10');
    let levelText = $('<p>').text(summonerInfo.summonerLevel).addClass('text-white text-center text-sm font-semibold font-montserrat font-bold bg-grey-level1 rounded-3xl p-0.5');
    let rankRoleContainer = $('<div>').addClass('flex justify-center items-center gap-8 mt-4 mx-auto w-full');
    let rankIcon = $('<img>').attr('src', `/res/riot/ranks/${rankInfo.tier}.png`).addClass('w-10 h-10 bg-grey-level1 rounded-full pr-1 pl-1');
    if(rankInfoFound) {
        rankIcon.addClass('pt-1')
    }
    let rankedTextSpan = $('<p>').text(`${rankedText}`).addClass('text-almost-white text-center text-sm font-semibold font-montserrat font-bold mt-6');
    let progressMainContainer = $('<div>').addClass('flex justify-between items-center mt-2 mx-auto w-full');
    let progressContainer = $('<div>').addClass('relative items-center flex mt-2 mx-auto w-full bg-error rounded-2xl h-5');
    let progressFill = $('<div>').addClass(`bg-success h-5 rounded-2xl`).css('width', `${winrate}%`)
    let progressTextContainer = $('<div>').addClass('flex justify-between items-center absolute right-0 left-0 bottom-0 top-0');
    let progressTextWin = $('<p>').text(`${rankInfo.wins} W`).addClass('text-sm font-montserrat font-bold ml-2');
    let progressTextLoose = $('<p>').text(`${rankInfo.losses} L`).addClass('text-sm font-montserrat font-bold mr-2');
    let winRate = $('<p>').text(`${winrate}%`).addClass('text-almost-white text-sm font-montserrat font-semibold ml-4 mt-2 italic').addClass(customColor);
    let removeIconLink = $('<a>').attr('href', '#').addClass('absolute top-0 right-0 p-2 hover:cursor-pointer').append($('<i>').addClass('ri-close-line ri-lg text-error w-6 h-6'));
    removeIconLink.click(function(e) {
        e.preventDefault();
        removePlayer(order, riotId);
    });

    mainContainer.append(summonerIcon).append(levelContainer.append(levelText)).append(summonerName).append(rankRoleContainer.append(rankIcon)).append(rankedTextSpan)
    if(rankInfoFound) {
        mainContainer.append(progressMainContainer.append(progressContainer.append(progressFill).append(progressTextContainer.append(progressTextWin).append(progressTextLoose))).append(winRate))
    }

    if(!ownPlayerCard) {
        mainContainer.append(removeIconLink);
    }
    return mainContainer;
}

/**
 * This function removes a player from the windows aswell as from the definition
 * @param order
 * @param riotId
 */
function removePlayer(order, riotId) {
    $.ajax({
        type: 'POST',
        url: '/league/removePlayerFromLolstatsDefinition',
        data: { riotId: riotId, order: order},
        success: function(data) {
            $(`#playerCardContainer > div:nth-child(${order})`).remove();
            playerCardCount--;
            displaySuccess(data.message);
        },
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}

/**
 * Fetches the summoner icon from a player
 * @returns {Promise<unknown>}
 */
function getSummonerIcon(riotId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/league/getPlayerIcon',
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
function getSummonerInfo(riotId){
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/league/getSummonerInfo',
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

/**
 * This function sets up the add player popup
 */
function setupAddPlayerPopup(){
    const addPlayerPopup = new Popup("popupContainerAddPlayer");

    $.when(
        fetchEntryField('text', 'name', 'name', 'w-40', ''),
        fetchEntryField('text', 'tagline', 'tagline', 'w-20', '')
    ).then(function(field1, field2) {
        let renderedHtml = `<label for="name" class="font-montserrat text-almost-white">Enter Riot-ID</label>
                                    <div class="flex gap-4 items-center mt-4">
                                        ${field1[0]}
                                        <p class="font-montserrat text-lg font-semibold">#</p>
                                        ${field2[0]}
                                    </div>`

        addPlayerPopup.displayInputPopupCustom("/res/others/plus.png", "Add new Player", "Add", "btnAddPlayer", renderedHtml);
    });

    $("#addPlayer").click(function (e) {
        $('#name').val('');
        $('#tagline').val('');

        if (playerCardCount+1 > 7) {
            displayError('You can only add 7 players!')
        }else{
            addPlayerPopup.open(e)
        }
    });

    $(document).off('click', '#btnAddPlayer').on('click', '#btnAddPlayer', function() {
        let riotId = $('#name').val() + '#' + $('#tagline').val();
        checkIfRiotIdIsValid(riotId).then(function(isValid){
            if(isValid) {
                $.ajax({
                    type: 'POST',
                    url: '/league/addPlayerToLolstatsDefinition',
                    data: { riotId: riotId, order: playerCardCount+1 },
                    success: function (data) {
                        displayInfo('Please be patient while we are adding the new user...');
                        buildPlayerCard(false, riotId, playerCardCount+1).then(function(playerCard){
                            $('#playerCardContainer').append(playerCard);
                            playerCardCount++;
                            displaySuccess(data.message);
                            addPlayerPopup.close();
                        });
                    },
                    error: function(data) {
                        if (data.responseJSON && data.responseJSON.redirect) {
                            window.location.href = data.responseJSON.redirect;
                        }
                        displayError(data.responseJSON.message);
                    }
                });
            }else{
                displayError('This Riot-ID is not valid!');
            }
        });
    });
}