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
    popupChampions.displayPopupWithTable([["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"]]
    )

    buildChampionpoolHeader(headerElement, playerArray);
    buildChampionpoolContainer(headerElement, playerArray);
    $(".champion-img").click(function (e) {
        popupChampions.open(e);
    });
}
