/**
 * Initialize the page
 */
function initPage(){
    loadOpenGamedayReports()
}

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