let currentNote = null;
let allNotes = [];
let currentNoteSections = [];
let currentSection = null;
let currentInternalId = 0;
let allAnnotations = [];

let sectionIndexToBeDeleted = null;

const popupDelSection = new Popup("popupContainerDelSection");
const popupAddAnnotation = new Popup("popupContainerAddAnnotation");

/**
 * This function holds all logic for the initialization of the training notes page
 */
function initTrainingNotes() {
    $("#noteDisplayContainer").hide();
    $("#editNoteContainer").hide();
    $("#editBtnContainer").hide();
    $("#saveNote").off('click').click(function() {
        saveNote();
    });
    $("#editNote").hide().off('click').click(function() {
        editNote();
    });
    $("#discardChanges").off('click').click(function() {
        displayTrainingNote(currentNote.id)
    });
    $("#newNote").off('click').click(function() {
        createNewNote();
    });

    setupAddSectionPopup();
    setupDelSectionPopup();
    setupDelNotePopup();
    setupAddAnnotationPopup();

    $(document).off('click', '.edit-icon').on('click', '.edit-icon', function(e) {
        e.preventDefault();

        const sectionElement = $(this).closest('.section');
        const sectionIndex = $("#sectionContainer .section").index(sectionElement);

        getAllSectionValues();

        if ($(this).children().hasClass('ri-arrow-up-line')) {
            moveSectionUp(sectionIndex);
            editNote();
        } else if ($(this).children().hasClass('ri-arrow-down-line')) {
            moveSectionDown(sectionIndex);
            editNote();
        } else if ($(this).children().hasClass('ri-close-circle-line')) {
            sectionIndexToBeDeleted = sectionIndex;
            popupDelSection.open(e);
        }
    });
}

/**
 * Builds the existing notes table
 */
