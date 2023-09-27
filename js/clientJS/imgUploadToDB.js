/**
 * This file contains the functions to upload an image to the database
 * Manly used to upload profile pictures
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; //10 MB

/**
 * Converts a file to a base64 string
 * @param file js file object (from file input for example)
 * @returns {Promise<unknown>} a Promise that resolves to the base64 string
 */
function convertBase64(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
    });
}

/**
 * Updates the profile picture of a user
 * Only files with a size smaller than 10 MB are allowed
 * @param event the event change from the file input
 * @param userId the id of the user
 * @returns {Promise<unknown>} Promise that resolves is the profile picture was updated successfully
 */
async function updateProfilePicture(event, userId) {
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    const url = "/user/updatePicture/" + userId;

    if (file.size > MAX_FILE_SIZE) {
        return Promise.reject("Please upload a file smaller than 10 MB!");
    }

    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            url: url,
            dataType: "json",
            data: {data: base64},
            success: function (result) {
                resolve({picture: result.picture.data, message: result.message});
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                reject(data.responseText);
            }
        });
    });
};

/**
 * Registers a profile picture for a user while he is registering
 * @param event
 * @returns {Promise<never>|Promise<unknown>}
 */
async function registerProfilePicture(event) {
    const file = event.target.files[0];
    const base64 = await convertBase64(file);

    if (file.size > MAX_FILE_SIZE) {
        return Promise.reject("Please upload a file smaller than 10 MB!");
    }

    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            url: 'register/registerPicture',
            dataType: "json",
            data: {data: base64},
            success: function () {
                resolve();
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                reject(data.responseText);
            }
        });
    });
}
