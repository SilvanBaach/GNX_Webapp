const path = require('path');
const fs = require('fs');
const fileshareRoot = process.env.FILESHARE_ROOT_DIR;
const rootDir = path.resolve(path.dirname(path.dirname(__dirname)));


/**
 * Returns a list of files and directories in the given subPath
 * @param subPath sub path of the filestorage folder
 * @returns {Promise<unknown>}
 */
function returnFileList(subPath) {
    return new Promise((resolve, reject) => {
        const filePath = rootDir + fileshareRoot + '/' + subPath;

        //Read all Files from the given directory
        fs.readdir(filePath, (err, files) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                let fileInfos = [];
                let processedFiles = 0;
                if (files.length === 0) {
                    resolve(fileInfos);
                }else {
                    for (let i = 0; i < files.length; i++) {
                        let file = files[i];

                        //For each file load the file stats
                        fs.stat(path.join(filePath, file), (error, stats) => {
                            if (error) {
                                console.log(error);
                                reject(error);
                            } else {
                                //Date formatting
                                let date = new Date(stats.mtime);
                                let formattedDate = date.getDate().toString().padStart(2, '0') + '.' + (date.getMonth() + 1).toString().padStart(2, '0') + '.' + date.getFullYear().toString() + ' ' + date.toLocaleTimeString('en-GB', {hour12: false}).slice(0, -3);

                                let extension = (/[.]/.exec(file)) ? /[^.]+$/.exec(file) : undefined;

                                //Add the file metadata to an array
                                fileInfos.push({
                                    name: file,
                                    type: stats.isDirectory() ? 'directory' : 'file',
                                    size: humanFileSize(stats.size),
                                    lastModified: formattedDate,
                                    extension: extension,
                                    iconPath: returnIconFilePath(extension)
                                });
                                processedFiles++;
                                if (processedFiles === files.length) {
                                    fileInfos.sort((a, b) => a.name.localeCompare(b.name));
                                    resolve(fileInfos);
                                }
                            }
                        });
                    }
                }
            }
        });
    });
}

/**
 * Formats a file size in bytes to a human-readable format
 * @param size
 * @returns {string}
 */
function humanFileSize(size) {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

/**
 * Returns the path to the icon file for the given file extension
 * @param extension
 * @returns {string}
 */
function returnIconFilePath(extension){
    let ext;
    if (typeof extension != 'undefined'){
        ext = Object.values(extension)[0];
        ext = ext.toLowerCase();
    }else{
        ext = "file";
    }

    let path = '/res/fileIcons/' + ext + '.png';
    return path;
}

/**
 * Creates a folder with the given name
 * @param path path to the folder based on the filestorage folder
 * @returns {Promise<unknown>}
 */
function createFolder(path) {
    return new Promise((resolve, reject) => {
        const filePath = rootDir + fileshareRoot + '/' + path;
        fs.mkdir(filePath, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(`${filePath} folder created successfully`);
            }
        });
    });
}

/**
 * Deletes a file or a folder
 * @param subPath path to the file or folder based on the file storage folder
 * @returns {Promise<unknown>} returns a promise with the result of the deletion
 */
async function deleteFileOrFolder(subPath){
    return new Promise((resolve, reject) => {
        const filePath = rootDir + fileshareRoot + '/' + subPath;
        fs.stat(filePath, (err, stats) => {
            if (err) {
                return reject(err);
            }

            if (stats.isFile()) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(`Successfully deleted the file: ${filePath}`);
                });
            } else if (stats.isDirectory()) {
                fs.rm(filePath, { recursive: true }, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(`Successfully deleted the folder: ${filePath}`);
                });
            } else {
                reject(`Unknown type: ${filePath}`);
            }
        });
    });
};

/**
 * Renames a file.
 * @param {string} filePath - The current file path.
 * @param {string} newName - The new file name.
 * @returns {Promise<string>} - A promise that resolves to a success message.
 */
function renameFile(filePath, newName) {
    const fullFilePath = path.join(rootDir, fileshareRoot, filePath.replaceAll('$SLASH$', '/'));
    let isFolder = false;

    fs.stat(fullFilePath, (err, stats) => {
        if (stats.isDirectory()) {
            isFolder = true;
        }
    });

    if(!isFolder) {
        return new Promise((resolve, reject) => {
            const fileExtension = path.extname(fullFilePath);
            const newFilePath = path.join(path.dirname(fullFilePath), newName);

            if (!path.extname(newFilePath) && fileExtension) {
                // Append the previous file extension to the new file name
                const newFileNameWithExtension = `${newFilePath}${fileExtension}`;
                fs.rename(fullFilePath, newFileNameWithExtension, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(`File renamed successfully to: ${newFileNameWithExtension}`);
                    }
                });
            } else {
                fs.rename(fullFilePath, newFilePath, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(`File renamed successfully to: ${newFilePath}`);
                    }
                });
            }
        });
    } else {
        //Rename the folder
        return new Promise((resolve, reject) => {
            fs.rename(fullFilePath, path.join(path.dirname(fullFilePath), newName), (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(`Folder renamed successfully to: ${path.join(path.dirname(fullFilePath), newName)}`);
                }
            });
        });
    }
}

module.exports = {returnFileList, deleteFileOrFolder, createFolder, renameFile};