function buildExistingNodesTable() {
    let table = $('#existingNotesData');
    table.empty();

    loadExistingNotes().then((result) => {
        allNotes = result;

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
            viewButton.attr('data-id', note.id);
            viewButton.on('click', function() {
                let id = $(this).attr('data-id');
                if ($("#editNoteContainer").is(":visible")) {
                    displayError("Please save or cancel your changes first!")
                }else {
                    displayTrainingNote(id);
                }
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
 * @param noteId
 */
function displayTrainingNote(noteId) {
    if (!noteId) {
        $("#editBtnContainer").hide();
        $("#editNoteContainer").hide();
        $("#editNote").hide();
        $("#nothingPlaceholder").show();
        return;
    }

    currentNote = allNotes.find(note => note.id == noteId);

    if (!currentNote) {
        console.error("Note with ID " + noteId + " not found in allNotes.");
        return;
    }

    //Load the sections
    getSections(noteId).then((result) => {
        currentNoteSections = result;

        $("#nothingPlaceholder").hide();
        $("#editBtnContainer").hide();
        $("#editNoteContainer").hide();
        $("#noteDisplayContainer").show();
        $("#sectionDisplayContainer").empty();
        $("#editNote").show();

        $("#noteTitle").text(currentNote.title);
        $("#noteCreation").html("Created at <strong>" + currentNote.created + "</strong> by <strong>" + currentNote.creator + "</strong>");

        //Add all the Sections to display them
        currentNoteSections.forEach(function (section) {
            currentSection = section;
            addSection(section.type,0, section.value);
        });
    });
}

/**
 * This function returns all sections for a training note
 * @param noteId
 * @returns {JQuery.jqXHR}
 */
function getSections(noteId){
    return $.ajax({
        url: '/trainingNotes/getSections',
        type: 'GET',
        data: {noteId: noteId},
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            console.log("Error fetching sections:", data.responseJSON);
        }
    })
}

/**
 * Function which enabled the edit mode for the note
 */
function editNote() {
    $("#noteDisplayContainer").hide();
    $("#editNote").hide();
    $("#editBtnContainer").show();
    $("#editNoteContainer").show();
    $("#sectionContainer").empty();

    $("#noteCreationEdit").html("Created at <strong>" + currentNote.created + "</strong> by <strong>" + currentNote.creator + "</strong>");
    $("#editTitle").val(currentNote.title);

    //Add all the Sections to display them
    for(let i = 0; i < currentNoteSections.length; i++) {
        addSection(currentNoteSections[i].type, 1, currentNoteSections[i].value, false, i+1);
    }
}

/**
 * This method writes all sections values from their respective fields into the currentNoteSections array
 */
function getAllSectionValues(){
    $.each(currentNoteSections, function(index, section) {
        if (section.editor) {
            section.value = section.editor.getHTMLCode();
            section.editor = null;
        }else if(section.fieldRef) {
            let element = $(section.fieldRef);
            section.value = element.val();
        }
    });
}

/**
 * Function which saves the note
 */
function saveNote(){
    getAllSectionValues();

    for (let i = 0; i < currentNoteSections.length; i++) {
        currentNoteSections[i].order = i+1;
    }

    //After the sorting the order = internalSectionId
    allAnnotations.forEach(function (annotation) {
        const section = currentNoteSections.find(section => section.order === annotation.internalId)
        annotation.section_fk = section.id
    });

    console.log(allAnnotations)

    currentNote.title = $("#editTitle").val();

    upsertTrainingNote().then(() => {
        $("#noteDisplayContainer").show();
        $("#editNote").show();
        $("#editBtnContainer").hide();
        $("#editNoteContainer").hide();
        $("#sectionDisplayContainer").empty();

        buildExistingNodesTable();
        currentNote = allNotes[0];
        displayTrainingNote(currentNote.id);
    });
}

/**
 * Function which opens the popup for adding a new section
 */
function setupAddSectionPopup(){
    const popupAddSection = new Popup("popupContainerAddSection");

    popupAddSection.displayDropdownPopup('/res/others/plus.png','Add new Section','Add','btnAddSection','sectionDropdown',
        [{value: 1, label: "Title"},{value: 2, label: "Simple Text"},{value: 3, label: "Rich Text"},{value: 4, label: "Video"},{value: 5, label: "LoL Game-Stats"}])

    $("#addNewSection").click(function (e) {
        $("#sectionDropdown").val(1);
        popupAddSection.open(e);
    });

    $("#btnAddSection").click(function () {
        popupAddSection.close()
        addSection($("#sectionDropdown").val(),1,"",true, currentNoteSections.length+1);
    });
}

/**
 * Function which setups the popup for adding a new video annotation
 */
function setupAddAnnotationPopup(){
    popupAddAnnotation.displayInputPopupCustom('/res/others/plus.png','Add new Annotation','Add','btnAddAnnotation',
        `<label class="input-label" for="annotationTitle">Title</label>
                    <input type="text" id="annotationTitle" class="input-field"/>
                    <label class="input-label" for="annotationText">Text</label>
                    <textarea id="annotationText" class="input-field" rows="7" style="height: 100px; padding: 5px"></textarea>`);

    $(".addAnnotation").off('click').click(function (e) {
        currentInternalId = $(this).data('internalid');
        $("#annotationTitle").val("");
        $("#annotationText").val("");
        popupAddAnnotation.open(e);
    });

    $("#btnAddAnnotation").off('click').click(function (e) {
        popupAddAnnotation.close()
        addAnnotation(e);
    });
}

/**
 * Adds an annotation to the current section
 */
function addAnnotation() {
    const currentTime = getCurrentTime();
    const title = $("#annotationTitle").val();
    const text = $("#annotationText").val();

    allAnnotations.push({internalId: currentInternalId, time: currentTime, title: title, text: text});
    redrawAnnotations();
}

/**
 * Redraws all annotations of the current section
 */
function redrawAnnotations() {
    $("#annotationList" + currentInternalId).empty();
    allAnnotations.forEach(function (annotation) {
       if (annotation.internalId === currentInternalId){
              $("#annotationList" + currentInternalId).append(`<div class="annotation">
                 <a href="" class="edit-icon"><i class="ri-close-circle-line ri-xl"></i></a>
                 <a href="" class="edit-icon"><i class="ri-play-circle-line ri-xl"></i></a>
                 <p>${annotation.time}</p>
                 <p>${annotation.title}</p>
                </div>`)
       }
    });
}

/**
 * Returns the current time of the video of the current video player
 */
function getCurrentTime() {
    if (currentInternalId) {
        const videoElement = document.querySelector(`#video${currentInternalId}`);
        return formatTime(videoElement.currentTime);
    }

    return '00:00:00';
}

/**
 * Formats the current time of the player in the format hh:mm:ss
 * @param seconds
 * @returns {string}
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Function which opens the popup for deleting a new section
 */
function setupDelSectionPopup(){
    popupDelSection.displayYesNoPopup('/res/others/alert.png','Delete Section','Do you really want to delete this section?','No','Yes','btnNoDelSection', 'btnYesDelSection')

    $("#btnNoDelSection").click(function () {
        popupDelSection.close()
    });

    $("#btnYesDelSection").click(function () {
        deleteSection(sectionIndexToBeDeleted)
        sectionIndexToBeDeleted = null;
        popupDelSection.close()
    });
}

/**
 * Function which setups the popup for deleting a note
 */
function setupDelNotePopup(){
    const popupDelNote = new Popup("popupContainerDelNote");
    popupDelNote.displayYesNoPopup('/res/others/alert.png','Delete Note','Do you really want to delete this note?','No','Yes','btnNoDelNote', 'btnYesDelNote')

    $("#deleteNote").click(function (e) {
        popupDelNote.open(e);
    });

    $("#btnNoDelNote").click(function () {
        popupDelNote.close()
    });

    $("#btnYesDelNote").click(function () {
        deleteNote();
        popupDelNote.close()
    });
}

/**
 * This function adds a new section to the note
 * @param type
 * @param mode 0 = display, 1 = edit
 * @param value the value of the field
 * @param newSection true if the section is new
 * @param internalSectionId the id of the section in the array
 */
function addSection(type, mode, value, newSection = false, internalSectionId) {
    let html;

    if (typeof type === 'string') {
        type = parseInt(type);
    }

    switch (type) {
        case 1:
            html = addTitleSection(mode, value, newSection, internalSectionId);
            break;
        case 2:
            html = addSimpleTextSection(mode, value, newSection, internalSectionId);
            break;
        case 3:
            html = addRichTextSection(mode, value, newSection, internalSectionId);
            break;
        case 4:
            html = addVideoSection(mode, value, newSection, internalSectionId);
            break;
        case 5:
            break;
    }

    if (mode === 0){
        $("#sectionDisplayContainer").append(html);
    }else {
        $("#sectionContainer").append(html);
        setupAddAnnotationPopup();
        if (type === 3) {

            //Configure the Rich Text Editor
            let editorCfg = {}
            editorCfg.toolbar = "basic";
            editorCfg.showFloatParagraph = false;
            editorCfg.skin = "rounded-corner";
            editorCfg.editorResizeMode = "height";
            editorCfg.showSelectedBlock = false;
            editorCfg.showPlusButton = false;
            editorCfg.showTagList = false;
            currentNoteSections[internalSectionId - 1].editor = new RichTextEditor("#editor" + internalSectionId, editorCfg);
            currentNoteSections[internalSectionId - 1].editor.setHTMLCode(value);
        }
    }
}

/**
 * This function returns the html for a new title section
 */
function addTitleSection(mode, value, newSection, internalSectionId){
    let html;

    if(mode === 0){
        html = `<div class="section">
                    <p class="section-display-title">${value}</p>
                </div>`
    }else {
        if (newSection) {
            currentNoteSections.push({type: 1, editor: null, fieldRef: "#newTitle" + internalSectionId, order: internalSectionId});
        }else{
            currentNoteSections[internalSectionId-1].fieldRef = "#newTitle" + internalSectionId;
        }

        html = `<div class="section">
                        <div class="new-title-container">
                            ${getActionHtml()}
                            <label class="label">Section Title</label>
                            <input type="text" class="input" id="newTitle${internalSectionId}" style="width: 500px" value="${value}"/>
                        </div>
                      </div>`;
    }
    return html;
}

/**
 * This function returns the html for a new simple text section
 */
function addSimpleTextSection(mode, value, newSection, internalSectionId){
    let html;

    if(mode === 0){
        html = `<div class="section">
                    <p class="section-display-simpletext">${value}</p>
                </div>`
    }else {
        html = `<div class="section">
                        <div class="new-title-container">
                            ${getActionHtml()}
                            <label class="label">Simple Text</label>
                            <textarea class="input-textarea" id="newSimpleText${internalSectionId}" rows="7">${value}</textarea>
                        </div>
                      </div>`;

        if (newSection) {
            currentNoteSections.push({
                type: 2,
                editor: null,
                fieldRef: "#newSimpleText" + internalSectionId,
                order: internalSectionId
            });
        }else{
            currentNoteSections[internalSectionId-1].fieldRef = "#newSimpleText" + internalSectionId;
        }
    }

    return html;
}

/**
 * This function returns the html for a new text section
 * @returns {*}
 */
function addRichTextSection(mode, value, newSection, internalSectionId){
    let html;

    if (mode === 0){
        html = `<div class="section">
                    ${value}
                </div>`
    }else{
        html= `<div class="section">
                <div class="new-title-container">
                    ${getActionHtml()}
                    <label class="label">Rich Text</label>
                    <div id="editor${internalSectionId}" class="richtexteditor">
                </div>
            </div>`;

        if (newSection) {
            currentNoteSections.push({type: 3, editor: null, fieldRef: null});
        }
    }

    return html;
}

/**
 * This function returns the html for a new video section
 */
function addVideoSection(mode, value, newSection, internalSectionId){
    let html;

    if (value){
        if (mode === 0) {
            html = `<div class="section">
                        <div class="video-player-container">
                            <video class="video-player" controls>
                                <source src="/trainingNotes/getVideo/${value}" type="video/mp4">
                            </video>
                        </div>
                    </div>`
        }else{
            html = `<div class="section">
                        <div class="new-title-container">
                            ${getActionHtml()}
                            <label class="label">Video</label>         
                            <video class="video-player" controls style="margin-left: 95px" id="video${internalSectionId}">
                                <source src="/trainingNotes/getVideo/${value}" type="video/mp4">
                            </video>
                            <div class="annotation-container">
                                <button class="default purple addAnnotation" data-internalId="${internalSectionId}"><i class="ri-map-pin-add-line ri-lg"></i>Add Annotation</button>
                                <div class="annoation-list" id="annotationList${internalSectionId}">
                                    ${getAnnotationHtml(internalSectionId)}
                                </div>                          
                            </div>
                        </div>
                    </div>`
        }
    }else{
        if(mode === 0) {
            html = `<div class="section">
                        <p class="section-display-simpletext"><i class="ri-file-unknow-line ri-lg" style="color: red; margin-right: 10px"></i>No video found...</p>
                    </div>`
        }else {
            if (newSection) {
                currentNoteSections.push({type: 4, editor: null, fieldRef: null, order: internalSectionId});
            }

            html = `<div class="section">
                        <div class="new-title-container">
                            ${getActionHtml()}
                            <label class="label">Video</label>
                            <button class="default purple" data-internalId="${internalSectionId}" id="uploadBtn-${internalSectionId}" onclick="uploadVideo(${internalSectionId})">Upload Video <i class="ri-upload-2-line"></i></button>
                            <div class="progress-bar-container" style="margin-left: 18px; display: none">
                                <div class="progress-bar-fill"><span class="percentage">0%</span></div>
                            </div>
                        </div>
                      </div>`;
        }
    }

    return html;
}

/**
 * This function returns the html for all existing annotations
 * @param internalSectionId
 */
function getAnnotationHtml(internalSectionId){
    return `<div class="annotation">
                <a href="" class="edit-icon"><i class="ri-close-circle-line ri-xl"></i></a>
                <a href="" class="edit-icon"><i class="ri-play-circle-line ri-xl"></i></a>
                <p>2:37</p>
                <p>Good Play</p>
            </div>`
}

/**
 * This function uploads a video
 */
function uploadVideo(internalSectionId){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4';

    input.onchange = function() {
        const file = this.files[0];
        if(file) {
            const formData = new FormData();
            formData.append('video', file);

            const myUUID = uuidv4();
            currentNoteSections[internalSectionId-1].value = myUUID;

            const progressBarContainer = $(`#uploadBtn-${internalSectionId}`).next('.progress-bar-container');
            const progressBarFill = progressBarContainer.find('.progress-bar-fill');
            const percentageText = progressBarFill.find('.percentage');

            $.ajax({
                url: '/trainingNotes/uploadVideo/' + myUUID,
                type: 'POST',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                xhr: function() {
                    let xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            let percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);
                            progressBarFill.width(percentComplete + '%');
                            percentageText.text(percentComplete + '%');
                            if (percentComplete === 100) {
                                progressBarContainer.hide();
                            }
                        }
                    }, false);
                    return xhr;
                },
                beforeSend: function() {
                    progressBarContainer.show();
                    progressBarFill.width('0%');
                    percentageText.text('0%');
                },
                success: function(data) {
                    displaySuccess(data.message);
                    editNote();
                },
                error: function(data) {
                    if (data.responseJSON && data.responseJSON.redirect) {
                        window.location.href = data.responseJSON.redirect;
                    }
                    console.log("Error uploading the video:", data.responseJSON);
                }
            });
        }
    }

    input.click();
}

