/**
 * Initialize the page
 */
function initPage(){
    loadOpenGamedayReports()
    loadCurrentWebappVersion()
}

/**
 * Loads the count of open gameday reports
 */
function loadOpenGamedayReports(){
    $.ajax({
        type: 'GET',
        url: '/gameday/getOpenResultCount',
        success: function(response) {
            $('#openGamedayReports').text(response.count);
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
 * Loads the current webapp version
 */
function loadCurrentWebappVersion(){
    $.ajax({
        type: 'GET',
        url: '/patchnotes/getCurrentVersion',
        success: function(response) {
            $('#currentVersion').text(response[0].version);
        },
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}