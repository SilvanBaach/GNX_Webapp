const rowCount = 6;
let currentTarget = null;
let championNameAndPictureUrl;

/**
 * Build the header for each championpool table
 * @param headerElement The element where the header should be placed inside
 */
function buildChampionpoolHeader(headerElement) {
    var header = document.querySelector(headerElement);
    var headerTerms = ['', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

    // Create the header
    header.innerHTML = headerTerms
        .map(function (headerTerm) {
            var headerClass = "grid-header";
            return (
                '<div class="grid-item ' +headerClass + '">' +
                '<div class="header-content-container">' +
                '<p>' + headerTerm + '</p>' +
                '</div>' +
                '</div>'
            );
        })
        .join("");
}

/**
 * Build the container for each championpool table
 * @param containerElement The element where the header should be placed inside
 * @param tableData The tableData should be an array which includes the position of and the text for each cell
 */
function buildChampionpoolContainer(containerElement, columnCount) {
    rowString = containerElement.split("-")[0].replace(".", "")
    const tableType = convertTableTypeToInt(rowString);
    rowString = rowString.charAt(0).toUpperCase() + rowString.slice(1)
    var container = document.querySelector(containerElement);
    var tableData = fillArrayWithNull([])
    for (var i = 0; i < columnCount; i++) {
        let counter = 0;
        var headerClass = "row-container";
        var htmlContent = tableData
            .map(function (dataArray) {
                counter++; // Increment the counter with each iteration of the map function
                if (counter % rowCount === 1) {
                    return '' +
                        '<div class="grid-item ' + headerClass + ' grid-item-main" ' +
                        addAttributesToElements(tableType, i, counter-1, rowString +" " + (i+1), 0) +
                        '>' +
                        '<div class="champion-container">' +
                        '<p class="champion-main">' + rowString + " " + (i+1) + '</p>' +
                        '</div></div>';
                } else {
                    return '' +
                        '<div class="grid-item ' + headerClass + '" ' +
                        addAttributesToElements(tableType, i, counter-1, "PlaceHolder", counter-1) +
                        '>' +
                        '<div class="champion-container">' +
                        '<span class="championname-span">PlaceHolder</span>' +
                        '<img class="champion-img" src="../../res/others/blank_profile_picture.png" alt="Champion Image">' +
                        '</div></div>';
                }
            })
            .join("");
        container.innerHTML += htmlContent;
    }
}



/**
 * This method setups the championpool Page
 * This includes the header, the container and the popup
 * @returns {Promise<void>}
 */
async function setupChampionpool() {
    const headerElement = [".main-chp-header", ".practice-chp-header", ".suggestion-chp-header"];

    const popupChampions = new Popup("popup-containerChampions");

    championNameAndPictureUrl = getChampionNameAndPictureFromDDragon(await getDDragonData());
    popupChampions.displayPopupWithTable(championNameAndPictureUrl);

    headerElement.forEach(buildChampionpoolHeader);

    buildChampionpoolContainer(headerElement[0], 7);
    buildChampionpoolContainer(headerElement[1], 3);
    buildChampionpoolContainer(headerElement[2], 3);

    fillAllTablesWithData(await getChampionpoolData())

    $(".champion-container").click(function (e) {
        const $target = $(e.currentTarget);
        const $gridItem = $target.closest(".grid-item"); // Find the closest ancestor with class 'grid-item'

        popupChampions.open(e);
        currentTarget = $gridItem; // Set currentTarget to the .grid-item element
    });


    $(".champion-container-popup").click(function (e) {
        const $target = $(e.currentTarget);
        const championName = $target.find('span').text(); // Get the inner text of the .champion-container-popup
        const championSrc = $target.find('img').attr("src"); // Get the src attribute of the image in .champion-container-popup

        $(currentTarget).attr("data-championname", championName); // Set the data-championname attribute of currentTarget with championName
        $(currentTarget).find('span').text(championName); // Replace the inner text of currentTarget with championName
        $(currentTarget).find('img').attr("src", championSrc); // Replace the src attribute of the image in currentTarget with championSrc


        updateChampionpoolData(currentTarget, championName);
    });

}

/**
 * Gets all users from the database from one team
 * @returns {Promise<void>}
 */
async function getDDragonData() {
    let dDragonData = null;
    await $.ajax({
        url: "/riot/getDDragonData/",
        type: "GET",
        success: function (data) {
            dDragonData = data;
        },
        error: function (data) {
            console.log(data);
        }
    });
    return dDragonData;
}

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
async function getChampionpoolData() {
    let championpoolData = null;
    await $.ajax({
        url: "/riot/getChampionpool/",
        type: "GET",
        success: function (data) {
            championpoolData = data;
        },
        error: function (data) {
            console.log(data);
        }
    });

    return championpoolData;
}

/**
 * Updates the data of a Team
 */
function updateChampionpoolData(element, newChampionName) {
    const $container = $(element);
    const playerOfChampion = $container.data("playerofchampion")
    //const editorOfChampion = null
    const championpoolTableType = $container.data("tabletype")
    const lane= $container.data("lane")
    const row = $container.data("row")
    //TODO: If there are more than 1 team check of teamNames
    const team = 0;
    const championpoolData = [playerOfChampion, championpoolTableType, lane, row, newChampionName, team]

    $.ajax({
        url: "/riot/updateChampionpool",
        type: "POST",
        data: {
            championpoolData: championpoolData
        },
        success: function() {
            console.log("Successfully updated championpool data!");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error updating Championpool", errorThrown);
        }
    });
}

/**
 * This method is used to fill an array with null values until it has the length of the rowCount
 * @param array The array which should be filled with null values
 * @returns {*} The array with the null values
 */
function fillArrayWithNull(array) {
    const minLength = rowCount;
    const currentLength = array.length;

    if (currentLength < minLength) {
        for (let i = currentLength; i < minLength; i++) {
            array.push(null);
        }
    }
    return array;
}

/**
 * This method adds attributes to the elements of a grid-item
 * @param tableType The tableType of the grid-item
 * @param row The row of the grid-item
 * @param lane The lane of the grid-item
 * @param championName The championName of the grid-item
 * @param playerOfChampion The playerOfChampion of the grid-item
 * @returns {string} The custom attributes as a string
 */
function addAttributesToElements(tableType, row, lane, championName, playerOfChampion) {
    return 'data-tableType="' + tableType + '" ' +
        'data-row="' + row + '" ' +
        'data-lane="' + lane + '" ' +
        'data-championName="' + championName + '" ' +
        'data-playerOfChampion="' + playerOfChampion + '"';
}

/**
 * This method converts the tableType to the corresponding int value
 * main = 0, Practice = 1, Suggestion = 2
 * @param tableType The tableType which should be converted
 * @returns {number} The int value of the tableType
 */
function convertTableTypeToInt(tableType){
    if(tableType === "main"){
        return 0;
    }else if(tableType === "practice"){
        return 1;
    }else if(tableType === "suggestion"){
        return 2;
    }
}

/**
 * This method loops trough each table in the database and fills the values into the corresponding row-container
 * @param data The championpool data
 */
function fillAllTablesWithData(data) {
    data.forEach((dataElement) => {
        const tableType = dataElement.type;
        const row = dataElement.row;
        const lane = dataElement.lane;

        const tableElement = $(`.row-container[data-lane=${lane}][data-row=${row}][data-tabletype=${tableType}]`);

        if (tableElement.length === 0) {
            //TODO Delete value from DB
            // No elements were found
            console.log("No elements found that meet the criteria.");
        } else {
            // Fill the elements with the data
            const championName = dataElement.champion
            $(tableElement[0]).data("championname", championName);
            $(tableElement[0]).find('.championname-span').text(championName);
            $(tableElement[0]).find('.champion-img').attr("src", getPictureUrlFromChampionName(championName));
        }
    });
}

function getPictureUrlFromChampionName(championName) {
    const championEntry = championNameAndPictureUrl.find(champion => champion[0] === championName);
    if (championEntry) {
        return championEntry[1];
    } else {
        return null; // Or you can return a default image URL if the champion is not found.
    }
}



