let championData;
let championpoolData;

/**
 * This method setups the championpool Page
 * This includes the header, the container and the popup
 * @returns {Promise<void>}
 */
async function setupChampionpool(teamId) {
    championData = getChampionNameAndPictureFromDDragon(await getDDragonData());
    championpoolData = await getChampionpoolData(teamId);
    buildChampionpoolTable(0);
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
                class: "font-montserrat text-sm text-center",
                text: `Edited by ${username}`
            });

            const arrowUpIcon = $('<i>', {class: "ri-arrow-up-line ri-lg absolute top-1 left-2"});
            const arrowDownIcon = $('<i>', {class: "ri-arrow-down-line ri-lg absolute top-8 left-2"});
            const closeIcon = $('<i>', {class: "ri-close-line ri-lg absolute right-2 top-1"});
            const editIcon = $('<i>', {class: "ri-edit-line ri-lg absolute right-2 top-8"});

            championDiv.append(nameP, img, editedByP, arrowUpIcon, arrowDownIcon, closeIcon, editIcon);
            fatherDiv.append(championDiv);

        }
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