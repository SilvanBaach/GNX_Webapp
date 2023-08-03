/**
 * Router for all fileshare related routes
 */
const express = require('express');
const router = express.Router();
const fileshare = require('../js/serverJS/fileshareServer.js');
const multer = require('multer');
const path = require("path");
const fileshareRoot = process.env.FILESHARE_ROOT_DIR;
const rootDir = path.resolve(path.dirname(__dirname));
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');

//TODO: Add permission checking to all routes

/**
 * Multer configuration
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let filePath = req.params.subDir;
        filePath = filePath.replaceAll("$SLASH$", "/");
        cb(null, rootDir + fileshareRoot + '/' + filePath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const fileFilter = async (req, file, cb) => {
    try {
        const filePath = req.params.subDir.replaceAll("$SLASH$", "/");
        const fileInfo = await fileshare.returnFileList(filePath);
        const existingFiles = fileInfo.map(file => file.name);
        const fileName = file.originalname;

        if (existingFiles.includes(fileName)) {
            // File already exists
            const error = new Error('At least one file already exists!');
            error.statusCode = 500;
            cb(error, false);
        } else {
            // File doesn't exist, allow upload
            cb(null, true);
        }
    } catch (error) {
        // Error checking file existence
        cb(error, false);
    }
};

const upload = multer({storage: storage, fileFilter: fileFilter})

/**
 * GET all files from a directory
 */
router.get('/getFileList/:subPath', async (req, res) => {
    let subPath = req.params.subPath;
    subPath = subPath.replaceAll("$SLASH$", "/");

    let fileInfo = await fileshare.returnFileList(subPath);
    res.send(fileInfo);
});

/**
 * POST route to delete a file or a folder
 */
router.post('/deleteFile/:subPath', (req, res) => {
    let subPath = req.params.subPath;
    subPath = subPath.replaceAll("$SLASH$", "/");

    fileshare.deleteFileOrFolder(subPath).then((result) => {
        logMessage(`User ${req.user.username} deleted file ${subPath}`, LogLevel.INFO, req.user.id)
        res.status(200).send({message: result});
    }).catch((err) => {
        res.status(500).send(err);
    });
});

/**
 * POST route to create a new folder
 */
router.post('/createFolder/:subPath',  (req, res) => {
    let subPath = req.params.subPath;
    subPath = subPath.replaceAll("$SLASH$", "/");

    fileshare.createFolder(subPath).then((result) => {
        logMessage(`User ${req.user.username} created folder ${subPath}`, LogLevel.INFO, req.user.id)
        res.status(200).send({message: result});
    }).catch((err) => {
        res.status(500).send(err);
    });
});

/**
 * POST route for uploading files
 */
router.post('/uploadFiles/:subDir', upload.array('file', 10), (req, res, next) => {
    const files = req.files

    if (!files) {
        const error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }

    const fileNames = files.map(file => file.originalname).join(', ');

    logMessage(`User ${req.user.username} uploaded ${files.length} files (${fileNames}) to ${req.params.subDir}`, LogLevel.INFO, req.user.id)
    res.status(200).send({message: "Files uploaded successfully", status: "success"});
});

/**
 * POST route for renaming files
 */
router.post('/renameFile', (req, res, next) => {
    const filepath = req.body.filePath;
    const newFileName = req.body.newFileName;

    fileshare.renameFile(filepath, newFileName).then((result) => {
        logMessage(`User ${req.user.username} renamed file ${filepath} to ${newFileName}`, LogLevel.INFO, req.user.id)
        res.status(200).send({message: 'File renamed successfully!', status: "success"});
    }).catch((err) => {
        res.status(500).send(err);
    });
});

/**
 * GET route for downloading files
 */
router.get('/download/:fileName', (req, res) => {
    let fileName = req.params.fileName;
    fileName = fileName.replaceAll("$SLASH$", "/");
    const filePath = path.join(rootDir + fileshareRoot + '/' + fileName);

    res.download(filePath, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send({error: 'An error occurred while downloading the file'});
        }
        logMessage(`User ${req.user.username} downloaded file ${fileName}`, LogLevel.INFO, req.user.id)
    });
});

module.exports = router;