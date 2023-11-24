/**
 * Load the page with the given id
 * @param id the page id
 * @param pages the array of available pages
 * @returns {Promise<void>}
 */
async function loadPage(id, pages) {
    $('#home-section').empty();
    const page = pages.find(p => p.id === id);
    if (!page) {
        return;
    }
    $.get(page.url, function (html) {
        $('#home-section').html(html);
    });

    $('#'+id).addClass('bg-grey-level3');
    $('#'+id+'-line').addClass('bg-almost-white').removeClass('bg-transparent');

    pages.forEach(p => {
        if (p.id !== id) {
            $('#'+p.id).removeClass('bg-grey-level3');
            $('#'+p.id+'-line').removeClass('bg-almost-white');

            if (!$('#'+p.id+'-line').hasClass('bg-transparent')) {
                $('#'+p.id+'-line').addClass('bg-transparent');
            }
        }
    });
}

/**
 * Checks if a user is still authenticated
 * @returns {Promise<*|boolean>}
 */
async function checkSessionStatus() {
    try {
        const response = await $.get('/session-status');
        return response.isAuthenticated;
    } catch (error) {
        console.error('Error checking session status:', error);
        return false;
    }
}

/**
 * Loads an Entry Field from the Server
 */
function fetchEntryField(type, name, id, width, value) {
    return $.get(`/renderEntryField?type=${type}&name=${name}&id=${id}&width=${width}&value=${value}`);
}

/**
 * Loads a button from the Server
 */
function fetchButton(type, id, text, width, icon, customClasses, iconPos, btnType, inputId) {
    return $.get(`/renderButton?type=${type}&icon=${icon}&id=${id}&customClasses=${customClasses}&iconPos=${iconPos}&btnType=${btnType}&inputId=${inputId}&text=${text}&width=${width}`);
}