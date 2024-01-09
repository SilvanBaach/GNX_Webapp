/**
 * This file servers as a general file for the training notes
 * It contains functions that are used by multiple files
 */

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

/**
 * This function returns the html for all existing annotations
 * @param sectionId
 * @param annotations
 * @param editMode
 */
function getAnnotationHtml(sectionId, annotations, editMode = false, internalId){
    let html = '';
    let bgColor = editMode ? 'bg-grey-level3' : 'bg-grey-level2';

    let innerHtml = '';
    let spacing = 'ml-10'
    if (editMode){
        innerHtml = `<a href="" class="text-almost-white deleteAnnotation hover:text-error ml-2" [ANNOID] [internalId]><i class="ri-close-circle-line ri-xl"></i></a>`
        spacing = 'ml-[70px]'
    }

    annotations.forEach(function (annotation) {
        if (annotation.section_fk === sectionId){
            html += `<div class="${bgColor} flex flex-col p-3 mb-3 w-full max-w-[500px]">
                        <div class="flex flex-row">
                            <a href="" class="text-almost-white play hover:text-turquoise" id="playButton" data-time="${annotation.time}"><i class="ri-play-circle-line ri-xl"></i></a>
                            ${innerHtml}
                            <p class="italic ml-4">${annotation.time}</p>
                            <p class="font-bold ml-4">${annotation.title}</p>
                        </div>
                        <p class="font-montserrat text-almost-white ${spacing} mt-3">${annotation.text}</p>
                    </div>`
        }

        html = html.replace('[ANNOID]', 'data-annotationid="' + annotation.id + '"');
        html = html.replace('[internalId]', 'data-internalid="' + internalId + '"');
    });

    if (html === ''){
        html = '<p style="color: #5C5C5C" class="mb-4">NO ANNOTATIONS FOUND</p>'
    }

    return html;
}