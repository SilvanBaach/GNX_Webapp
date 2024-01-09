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

    $('#editNote').click(function() {
        localStorage.setItem('currentNote', JSON.stringify(currentNote));
        loadPage('trainingnotes_edit');
    });

    allNoteSections = await getSections(currentNote.id);
    allAnnotations = await fetchAnnotations(allNoteSections);

    allNoteSections.forEach(function(section) {
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
    return `<div class="w-full flex flex-col mb-6 2xl:flex-row section">
                            <video class="w-full max-w-[800px] video-player" controls>
                                <source src="/trainingNotes/getVideo/${value}" type="video/mp4">
                            </video>
                            <div class="w-full flex flex-col 2xl:ml-4">
                                <p class="font-bold font-montserrat text-almost-white mt-4 2xl:mt-0 mb-2">Annotations</p>
                                <div class="w-full flex flex-col">
                                    ${getAnnotationHtml(sectionId, allAnnotations)}
                                </div>
                            </div>
                        </div>`;
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



