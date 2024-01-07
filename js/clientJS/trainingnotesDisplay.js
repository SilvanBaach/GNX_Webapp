let currentNote = null;
let allNoteSections = [];
let allAnnotations = [];

/**
 * Initializes the page
 */
async function initPage() {
    currentNote = JSON.parse(localStorage.getItem('currentNote'));
    $('#title').text("View Note «" + currentNote.title + "»");
    $('#noteCreator').text(currentNote.creator);
    $('#noteDate').text(currentNote.created);

    $('#closeNote').click(function() {
       loadPage('trainingnotes');
    });

    allNoteSections = await getSections(currentNote.id);
    allAnnotations = await fetchAnnotations(allNoteSections);

    allNoteSections.forEach(function(section) {
        console.log(section);
       displaySection(section);
    });
}

/**
 * This function displays a new section
 * @param section the section object
 */
function displaySection(section) {
    let html;

    switch (section.type) {
        case 1:
            html = addTitleSection(section.value);
            break;
        case 2:
            html = addSimpleTextSection(section.value);
            break;
        case 3:
            html = addRichTextSection(section.value);
            break;
        case 4:
            html = addVideoSection(section.value, section.id);
            break;
        case 5:
            //LOL STATS TODO
            break;
    }

    $("#sectionDisplayContainer").append(html);
    setupPlayButton();
}

/**
 * This function adds a title section
 * @param value
 */
function addTitleSection(value){
    return `<h4 class="font-montserrat text-almost-white font-bold text-xl mb-2">${value}</h4>`;
}

/**
 * This function adds a simple text section
 * @param value
 */
function addSimpleTextSection(value){
    return `<p class="font-montserrat text-almost-white text-base mb-6">${value}</p>`;
}

/**
 * This function adds a rich text section
 * @param value
 * @returns {string}
 */
function addRichTextSection(value){
    return `<div class="font-montserrat mb-6">${value}</div>`;
}

/**
 * This function adds a video section
 */
function addVideoSection(value, sectionId){
    return `<div class="section">
                        <div class="w-full flex flex-col mb-6 2xl:flex-row">
                            <video class="w-full max-w-[800px] video-player" controls>
                                <source src="/trainingNotes/getVideo/${value}" type="video/mp4">
                            </video>
                            <div class="w-full flex flex-col 2xl:ml-4">
                                <p class="font-bold font-montserrat text-almost-white mt-4 2xl:mt-0 mb-2">Annotations</p>
                                <div class="w-full flex flex-col">
                                    ${getAnnotationHtml(sectionId)}
                                </div>
                            </div>
                        </div>
                    </div>`;
}

/**
 * This function returns the html for all existing annotations
 * @param sectionId
 */
function getAnnotationHtml(sectionId){
    let html = '';
    allAnnotations.forEach(function (annotation) {
        if (annotation.section_fk === sectionId){
            html += `<div class="bg-grey-level2 flex flex-col p-3 mb-3 w-full max-w-[500px]">
                        <div class="flex flex-row">
                            <a href="" class="text-almost-white play hover:text-turquoise" id="playButton" data-time="${annotation.time}"><i class="ri-play-circle-line ri-xl"></i></a>
                            <p class="italic ml-4">${annotation.time}</p>
                            <p class="font-bold ml-4">${annotation.title}</p>
                        </div>
                        <p class="font-montserrat text-almost-white ml-10 mt-3">${annotation.text}</p>
                    </div>`
        }
    });

    if (html === ''){
        html = '<p style="color: #5C5C5C">NO ANNOTATIONS FOUND</p>'
    }

    return html;
}

/**
 * Setups the play events for the play buttons of a video
 */
function setupPlayButton(){
    $(document).off('click').on('click', '.play', function(event) {
        event.preventDefault();
        const time = $(this).data('time');
        const timeArray = time.split(":");
        const seconds = (+timeArray[0]) * 60 * 60 + (+timeArray[1]) * 60 + (+timeArray[2]);
        const videoElement = $(this).closest('.section').find('video.video-player')[0];

        if (videoElement) {
            videoElement.currentTime = seconds;
            videoElement.play();
        }
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
 * This function returns all annotations for all sections of a training note
 * @param sections
 * @returns {Promise<void>}
 */
async function fetchAnnotations(sections) {
    let allAnnotations = [];

    const annotationPromises = sections.map(async function (section) {
        const data = await $.ajax({
            url: '/trainingNotes/getAnnotations',
            type: 'GET',
            data: {sectionId: section.id},
            dataType: 'json'
        }).fail(data => {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            console.log("Error getting annotations:", data.responseJSON);
        });

        if (data) {
            allAnnotations = allAnnotations.concat(data);
        }
    });

    await Promise.all(annotationPromises);
    return allAnnotations;
}

