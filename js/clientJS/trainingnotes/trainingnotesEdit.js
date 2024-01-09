let currentNote = null;
let allNoteSections = [];
let allAnnotations = [];
let newNote = false;

/**
 * Initialize the page
 */
async function initPage(team_fk) {
    currentNote = JSON.parse(localStorage.getItem('currentNote'));

    if (currentNote === null) {
        newNote = true;
        currentNote = {id: 0, title: 'New Note', creator: '', created: '', editor: '', lastedited: '', team_fk: team_fk};
    }

    $('#title').text("Edit Note «" + currentNote.title + "»");

    allNoteSections = await getSections(currentNote.id)

    allNoteSections = allNoteSections.map((section, index) => {
        section.internalId = index + 1;
        section.editor = null;
        return section;
    });

    allAnnotations = await fetchAnnotations(allNoteSections);
    allAnnotations.forEach(annotation => {
        let section = allNoteSections.filter(section => section.id === annotation.section_fk);
       annotation.internalId = section[0].internalId;
    });

    $("#sectionDisplayContainer").append(await addMainTitle());

    processSections(allNoteSections);

    setTimeout(function () {
        setupAddAnnotationPopup();
    }, 200);

    setupAddSectionPopup();
    setupDelNotePopup();
    setupDiscardChangesPopup();

    $("#saveNote").off('click').click(function() {
        saveNote();
    });
}

/**
 * Function which saves the note
 */
function saveNote(){
    getAllSectionValues();

    for (let i = 0; i < allNoteSections.length; i++) {
        allNoteSections[i].order = i+1;
    }

    const newTitle = $("#mainTitle").val();

    updateDatabase(newTitle).then((result) => {
        currentNote.id = result.newNoteId
        currentNote.title = newTitle;
        localStorage.setItem('currentNote', JSON.stringify(currentNote));

        loadPage('trainingnotes_display');
    });
}

/**
 * This function sends all data to the server to update the database
 */
function updateDatabase(newTitle){
    return $.ajax({
        url: '/trainingNotes/update',
        type: 'POST',
        data: {title: newTitle, annotations: allAnnotations, sections: allNoteSections, note: currentNote},
        success: function(data) {
            displaySuccess(data.message);
        },
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            console.log("Error updating note:", data.responseJSON);
        }
    });
}

/**
 * This method writes all sections values from their respective fields into the currentNoteSections array
 */
function getAllSectionValues(){
    $.each(allNoteSections, function(index, section) {
        if (section.editor) {
            section.value = section.editor.getHTMLCode();
            section.editor = null;
        }else if(section.type !== 4) {
            let element;
            if(section.type === 1){
                element = $(`#title-${section.internalId}`)
            } else if(section.type === 2){
                element = $(`#text-${section.internalId}`)
            }

            if(element.val !== undefined) {
                section.value = element.val();
            }
        }
    });
}

/**
 * asnyc function which draws all sections in order of the for loop
 * @param sections
 * @returns {Promise<void>}
 */
async function processSections(sections) {
    for (const section of sections) {
        await displaySection(section);
    }
}

/**
 * Function which opens the popup for adding a new section
 */
async function setupAddSectionPopup() {
    const popupAddSection = new Popup("popupContainerAddSection");
    const dropdown = await fetchDropdown('sectionDropdown', 'w-60', '[{"value": 1, "text": "Title"}, {"value": 2, "text": "Simple Text"}, {"value": 3, "text": "Rich Text"}, {"value": 4, "text": "Video"}]', 'Select a Sectiontype')
    popupAddSection.displayInputPopupCustom('/res/others/plus.png', 'Add new Section', 'Add', 'btnAddSection', dropdown)

    $("#addSection").click(function (e) {
        $("#sectionDropdown").val(1);
        popupAddSection.open(e);
    });

    waitForElement('#btnAddSection', function () {
        $("#btnAddSection").click(function () {
            popupAddSection.close()
            addNewSection($("#sectionDropdown").val());
        });
    });
}

