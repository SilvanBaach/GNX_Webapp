let championData;
let championpoolData;
let sharedTeamId;

let delPopup;
let addPopup;
let editPopup;

let championToEdit;
let championToDelete;

/**
 * This method setups the championpool Page
 * This includes the header, the container and the popup
 * @returns {Promise<void>}
 */
async function setupChampionpool(teamId) {
    championData = getChampionNameAndPictureFromDDragon(await getDDragonData());
    championpoolData = await getChampionpoolData(teamId);
    sharedTeamId = teamId;

    sortData();

    buildChampionpoolTable(0);

    setupDeletePopup();
    setupAddPopup();
    setupEditPopup();

    waitForElement('#champions', function () {
        $("#addChampion").click(function (e) {
            $("#lane").val("")
            $("#champions").val("").trigger('change');

            addPopup.open(e);
        });
    });
}

/**
 * Sorts the championpool data based on order
 */
function sortData(){
    // Sort championpoolData by lane, then by type, then by order
    championpoolData.sort((a, b) => {
        if (a.lane !== b.lane) {
            return a.lane - b.lane;
        } else if (a.type !== b.type) {
            return a.type - b.type;
        } else {
            return a.order - b.order;
        }
    });
}

/**
 * Builds the championpool table
 * @param mode 0=Main 1=Practice 2=Suggestion
 */
async function buildChampionpoolTable(mode) {

    const topDiv = $("#topDiv").empty();
    const jungleDiv = $("#jungleDiv").empty();
    const midDiv = $("#midDiv").empty();
    const adcDiv = $("#adcDiv").empty();
    const supportDiv = $("#supportDiv").empty();

    $("#title").text(mode === 0 ? "Main" : mode === 1 ? "Practice" : "Suggested");

    buildHeader();

    let championsAdded = {1: false, 2: false, 3: false, 4: false, 5: false};
    const lanes = [1, 2, 3, 4, 5];
    const divs = [topDiv, jungleDiv, midDiv, adcDiv, supportDiv];

    for (const championpoolEntry of championpoolData) {
        if (championpoolEntry.type === mode) {

            let fatherDiv;
            switch (championpoolEntry.lane) {
                case 1:
                    fatherDiv = topDiv;
                    break;
                case 2:
                    fatherDiv = jungleDiv;
                    break;
                case 3:
                    fatherDiv = midDiv;
                    break;
                case 4:
                    fatherDiv = adcDiv;
                    break;
                case 5:
                    fatherDiv = supportDiv;
                    break;
            }

            championsAdded[championpoolEntry.lane] = true;

            const championDiv = $('<div>', {class: "bg-grey-level3 px-2 py-4 flex flex-col justify-center items-center space-y-2 relative"});
            const nameP = $('<p>', {
                class: "font-bold font-montserrat",
                text: championpoolEntry.champion
            });

            let champion = championData.find((champion) => champion[0] === championpoolEntry.champion);

            const img = $('<img>', {
                src: champion[1],
                alt: "Champion Picture",
                class: "rounded-full w-12"
            });

            const userData = await getUserName(championpoolEntry.account_fk2)
            let username;
            if(typeof userData === "undefined"){
                username = 'NaN'
            }else{
                username = userData.username;
            }

            const editedByP = $('<p>', {
                class: "font-montserrat text-xs text-center truncate w-44",
                text: `Edited by ${username}`
            });

            const arrowUpIcon = $('<i>', {class: "ri-arrow-up-line ri-lg absolute top-1 left-2 up cursor-pointer"});
            const arrowDownIcon = $('<i>', {class: "ri-arrow-down-line ri-lg absolute top-8 left-2 down cursor-pointer"});
            const closeIcon = $('<i>', {class: "ri-close-line ri-lg absolute right-2 top-1 delete cursor-pointer"});
            //const editIcon = $('<i>', {class: "ri-edit-line ri-lg absolute right-2 top-8 edit cursor-pointer"});

            championDiv.append(nameP, img, editedByP, arrowUpIcon, arrowDownIcon, closeIcon/*, editIcon*/);
            fatherDiv.append(championDiv);

        }
    }

    lanes.forEach((lane, index) => {
        if (!championsAdded[lane]) {
            const noDataDiv = $('<div>', {
                class: "bg-grey-level3 px-2 py-4 flex flex-col justify-center items-center space-y-2 truncate w-full font-montserrat font-bold text-almost-white",
                text: "NO DATA FOUND"
            });
            divs[index].append(noDataDiv);
        }
    });

    registerIconEvents();
}

/**
 * Registers the events for the icons
 */
