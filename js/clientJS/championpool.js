const rowCount = 6;
const columnCount = 7;
let currentTarget = null;

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
 * @param tableData The tableData should be a array which includes the position of and the text for each cell
 */
function buildChampionpoolContainer(containerElement, tableData) {
    const tableType = containerElement.split("-")[0].replace(".", "");
    var container = document.querySelector(containerElement);
    fillArrayWithNull(tableData);
    for (var i = 0; i < columnCount; i++) {
        let counter = 0;
        var headerClass = "row-container";
        var htmlContent = tableData
            .map(function (dataArray) {
                counter++; // Increment the counter with each iteration of the map function
                if (counter % columnCount === 1) {
                    if (dataArray === null) {
                        return '' +
                            '<div class="grid-item ' + headerClass + ' grid-item-main" ' +
                            addAttributesToElements(tableType, i, counter-1, "Main " + i, null) +
                            '>' +
                            '<div class="champion-container">' +
                            '<p class="champion-main">' + "Main" + " " + i + '</p>' +
                            '</div></div>';
                    } else {
                        return '' +
                            '<div class="grid-item ' + headerClass + ' grid-item-main" ' +
                            addAttributesToElements(tableType, i, counter-1, dataArray.championName, null) +
                            '>' +
                            '<div class="champion-container">' +
                            '<p class="champion-main">' + dataArray.championName + '</p>' +
                            '</div></div>';
                    }
                } else {
                    if (dataArray === null) {
                        return '' +
                            '<div class="grid-item ' + headerClass + '" ' +
                            addAttributesToElements(tableType, i, counter-1, "PlaceHolder", counter-1) +
                            '>' +
                            '<div class="champion-container">' +
                            '<span class="championname-span">PlaceHolder</span>' +
                            '<img class="champion-img" src="../../res/others/blank_profile_picture.png" alt="Champion Image">' +
                            '</div></div>';
                    } else {
                        return '' +
                            '<div class="grid-item ' + headerClass + '" ' +
                            addAttributesToElements(tableType, i, counter-1, dataArray.championName, counter-1) +
                            '>' +
                            '<div class="champion-container">' +
                            '<span class="championname-span">' + dataArray.championName + '</span>' +
                            '<img class="champion-img" src="https://ddragon.leagueoflegends.com/cdn/11.16.1/img/champion/' + dataArray.championName + '.png" alt="Champion Image">' +
                            '</div></div>';
                    }
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
    const headerElement = [".main-chp-header", ".practice-chp-header", ".suggestions-chp-header"];
    const playerArray = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];

    const popupChampions = new Popup("popup-containerChampions");
    popupChampions.displayPopupWithTable(getChampionNameAndPictureFromDDragon(await getDDragonData())
    )

    headerElement.forEach(buildChampionpoolHeader);
    buildChampionpoolContainer(headerElement[0], await getChampionpoolData());
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

        updateChampionpoolData();
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
function updateChampionpoolData() {
    const championpoolData = [];

    $(".row-container").each(function() {
        const playerOfChampion = null;
        const editorOfChampion = null
        const championpoolTableType = null
        const lane= $(this).id % columnCount;
        const row = Math.floor($(this).id / columnCount)
        const championName = $(this).innerText;
        //TODO: If there are more than 1 team check of teamNames
        const team = 0;
        championpoolData.push([playerOfChampion, editorOfChampion, championpoolTableType, lane, row, championName, team]);
    });

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
function addAttributesToElements(tableType, column, row, championName, playerOfChampion) {
    let customAttributes = 'data-tableType="' + tableType + '" ' +
        'data-column="' + column + '" ' +
        'data-row="' + row + '" ' +
        'data-championName="' + championName + '" ' +
        'data-playerOfChampion="' + playerOfChampion + '"';
    return customAttributes;
}