/**
 * Adds a new section to the document
 * @param type
 */
function addNewSection(type){
    allNoteSections.push({internalId: allNoteSections.length + 1,order: allNoteSections.length + 1 ,type: parseInt(type), editor: null, value: '', id: (allNoteSections.length+1) * -1, trainingnotes_fk: currentNote.id});
    displaySection(allNoteSections[allNoteSections.length - 1]);
}

/**
 * This function displays a new section
 * @param section the section object
 */
async function displaySection(section) {
    let html;

    switch (section.type) {
        case 1:
            html = await addTitleSection(section);
            break;
        case 2:
            html = await addSimpleTextSection(section);
            break;
        case 3:
            html = await addRichTextSection(section);
            break;
        case 4:
            html = await addVideoSection(section);
            break;
        case 5:
            //LOL STATS TODO
            break;
    }

    $("#sectionDisplayContainer").append(html);

    if (section.type === 3) {
        setupRichTextEditor(section);
    }

    if (section.type === 4 && section.value.length <= 2){
        $(`#addVideo-${section.internalId}`).click(function () {
            uploadVideo(section);
        });
    }
}

/**
 * Adds a video section
 * @param section
 * @param update if true it returns only the inner section of the video
 * @returns {string}
 */
async function addVideoSection(section, update = false) {
    const addAnnoBtn = await fetchButton('button', `addAnnotation-${section.internalId}`, 'Add Annotation', 'w-full', 'ri-add-circle-line','addAnnotation','','Success');

    let innerHtml = '';
    if (section.value.length > 2){
        innerHtml = `<div class="w-full flex flex-col mb-6"> 
                            <video class="w-full max-w-[800px] video-player" controls id="video-${section.internalId}">
                                <source src="/trainingNotes/getVideo/${section.value}" type="video/mp4">
                            </video>
                            <div class="w-full flex flex-col">
                                <p class="font-bold font-montserrat text-almost-white mt-4 mb-2">Annotations</p>
                                <div class="w-full flex flex-col" id="annotationList-${section.internalId}">
                                    ${getAnnotationHtml(section.id, allAnnotations, true, section.internalId)}
                                    <div class="w-52">
                                        ${addAnnoBtn}
                                    </div>
                                </div>
                            </div>
                            </div>`

        if (update){
            return innerHtml;
        }

    }else{
        const addVideoBtn = await fetchButton('button', `addVideo-${section.internalId}`, 'Upload Video', 'w-48', 'ri-upload-line');
        innerHtml = `${addVideoBtn}      
                     <div class="flex items-center bg-grey-level3 text-almost-white font-montserrat w-80 h-6 rounded-sm hidden" id="progressBarContainer-${section.internalId}">
                          <div class="w-32 bg-warning" id="progressBarFill-${section.internalId}"><span class="text-grey-level1 ml-2 font-bold" id="percentageText-${section.internalId}">0%</span></div>
                          </div>
                     </div>`
    }

    return `<div class="bg-grey-level2 flex flex-col sm:flex-row sm:gap-5 mb-4 p-5 section items-center section-main-container">
                            ${getControlHTML('Video', section.id)}
                            <div id="videoContainer-${section.internalId}">
                                ${innerHtml}
                            </div>
                        </div>`
}

/**
 * Function which setups the popup for adding a new video annotation
 */
async function setupAddAnnotationPopup() {
    setupDelAnnotationButton();
    setupDelSectionPopup();
    setupUpDownButtons()

    const popupAddAnnotation = new Popup("popupContainerAddAnnotation");
    const input = await fetchEntryField('text', 'title', 'annotationTitle', 'w-full', '')
    const textarea = await fetchTextarea('annotationText', 'w-full', '')

    let internalId;

    popupAddAnnotation.displayInputPopupCustom('/res/others/plus.png', 'Add new Annotation', 'Add', 'btnAddAnnotation',
        `<label class="font-montserrat text-almost-white text-lg" for="annotationTitle">Title</label>
                    ${input}
                    <label class="font-montserrat text-almost-white text-lg mt-4" for="annotationText">Text</label>
                    ${textarea}`);

    $(".addAnnotation").off('click').click(function (e) {
        internalId = $(this).attr('id').split('-')[1];
        $("#annotationTitle").val("");
        $("#annotationText").val("");

        // Pause the video player
        const videoElement = $(this).closest('.section').find('video.video-player')[0];
        if (videoElement) {
            videoElement.pause();
        }

        popupAddAnnotation.open(e);
    });

    waitForElement('#btnAddAnnotation', function () {
        $("#btnAddAnnotation").off('click').click(function (e) {
            popupAddAnnotation.close()
            addAnnotation(internalId);
        });
    });
}