function registerIconEvents() {
    $(document).off('click', '.up')
    $(document).off('click', '.down')
    $(document).off('click', '.delete')
    //$(document).off('click', '.edit')

    $(document).on('click', '.up', function(e) {
        const championDiv = $(this).closest('.bg-grey-level3');
        const championName = championDiv.find('p.font-bold.font-montserrat').text();

        const champion = championpoolData.find((champion) => champion.champion === championName);

        if(champion.order === 1){
            return;
        }

        updateOrder(champion.id, 0).then(async () => {
            championpoolData = await getChampionpoolData(sharedTeamId);
            sortData();
            buildChampionpoolTable(champion.type);
        });
    });

    $(document).on('click', '.down', function(e) {
        const championDiv = $(this).closest('.bg-grey-level3');
        const championName = championDiv.find('p.font-bold.font-montserrat').text();

        const champion = championpoolData.find((champion) => champion.champion === championName);
        const championsInLane = championpoolData.filter((champ) => champ.lane === champion.lane && champ.type === champion.type);

        if (champion.order === championsInLane.length) {
            return;
        }

        updateOrder(champion.id, 1).then(async () => {
            championpoolData = await getChampionpoolData(sharedTeamId);
            sortData();
            buildChampionpoolTable(champion.type);
        });
    });

    $(document).on('click', '.delete', function(e) {
        const championDiv = $(this).closest('.bg-grey-level3');

        const championName = championDiv.find('p.font-bold.font-montserrat').text();
        championToDelete = championpoolData.find((champion) => champion.champion === championName);

        delPopup.open(e);
    });

    /*$(document).on('click', '.edit', function(e) {
        const championDiv = $(this).closest('.bg-grey-level3');
        const championName = championDiv.find('p.font-bold.font-montserrat').text();
        championToEdit = championpoolData.find((champion) => champion.champion === championName);

        editPopup.open(e);
    });*/
}

/**
 * Builds the popup for editing a champion
 */
function setupEditPopup() {
    editPopup = new Popup("popup-containerEdit");

    $.when(
        fetchDropdown('lane2', 'w-64', '[{"value": "1", "text": "Top Lane"}, {"value": "2", "text": "Jungle"}, {"value": "3", "text": "Mid Lane"}, {"value": "4", "text": "ADC"}, {"value": "5", "text": "Support"}]', 'Select a Lane'),
    ).then(function(dropdown) {
        editPopup.displayInputPopupCustom('/res/others/question_blue.png', 'Edit Champion', 'Save', 'btnEditChampion',
            `<select id="champions2" class="font-montserrat select2-component champions w-64">
                        <option value="" disabled selected>Select a Champion</option>
                   </select>` +
            `<div class="mt-4">` +
            dropdown +
            `</div>`
        );

        let data = championData.map(function (item) {
            return {id: item[0], text: item[0], imageUrl: item[1]};
        });

        waitForElement('#champions2', function () {
            $("#champions2").select2({
                data: data,
                templateResult: function (item) {
                    if (!item.id) {
                        return item.text;
                    }

                    let img = $(`<img class="rounded-full mr-3 w-12" src="${item.imageUrl}" alt="${item.text}" width="50" />`);
                    return $(`<div class="flex items-center"></div>`).append(img, item.text);
                }
            });
        });

        waitForElement('#btnEditChampion', function () {
            $('#btnEditChampion').click(function (e) {
                const championName = $("#champions2").val();
                const lane = $("#lane2").val();

                if (championName === null || lane === null) {
                    displayError("Please select a champion and a lane!");
                    return;
                }

                addChampion(championName, lane).then(async (mode) => {
                    championpoolData = await getChampionpoolData(sharedTeamId);
                    sortData();
                    buildChampionpoolTable(mode);
                });
                editPopup.close();
            });
        });
    });
}

/**
 * Builds the popup for deleting a champion
 */
function setupDeletePopup() {
    delPopup = new Popup("popup-containerDelete");
    delPopup.displayYesNoPopup('/res/others/alert.png', 'Delete Champion', 'Are you sure you want to delete this champion?', 'Yes', 'No', 'btnDelYes', 'btnDelNo');

    waitForElement('#btnDelNo', function () {
        $('#btnDelNo').click(function (e) {
            delPopup.close();
        });
    });

    waitForElement('#btnDelYes', function () {
        $('#btnDelYes').click(function (e) {
            deleteChampion();
            delPopup.close();
        });
    });
}

/**
 * Builds the popup for adding a champion
 */
