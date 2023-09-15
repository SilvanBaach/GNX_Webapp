let currentNote = null;
let currentNoteSections = [];

/**
 * This function holds all logic for the initialization of the training notes page
 */
function initTrainingNotes() {
    $("#noteDisplayContainer").hide();
    $("#editNoteContainer").hide();
    $("#saveNote").hide().click(function() {
        saveNote();
    });
    $("#editNote").hide().click(function() {
        editNote();
    });

    setupAddSectionPopup();
}

/**
 * Builds the existing notes table
 */
function buildExistingNodesTable(){
    let table = $('#existingNotesData');
    table.empty();

    loadExistingNotes().then((result) => {
        for (let i = 0; i < result.length; i++) {
            let note = result[i];
            // Create a new row and add it to the table
            let newRow = $('<tr>');
            newRow.append($('<td>').text(note.created));
            newRow.append($('<td style="font-weight: bold">').text(note.title));
            newRow.append($('<td>').text(note.creator));
            newRow.append($('<td>').text(note.editor));
            newRow.append($('<td>').text(note.lastedited));
            let viewButton = $('<button class="default purple" style="height: 30px"><i class="ri-eye-line ri-lg"></i>View</button>');
            viewButton.on('click', function() {
                displayTrainingNote(note);
            });
            newRow.append($('<td>').append(viewButton));
            table.append(newRow);
        }
    });
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

/**
 * Displays the training note with the given noteId
 * @param note
 */
function displayTrainingNote(note) {
    $("#nothingPlaceholder").hide();
    $("#noteDisplayContainer").show();
    $("#editNote").show();

    $("#noteTitle").text(note.title);
    $("#noteCreation").html("Created at <strong>" + note.created + "</strong> by <strong>" + note.creator + "</strong>");

    currentNote = note;
}

/**
 * Function which enabled the edit mode for the note
 */
function editNote() {
    $("#noteDisplayContainer").hide();
    $("#editNote").hide();
    $("#saveNote").show();
    $("#editNoteContainer").show();

    $("#noteCreationEdit").html("Created at <strong>" + currentNote.created + "</strong> by <strong>" + currentNote.creator + "</strong>");
    $("#editTitle").val(currentNote.title);
}

/**
 * Function which saves the note
 */
function saveNote(){
    $("#noteDisplayContainer").show();
    $("#editNote").show();
    $("#saveNote").hide();
    $("#editNoteContainer").hide();
}

/**
 * Function which opens the popup for adding a new section
 */
function setupAddSectionPopup(){
    const popupAddSection = new Popup("popupContainerAddSection");

    popupAddSection.displayDropdownPopup('/res/others/plus.png','Add new Section','Add','btnAddSection','sectionDropdown',
        [{value: 1, label: "Title"},{value: 2, label: "Simple Text"},{value: 3, label: "Rich Text"},{value: 4, label: "Picture"},{value: 5, label: "Video"},{value: 6, label: "LoL Game-Stats"}])

    $("#addNewSection").click(function (e) {
        $("#sectionDropdown").val(1);
        popupAddSection.open(e);
    });

    $("#btnAddSection").click(function () {
        popupAddSection.close()
        addSection($("#sectionDropdown").val());
    });
}

/**
 * This function adds a new section to the note
 * @param type
 */
function addSection(type){
    let html;

    switch (type) {
        case '1':
            html = addTitleSection();
            break;
        case '2':
            html = addSimpleTextSection();
            break;
        case '3':
            html = addRichTextSection();
            break;
        case '4':
            break;
        case '5':
            html = addVideoSection();
            break;
        case '6':
            break;
    }

    $("#sectionContainer").append(html);
    if(type === '3'){
        currentNoteSections[currentNoteSections.length-1].editor = new RichTextEditor("#editor" + currentNoteSections.length);
    }
}

/**
 * This function returns the html for a new title section
 */
function addTitleSection(){
    let html= `<div class="section">
                        <div class="new-title-container">
                            <label class="label">Section Title</label>
                            <input type="text" class="input" id="newTitle${currentNoteSections.length+1}" style="width: 500px"/>
                        </div>
                      </div>`;

    currentNoteSections.push({type: 1, editor: null, fieldRef: "#newTitle" + currentNoteSections.length});

    return html;
}

/**
 * This function returns the html for a new simple text section
 */
function addSimpleTextSection(){
    let html= `<div class="section">
                        <div class="new-title-container">
                            <label class="label">Simple Text</label>
                            <textarea class="input-textarea" id="newSimpleText${currentNoteSections.length+1}" rows="7"/>
                        </div>
                      </div>`;

    currentNoteSections.push({type: 2, editor: null, fieldRef: "#newSimpleText" + currentNoteSections.length});

    return html;
}

/**
 * This function returns the html for a new text section
 * @returns {*}
 */
function addRichTextSection(){
    let html= `<div class="section">
                <div id="editor${currentNoteSections.length+1}">
                </div>
            </div>`;

    currentNoteSections.push({type: 3, editor: null, fieldRef: null});

    return html;
}

/**
 * This function returns the html for a new video section
 */
function addVideoSection(){

}