/**
 * Adds an annotation to the current section
 */
function addAnnotation(internalId) {
    const currentTime = getCurrentTime(internalId);
    const title = $("#annotationTitle").val();
    const text = $("#annotationText").val();

    allAnnotations.push({internalId: internalId, time: currentTime, title: title, text: text, section_fk: allNoteSections[internalId-1].id, id: ((allAnnotations.length+1)*-1)});

    redrawAnnotations(internalId);
}

/**
 * Returns the current time of the video of the current video player
 */
function getCurrentTime(internalId) {
    if (internalId) {
        const videoElement = document.querySelector(`#video-${internalId}`);
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
 * Redraws all annotations of the current section
 */
async function redrawAnnotations(internalId) {
    const addAnnoBtn = await fetchButton('button', `addAnnotation-${internalId}`, 'Add Annotation', 'w-full', 'ri-add-circle-line', 'addAnnotation', '', 'Success');
    $("#annotationList-" + internalId).empty().append(getAnnotationHtml(allNoteSections[internalId - 1].id, allAnnotations, true, internalId) + `<div class="w-52">${addAnnoBtn}</div>`);
    setTimeout(function () {
        setupAddAnnotationPopup();
    }, 200);
}

/**
 * Function which opens the popup for deleting a new section
 */
function setupDelSectionPopup(){
    let sectionToDelete = null;
    let sectionId = 0;

    const popupDelSection = new Popup("popupContainerDelSection");
    popupDelSection.displayYesNoPopup('/res/others/alert.png','Delete Section','Do you really want to delete this section?','Yes','No','btnYesDelSection', 'btnNoDelSection')

    waitForElement('#btnNoDelSection', function () {
        $("#btnNoDelSection").click(function () {
            popupDelSection.close()
        });
    });

    waitForElement('#btnYesDelSection', function () {
        $("#btnYesDelSection").click(function () {
            const index = allNoteSections.findIndex(section => section.id === sectionId);
            if (index !== -1) {
                allNoteSections.splice(index, 1);
            }

            sectionToDelete.remove();

            popupDelSection.close()
        });
    });

    $(document).off('click', '.delete-section').on('click', '.delete-section', function(e) {
        sectionId = $(this).data('sectionid');
        sectionToDelete = $(this).closest('.section-main-container');

        popupDelSection.open(e);
    });
}

/**
 * Setup of the section movement buttons
 */
function setupUpDownButtons(){
    $(document).off('click', '.up-section').on('click', '.up-section', function(e) {
        e.preventDefault();
        const sectionId = $(this).data('sectionid');
        const index = allNoteSections.findIndex(section => section.id === sectionId);
        moveSectionUp(index);

        $('#sectionDisplayContainer').empty();
        processSections(allNoteSections);
    });

    $(document).off('click', '.down-section').on('click', '.down-section', function(e) {
        e.preventDefault();
        const sectionId = $(this).data('sectionid');
        const index = allNoteSections.findIndex(section => section.id === sectionId);
        moveSectionDown(index);

        $('#sectionDisplayContainer').empty();
        processSections(allNoteSections);
    });
}

/**
 * Function to move a section up
 * @param index
 */
function moveSectionUp(index) {
    if (index > 0) {
        const tmp = allNoteSections[index];
        allNoteSections[index] = allNoteSections[index - 1];
        allNoteSections[index - 1] = tmp;
    }
}

/**
 * Function to move a section down
 * @param index
 */
function moveSectionDown(index) {
    if (index < allNoteSections.length - 1) {
        const tmp = allNoteSections[index];
        allNoteSections[index] = allNoteSections[index + 1];
        allNoteSections[index + 1] = tmp;
    }
}

/**
 * This function setups the action buttons for the sections
 */
function setupActionButtons() {
    $(document).off('click', '.section-action').on('click', '.section-action', function(e) {
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
 * Setups the delete annotation events for the delete buttons of a video
 */
function setupDelAnnotationButton() {
    $(document).on('click', '.deleteAnnotation', function(event) {
        event.preventDefault();
        const internalId = $(this).data('internalid');
        const annotationId = $(this).data('annotationid');
        const index = allAnnotations.findIndex(annotation => annotation.id === annotationId);
        if (index !== -1) {
            allAnnotations.splice(index, 1);
        }

        redrawAnnotations(internalId);
    });
}

/**
 * Displays the video after it got uploaded
 * @param section
 */
function refreshVideoSection(section){
    addVideoSection(section, true).then(function (html) {
        $(`#videoContainer-${section.internalId}`).html(html);
        setTimeout(function () {
            setupAddAnnotationPopup();
        }, 200);
    });
}

/**
 * This function uploads a video
 */
function uploadVideo(section){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4';

    input.onchange = function() {
        const file = this.files[0];
        if(file) {
            const formData = new FormData();
            formData.append('video', file);

            const myUUID = uuidv4();
            allNoteSections[section.internalId-1].value = myUUID;

            const progressBarContainer = $(`#progressBarContainer-${section.internalId}`);
            const progressBarFill = $(`#progressBarFill-${section.internalId}`)
            const percentageText = $(`#percentageText-${section.internalId}`);

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

                    progressBarContainer.removeClass('hidden');
                    progressBarFill.width('0%');
                    percentageText.text('0%');
                },
                success: function(data) {
                    displaySuccess(data.message);
                    refreshVideoSection(section)
                },
                error: function(data) {
                    if (data.responseJSON && data.responseJSON.redirect) {
                        window.location.href = data.responseJSON.redirect;
                    }
                    if (data.status === 413) {
                        displayError(data.responseJSON.message)
                    }else {
                        console.log("Error uploading the video:", data.responseJSON);
                    }
                }
            });
        }
    }

    input.click();
}

/**
 * Function which setups the popup for deleting a note
 */
function setupDelNotePopup(){
    const popupDelNote = new Popup("popupContainerDelNote");
    popupDelNote.displayYesNoPopup('/res/others/alert.png','Delete Note','Do you really want to delete this note?','Yes','No','btnYesDelNote', 'btnNoDelNote')

    $("#delNote").click(function (e) {
        popupDelNote.open(e);
    });

    waitForElement('#btnNoDelNote', function () {
        $("#btnNoDelNote").click(function () {
            popupDelNote.close()
        });
    });

    waitForElement('#btnYesDelNote', function () {
        $("#btnYesDelNote").click(function () {
            deleteNote();
            popupDelNote.close()
        });
    });
}

/**
 * Function which setups the popup for closing a note
 */
function setupDiscardChangesPopup(){
    const popupDiscardChanges = new Popup("popupContainerDiscardChanges");
    popupDiscardChanges.displayYesNoPopup('/res/others/alert.png','Discard Changes','Do you really want to close this note and discard all changes?','Yes','No','btnYesDiscardChanges', 'btnNoDiscardChanges')

    $("#closeNote").click(function (e) {
        popupDiscardChanges.open(e);
    });

    waitForElement('#btnNoDiscardChanges', function () {
        $("#btnNoDiscardChanges").click(function () {
            popupDiscardChanges.close()
        });
    });

    waitForElement('#btnYesDiscardChanges', function () {
        $("#btnYesDiscardChanges").click(function () {
            loadPage('trainingnotes')
            popupDiscardChanges.close()
        });
    });
}

/**
 * This function deletes the current note
 */
function deleteNote(){
    if (currentNote && currentNote.id > 0) {
        $.ajax({
            url: '/trainingNotes/delete',
            type: 'POST',
            data: {noteId: currentNote.id},
            success: function (data) {
                displaySuccess(data.message);
                currentNote = null;
                allNoteSections = [];
                allAnnotations = [];
                loadPage('trainingnotes')
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                console.log("Error deleting note: ", data.responseJSON);
            }
        });
    }else{
        loadPage('trainingnotes')
    }
}

/**
 * This function adds a simple text section
 * @param section
 * @returns {string}
 */
async function addSimpleTextSection(section) {
    const field = await fetchTextarea(`text-${section.internalId}`, 'w-full', `${section.value}`)
    return `<div class="bg-grey-level2 flex flex-col sm:flex-row sm:gap-5 mb-4 p-5 section-main-container">
                    ${getControlHTML('Section Title', section.id)}
                    ${field}
                </div>`;
}

/**
 * This function adds a title section
 * @param section
 * @returns {string}
 */
async function addTitleSection(section) {
    const field = await fetchEntryField('text', 'title', `title-${section.internalId}`, 'w-full', `${section.value}`)
    return `<div class="bg-grey-level2 flex flex-col sm:flex-row sm:gap-5 mb-4 p-5 section-main-container">
                    ${getControlHTML('Section Title', section.id)}
                    ${field}
                </div>`;
}

/**
 * Adds a Rich Text Section
 * @param section
 */
function addRichTextSection(section){
    return `<div class="section section-main-container">
                <div class="bg-grey-level2 flex flex-col sm:flex-row sm:gap-5 mb-4 p-5">
                    ${getControlHTML('Rich Text', section.id)}
                    <div id="editor-${section.internalId}" class="richtexteditor w-full">
                </div>
            </div>`;
}

/**
 * Displays the main title of the note
 * @returns {Promise<string>}
 */
async function addMainTitle() {
    const field = await fetchEntryField('text', 'title', `mainTitle`, 'w-full', `${currentNote.title}`)
    return `<div class="bg-grey-level2 flex flex-col sm:flex-row sm:gap-5 mb-4 p-5">
                    <p class="font-montserrat font-bold text-almost-white text-lg w-12 mb-4 sm:mb-0">Title</p>
                    ${field}
                </div>`;
}

/**
 * Returns the html for the control and the title of a section
 * @param title
 * @param sectionId
 * @returns {string}
 */
function getControlHTML(title, sectionId){
    return `<div class="flex flex-row gap-3 mb-4 sm:mb-0">
                 <a href="#" class="text-almost-white hover:text-turquoise up-section" data-sectionid="${sectionId}"><i class="ri-arrow-up-line ri-lg"></i></a>
                 <a href="#" class="text-almost-white hover:text-turquoise down-section" data-sectionid="${sectionId}"><i class="ri-arrow-down-line ri-lg"></i></a>
                 <a href="#" class="text-almost-white hover:text-error delete-section" data-sectionid="${sectionId}"><i class="ri-close-circle-line ri-lg"></i></a>
                 <p class="font-montserrat font-bold text-almost-white text-lg w-32">${title}</p>
            </div>`
}

/**
 * Init of a rich text editor
 * @param section
 */
function setupRichTextEditor(section){
    let editorCfg = {}
    editorCfg.toolbar = "basic";
    editorCfg.showFloatParagraph = false;
    editorCfg.skin = "rounded-corner";
    editorCfg.editorResizeMode = "height";
    editorCfg.showSelectedBlock = false;
    editorCfg.showPlusButton = false;
    editorCfg.showTagList = false;
    allNoteSections[section.internalId - 1].editor = new RichTextEditor("#editor-" + section.internalId, editorCfg);
    if (section.value) {
        allNoteSections[section.internalId - 1].editor.setHTMLCode(section.value);
    }else {
        allNoteSections[section.internalId - 1].editor.setHTMLCode(' ');
    }
}