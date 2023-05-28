let subDir = '';
let toDelPath = '';

/**
 * This function removes all the content from the file share
 */
function removeFileShareContent(){
    //Removes all the file elements from the fileshare-container
    $("#fileshare-container").empty();
}

/**
 * This function resets the path bar to the root
 */
function resetPathBar(){
    $("#path-text-container").empty()
        .append("<i class='ri-arrow-right-s-line path-separator'></i>")
        .append("<a class='path-text' id='path-link' data-path='root'>File Share</a>")
    subDir = 'root';
}

/**
 * This method fetches all files from the server and appends them to the fileshare-container
 * It always reads the directory from the subDir variable
 */
function getFileListFromServer(){
    const url = '/fileshare/getFileList/' + subDir;
    $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
            const files = data;
            removeFileShareContent();
            $.each(files, function (index, file) {
                appendFileLayout(file)
            });
        },
        error: function(xhr, status, error) {
            console.error('Error: ' + error);
        }
    });
}

/**
 * This method generates a File icon and appends it to the fileshare-container
 * @param file The file object from which all the data is extracted
 */
function appendFileLayout(file) {
    //Defining new DOM Objects
    const fileshareContainer = $('#fileshare-container');
    const fileContainer = $('<div>').addClass('file');
    const deleteContainer = $('<div>').addClass('delete-container');
    const removeLink = $('<a>').addClass('remove').attr('id', 'delete-file');
    const closeIcon = $('<i>').addClass('ri-close-line').addClass('ri-xl');
    const rename = $('<a>').addClass('rename').attr('id', 'rename-file');
    const renameIcon = $('<i>').addClass('ri-edit-fill').addClass('ri-lg');
    const fileImage = $('<img>').addClass('file-image');

    //Append those DOM Objects to the correct parent
    removeLink.append(closeIcon);
    deleteContainer.append(removeLink);

    rename.append(renameIcon);
    deleteContainer.append(rename);

    fileContainer.append(deleteContainer);
    fileshareContainer.append(fileContainer);

    if (file.type === 'directory'){
        fileImage.attr('src', '/res/fileIcons/folder.png');
    }else {
        fileImage.attr('src', file.iconPath);
    }

    fileContainer.append(fileImage);

    const fileNameElement = $('<p>').addClass('file-name').text(file.name);

    const fileLink = $('<a>');

    if (file.type === 'directory'){
        fileLink.attr('id', 'directory-link');
        removeLink.attr('data-path', `${subDir}$SLASH$${file.name}`);
        rename.attr('data-path', `${subDir}$SLASH$${file.name}`);
    }else {
        fileLink.attr('href', `/download/${subDir}$SLASH$${file.name}`);
        removeLink.attr('data-path', `${subDir}$SLASH$${file.name}`);
        rename.attr('data-path', `${subDir}$SLASH$${file.name}`);
    }

    fileLink.append(fileNameElement);

    fileContainer.append(fileLink);

    if (file.type !== 'directory') {
        const fileInfoElement = $('<p>').addClass('file-info').text(`${file.size} | ${file.lastModified}`);
        fileContainer.append(fileInfoElement);
    }
}

/**
 * This function appends the subDir path
 * It updates the path bar and the upload action form as well
 * @param dirName The path snippet to be appended (e.g. a folder name)
 */
function extendSubDir(dirName){
    subDir += '$SLASH$' + dirName;

    $("#path-text-container").append("<i class='ri-arrow-right-s-line path-separator'></i>")
            .append("<a class='path-text' id='path-link' data-path='"+ subDir +"'>" + dirName + "</a>")

    updateUploadRoute();
}

/**
 * Updates the route of the upload form based on the current subDir
 */
function updateUploadRoute(){
    $("#upload-form").attr("action", "/fileshare/uploadFiles/" + subDir);
}

/**
 * This function loads a folder at a given path
 * It does not matter what the subDir variable is
 * @param path
 */
