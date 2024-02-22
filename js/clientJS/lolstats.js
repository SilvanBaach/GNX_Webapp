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
    }else{
        $('#invalidRiotId').addClass('hidden')
        $('#validRiotId').removeClass('hidden')
    }

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
