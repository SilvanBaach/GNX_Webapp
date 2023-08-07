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
    removeBodyCSS();
    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: page.css
    }).appendTo("body");
}

/**
 * Remove all the CSS files from the body
 */
function removeBodyCSS() {
    const links = document.body.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => link.parentNode.removeChild(link));
}