function loadFolder(path){
    subDir = path;
    $("a[data-path='" + path + "']").nextAll().remove();
    removeFileShareContent();
    getFileListFromServer(subDir);
}

/**
 * This function deletes a file or folder from the server
 * @param filePath The path of the file or folder to be deleted
 */
function deleteFileOrFolder(filePath) {
    $.ajax({
        type: "POST",
        url: "/fileshare/deleteFile/" + filePath,
        data: '',
        success: function () {
            loadFolder(subDir);
            displaySuccess('File or Folder deleted successfully!')
        },
        error: function (error) {
            console.error(error);
            displayError('Error while deleting file or folder!')
        }
    });
}

/**
 * Sets to delete path
 * @param path The path to the file which should be deleted
 */
function setDelPath(path){
    toDelPath = path;
}

/**
 * Setup for the deletion popup
 * @returns {Popup} an instance of the Popup
 */
function deletePopupSetup(){
    const delPopup = new Popup('popup-container-delete')
    delPopup.displayYesNoPopup('/res/others/alert.png','Delete File','Are you sure you want to delete this File?','Yes','No','yesDelFile','noDelFile');

    $("#noDelFile").click(function(){
        delPopup.close();
    });

    $("#yesDelFile").click(function(){
        deleteFileOrFolder(toDelPath)
        toDelPath = 'NOTHING';
        delPopup.close();
    });

    return delPopup;
}

/**
 * This is the setup function for the new folder popup
 * @returns {Popup} an instance of the Popup
 */
function newFolderPopupSetup(){
    const newFolderPopup = new Popup('popup-container-new-folder')
    newFolderPopup.displayInputPopup("/res/others/plus.png","Create new Folder","Create","createNewFolder","newFolderName");

    $("#createNewFolder").click(function(){
        const folderPath = subDir + "$SLASH$" + $("#newFolderName").val();
        $.ajax({
            type: "POST",
            url: "/fileshare/createFolder/" + folderPath,
            data: '',
            success: function() {
                loadFolder(subDir);
                displaySuccess('Folder created successfully!')
            },
            error: function(error) {
                console.error(error);
                displayError('Error while creating folder!')
            }
        });
        newFolderPopup.close();
    });

    return newFolderPopup;
}

/**
 * Uploads the files to the server
 * @param formData The form data containing the files
 */
function uploadFiles(formData){
    $.ajax({
        url: "/fileshare/uploadFiles/" + subDir,
        type: "POST",
        data:  formData,
        contentType: false,
        cache: false,
        processData:false,
        success: function(data) {
            if (data.status === 'success') {
                removeFileShareContent();
                getFileListFromServer();
            } else {
                displayError(data);
            }
        },
        error: function() {
            displayError('Something went wrong! Maybe the file already exists on the server?');
        }
    });
}

/**
 * This function sets up the "rename" popup
 * @returns {Popup}
 */
function renamePopupSetup(){
    const newRenamePopup = new Popup('popup-container-rename');
    newRenamePopup.displayInputPopup("/res/others/question_black.png","Rename File","Rename","renameFile","newFileName");

    $("#renameFile").click(function(){
        const newName = $("#newFileName").val();
        renameFile(toDelPath, newName);
        newRenamePopup.close();
    });

    return newRenamePopup;
}

/**
 * Renames a file
 * @param filePath The path of the file to be renamed
 * @param newName The new name of the file
 */
function renameFile(filePath, newName){
    $.ajax({
        url: "/fileshare/renameFile",
        type: "POST",
        data:  JSON.stringify({filePath: filePath, newFileName: newName}),
        contentType: "application/json",
        cache: false,
        processData:false,
        success: function(data) {
            if (data.status === 'success') {
                removeFileShareContent();
                getFileListFromServer();
                displaySuccess(data.message);
            } else {
                displayError(data);
            }
        },
        error: function() {
            displayError('Something went wrong!');
        }
    });
}
