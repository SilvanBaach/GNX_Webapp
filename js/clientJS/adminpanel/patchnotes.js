/**
 * This function build the patchnote page
 */
function initPage(){
    loadCurrentVersion()
}

/**
 * Loads the current webapp version and sets it in the input field
 */
function loadCurrentVersion(){
    $.ajax({
        type: 'GET',
        url: '/patchnotes/getCurrentVersion',
        success: function(response) {
            $('#version').attr('placeholder', response[0].version);
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
 * Saves the new patchnote
 * @param data
 */
function saveNewPatchnote(data){
    $.ajax({
        type: 'POST',
        url: '/patchnotes/add',
        data: data,
        success: function(response) {
            displaySuccess(response.message);
            $('#version').val('');
            $('#text').val('');
            loadCurrentVersion();
        },
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}