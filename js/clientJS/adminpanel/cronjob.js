let cronjobDefinitions = {};

/**
 * This function is used to initialize the page.
 */
function initPage(){
    fillCronjobDropdown();
}

/**
 * THis function is used to build the GUI for the selected cronjob
 * @param cronjobId
 */
function buildConfigGUI(cronjobId){
    $("#configGUI").removeClass('hidden')
    const configGUIContent = $('#configGUIContent');
    configGUIContent.empty();

    const cronjobDefinition = cronjobDefinitions.find(function (element) {
        return element.id === cronjobId;
    });
}

/**
 * This function fills the dropdown with all available cronjobs
 */
function fillCronjobDropdown(){
    $.ajax({
        url: '/cronjob/getDefinitions',
        type: 'GET',
        success: function (data) {
            console.log(data)
            const dropdown = $('#jobType');
            dropdown.empty();
            dropdown.append('<option value="undefined">Please select a Job</option>');
            data.forEach(function (element) {
                dropdown.append(`<option value="${element.id}">${element.displayname}</option>`);
            });

            cronjobDefinitions = data;
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}