function setupAddPopup() {
    addPopup = new Popup("popup-containerAdd");

    $.when(
        fetchDropdown('lane', 'w-64', '[{"value": "1", "text": "Top Lane"}, {"value": "2", "text": "Jungle"}, {"value": "3", "text": "Mid Lane"}, {"value": "4", "text": "ADC"}, {"value": "5", "text": "Support"}]', 'Select a Lane'),
    ).then(function(dropdown) {
        addPopup.displayInputPopupCustom('/res/others/question_blue.png', 'Add a Champion', 'Add', 'btnSelectChampion',
            `<select id="champions" class="font-montserrat select2-component champions w-64">
                        <option value="" disabled selected>Select a Champion</option>
                   </select>` +
            `<div class="mt-4">` +
            dropdown +
            `</div>`
            );

        let data = championData.map(function (item) {
            return {id: item[0], text: item[0], imageUrl: item[1]};
        });

        waitForElement('#champions', function () {
            $("#champions").select2({
                data: data,
                templateResult: function (item) {
                    if (!item.id) {
                        return item.text;
                    }

                    let img = $(`<img class="rounded-full mr-3 w-12" src="${item.imageUrl}" alt="${item.text}" width="50" />`);
                    return $(`<div class="flex items-center"></div>`).append(img, item.text);
                }
            });
        });

        waitForElement('#btnSelectChampion', function () {
            $('#btnSelectChampion').click(function (e) {
                const championName = $("#champions").val();
                const lane = $("#lane").val();

                if (championName === null || lane === null) {
                    displayError("Please select a champion and a lane!");
                    return;
                }

                addChampion(championName, lane).then(async (mode) => {
                    championpoolData = await getChampionpoolData(sharedTeamId);
                    sortData();
                    buildChampionpoolTable(mode);
                });
                addPopup.close();
            });
        });
    });
}

/**
 * Adds a champion to the championpool
 * @param championName
 * @param lane
 */
function addChampion(championName, lane) {
    return new Promise((resolve, reject) => {
        let currentTabMode = $('.tab.bg-turquoise').data('mode');

        $.ajax({
            url: "/riot/addChampion",
            type: "POST",
            dataType: "json",
            data: {
                champion: championName,
                lane: lane,
                type: currentTabMode
            },
            success: function (data) {
                resolve(currentTabMode);
                displaySuccess("Champion added successfully")
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                reject(data);
                displayError("Error adding Champion! Please try again later.")
            }
        })
    });
}

/**
 * Deletes a champion from the championpool
 */
function deleteChampion() {
    $.ajax({
        url: "/riot/deleteChampion/" + championToDelete.id,
        type: "POST",
        dataType: "json",
        success: function (data) {
            championpoolData = championpoolData.filter((champion) => champion.id !== championToDelete.id);
            sortData();
            buildChampionpoolTable(championToDelete.type);
            displaySuccess("Champion deleted successfully")
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError("Error deleting Champion! Please try again later.")
        }
    });
}

/**
 * Updates the new order to the DB
 * @param championpoolId
 * @param direction 0=up 1=down
 * @returns {Promise<unknown>}
 */
function updateOrder(championpoolId, direction) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/riot/changeChampionOrder/" + championpoolId + "/" + direction,
            type: "POST",
            dataType: "json",
            success: function (data) {
                resolve(data);
                displaySuccess("Champion order updated successfully")
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                displayError("Error saving Order! Please try again later.")
                reject(data);
            }
        });
    });
}

/**
 * Builds the header of the championpool page
 */
function buildHeader() {
    const data = [{text: 'Top Lane', father: 'topDiv'}, {text: 'Jungle', father: 'jungleDiv'}, {text: 'Mid Lane', father: 'midDiv'}, {text: 'ADC', father: 'adcDiv'}, {text: 'Support', father: 'supportDiv'}];

    for (const entry of data) {
        const div = $('<div>', {class: "bg-grey-level3 px-2 py-4 flex justify-center mt-4"});
        const p = $('<p>', {
            class: "font-bold font-montserrat",
            text: entry.text
        });
        div.append(p);
        $(`#${entry.father}`).append(div);
    }
}

/**
 * Returns the username of a user based on the id
 * @param id
 * @returns {Promise<unknown>}
 */
function getUserName(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/user/getUsername/" + id,
            type: "GET",
            dataType: "json",
            success: function (data) {
                    resolve(data[0]);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}


/**
 * Fetches all LOL Champion Data from the DDragon API
 * @returns {Promise<void>}
 */
async function getDDragonData() {
    let dDragonData = null;
    await $.ajax({
        url: "/riot/getDDragonData/",
        type: "GET",
        dataType: "json",
        success: function (data) {
            dDragonData = data;
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
        }
    });
    return dDragonData;
}

/**
 * Returns an array with all champion names and pictures
 * Filters out all unnecessary data
 * @param dDragon
 * @returns {*[]}
 */
function getChampionNameAndPictureFromDDragon(dDragon){
    let championNameAndPicture = [];
    for (let champion in dDragon.data) {
        let championName = dDragon.data[champion].name;
        let championPicture = dDragon.data[champion].image.full;
        let version = dDragon.version;
        let pictureUrl = "https://ddragon.leagueoflegends.com/cdn/"+version+"/img/champion/"+championPicture;
        championNameAndPicture.push([championName, pictureUrl])
    }
    return championNameAndPicture;
}

/**
 * Gets all users from the database from one team
 * @returns {Promise<void>}
 */
async function getChampionpoolData(teamId) {
    let championpoolData = null;
    await $.ajax({
        url: "/riot/getChampionpool/" + teamId,
        type: "GET",
        dataType: "json",
        success: function (data) {
            championpoolData = data;
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
        }
    });

    return championpoolData;
}