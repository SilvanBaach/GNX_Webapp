let allNotes = [];
let currentPage = 1;
const notesPerPage = 10;

/**
 * Initializes the page
 */
function initPage(){
    loadExistingNotes().then(function(notes){
        allNotes = notes;
        displayNotesForPage(currentPage);
    });

    $('#nextPage').click(function() {
        let totalPages = Math.ceil(allNotes.length / notesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayNotesForPage(currentPage);
        }
    });

    $('#prevPage').click(function() {
        if (currentPage > 1) {
            currentPage--;
            displayNotesForPage(currentPage);
        }
    });
}

/**
 * Slices the notes to display only the ones for the current page
 * @param page
 */
function displayNotesForPage(page) {
    let startIndex = (page - 1) * notesPerPage;
    let endIndex = startIndex + notesPerPage;
    let notesToDisplay = allNotes.slice(startIndex, endIndex);
    displayNotes(notesToDisplay);
    updatePaginationIndicator(page, Math.ceil(allNotes.length / notesPerPage));
}

/**
 * Builds the table of the existing notes
 */
function displayNotes(notes){
    const tableBody = $('#notesData');
    tableBody.empty();

    notes.forEach(function(note){
        const tr = $("<tr></tr>");
        const tdCreated = $("<td></td>").text(note.created).addClass("hidden sm:table-cell");
        const tdTitle = $("<td></td>").text(note.title);
        const tdAuthor = $("<td></td>").text(note.creator);
        const tdLastModifier = $("<td></td>").text(note.editor).addClass("hidden md:table-cell");
        const tdLastModified = $("<td></td>").text(note.lastedited).addClass("hidden lg:table-cell");
        const tdButton = $("<td></td>");
        const button = $("<button></button>", {
            id: `note-btn-${note.id}`,
            click: function() {
                localStorage.setItem('currentNote', JSON.stringify(note));
                loadPage('trainingnotes_display');
            }
        });
        button.addClass("flex items-center justify-center");
        button.append($("<i></i>").addClass("ri-eye-line ri-lg hover:text-turquoise"));

        tr.append(tdCreated).append(tdTitle).append(tdAuthor).append(tdLastModifier).append(tdLastModified).append(tdButton.append(button));
        tableBody.append(tr);
    });
}

/**
 * Updates the pagination indicator
 * @param currentPage
 * @param totalPages
 */
function updatePaginationIndicator(currentPage, totalPages) {
    $('#pageIndicator').text(`Page ${currentPage} / ${totalPages}`);
}

/**
 * Loads the existing notes from the database
 */
function loadExistingNotes(){
    return $.ajax({
        url: '/trainingNotes/getAll',
        type: 'GET',
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            console.log("Error fetching training notes:", data.responseJSON);
        }
    })
}