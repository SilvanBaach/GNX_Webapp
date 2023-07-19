let currentTarget = null;
function buildChampionpoolHeader(headerElement, playerArray) {
    var header = document.querySelector(headerElement);
    var playerNames = ['', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

    //TODO: Use the playerArray to build the header

    // Create the header
    header.innerHTML = playerNames
        .map(function (day) {
            var headerClass = "grid-header";
            return (
                '<div class="grid-item ' +headerClass + '">' +
                '<div class="header-content-container">' +
                '<p>' + day + '</p>' +
                '</div>' +
                '</div>'
            );
        })
        .join("");
}
function buildChampionpoolContainer(containerElement, playerArray) {
    var container = document.querySelector(containerElement);
    var playerNames = ['None', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];
    var indexCounter = 1; // Initialize the index counter
    for (var i = 0; i < 7; i++) {
        var headerClass = "row-container";
        var htmlContent = playerNames
            .map(function (player, index) {
                if (player === 'None') {
                    var currentIndex = indexCounter++; // Increment the index counter
                    return '' +
                        '<div class="grid-item ' + headerClass + ' grid-item-main">' +
                        '<div class="champion-container">' +
                        '<p class="champion-main">Main ' + currentIndex + '</p>' +
                        '</div></div>';
                } else {
                    return '' +
                        '<div class="grid-item ' + headerClass + '">' +
                        '<div class="champion-container">' +
                        '<span class="championname-span">Aatrox</span>' +
                        '<img class="champion-img" src="https://ddragon.leagueoflegends.com/cdn/11.16.1/img/champion/Aatrox.png" alt="Champion Image">' +
                        '</div></div>';
                }
            })
            .join("");

        container.innerHTML += htmlContent;
    }
}
async function setupChampionpool() {
    const headerElement = ".main-chp-header";
    const playerArray = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];

    const popupChampions = new Popup("popup-containerChampions");
    popupChampions.displayPopupWithTable(getChampionNameAndPictureFromDDragon(await getDDragonData())
    )

    buildChampionpoolHeader(headerElement, playerArray);
    buildChampionpoolContainer(headerElement, playerArray);
    $(".champion-container").click(function (e) {
        popupChampions.open(e);
        currentTarget = e.currentTarget
    });

    $(".champion-container-popup").click(function (e) {
        const $target = $(e.currentTarget);
        const $span = $target.find('span').clone();
        const $img = $target.find('img').clone();

        $(currentTarget).html($span).append($img);
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