/**
 * This function upserts a training note with all its sections
 */
function upsertTrainingNote() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/trainingNotes/upsert',
            type: 'POST',
            data: { note: currentNote, sections: currentNoteSections, annotations: allAnnotations },
            success: function(data) {
                loadExistingNotes().then((result) => {
                    allNotes = result;
                    displaySuccess(data.message);
                    resolve();
                }).fail((error) => {
                    console.error("Error refreshing allNotes data after upsert:", error);
                    reject(error);
                });
            },
            error: function(data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                console.log("Error upserting training notes:", data.responseJSON);
                reject(data); // Reject the promise with the error data
            }
        });
    });
}

/**
 * Returns the html for all buttons in edit mode
 */
function getActionHtml(){
    return `<div class="action-container">
                <a href="" class="edit-icon"><i class="ri-arrow-up-line ri-xl"></i></a>
                <a href="" class="edit-icon"><i class="ri-arrow-down-line ri-xl"></i></a>
                <a href="" class="edit-icon"><i class="ri-close-circle-line ri-xl"></i></a>
            </div>`
}

/**
 * Function to move a section up
 * @param index
 */
function moveSectionUp(index) {
    if (index > 0) {
        const tmp = currentNoteSections[index];
        currentNoteSections[index] = currentNoteSections[index - 1];
        currentNoteSections[index - 1] = tmp;
    }
}

