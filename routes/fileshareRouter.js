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

/**
 * Multer configuration
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let filePath = req.params.filePath;
        filePath = filePath.replaceAll("$SLASH$", "/");
        cb(null, rootDir + fileshareRoot + '/' + filePath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage})

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
    res.status(200).send({message: "Files uploaded successfully"});
});

module.exports = router;