/**
 * Function to move a section down
 * @param index
 */
function moveSectionDown(index) {
    if (index < currentNoteSections.length - 1) {
        const tmp = currentNoteSections[index];
        currentNoteSections[index] = currentNoteSections[index + 1];
        currentNoteSections[index + 1] = tmp;
    }
}

/**
 * Function to delete a section
 * @param index
 */
function deleteSection(index) {
    let section = currentNoteSections[index];
    currentNoteSections.splice(index, 1);

    if (section.id){
        //Delete the section in the database
        $.ajax({
            url: '/trainingNotes/deleteSection',
            type: 'POST',
            data: { sectionId: section.id },
            error: function(data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                console.log("Error deleting section: ", data.responseJSON);
            }
        });
    }

    editNote();
}

/**
 * This function deletes the current note
 */
function deleteNote(){
    $.ajax({
        url: '/trainingNotes/delete',
        type: 'POST',
        data: { noteId: currentNote.id },
        success: function(data) {
            displaySuccess(data.message);
            currentNote = null;
            currentNoteSections = [];
            currentSection = null;

            $("#editNoteContainer").hide();
            $("#editBtnContainer").hide();
            $("#nothingPlaceholder").show();
            buildExistingNodesTable();
        },
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            console.log("Error deleting note: ", data.responseJSON);
        }
    });
}

/**
 * This function creates a new note
 */
function createNewNote(){
    if ($("#editNoteContainer").is(":visible")) {
        displayError("Please save or cancel your changes first!")
        return;
    }

    $("#editNoteContainer").show();
    $("#editBtnContainer").show();
    $("#nothingPlaceholder").hide();
    $("#noteDisplayContainer").hide();
    $("#editNote").hide();

    $("#editTitle").val("");

    currentNote = {};
}