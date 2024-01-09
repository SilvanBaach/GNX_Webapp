/**
 * Router for manipulating training notes
 */
const express = require('express');
const router = express.Router();
const {pool} = require('../js/serverJS/database/dbConfig.js');
const {checkNotAuthenticated, permissionCheck} = require("../js/serverJS/sessionChecker");
const {logMessage, LogLevel} = require('../js/serverJS/logger.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FILE_SIZE_LIMIT = 250 * 1024 * 1024; // 250MB

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../filestorage/trainingnotes/', req.params.id);

        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, {recursive: true});
        }

        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: FILE_SIZE_LIMIT} // 5 MB
});


/**
 * GET route for getting all training notes
 */
router.get('/getAll', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    getTrainingNotes(req.user.team.id).then((result) => {
        res.status(200).send(result.rows);
    }).catch((err) => {
        console.log("Error: " + err);
        res.status(500).send({message: "There was an error getting the training notes! Please try again later."});
    });
});

/**
 * GET route for the sections of a training note
 */
router.get('/getSections', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    getSections(req.query.noteId).then((result) => {
        res.status(200).send(result.rows);
    }).catch((err) => {
        console.log("Error: " + err);
        res.status(500).send({message: "There was an error getting the Sections! Please try again later."});
    });
});

/**
 * GET route for the annotations of a section
 */
router.get('/getAnnotations', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    getAnnotations(req.query.sectionId).then((result) => {
        res.status(200).send(result.rows);
    }).catch((err) => {
        console.log("Error: " + err);
        res.status(500).send({message: "There was an error getting the Annotations! Please try again later."});
    });
});

/**
 * GET route for fetching a video based on UUID
 * It checks the header fields for the range and returns the video in chunks
 */
router.get('/getVideo/:uuid', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    const uuid = req.params.uuid;
    const folderPath = path.join(__dirname, '../filestorage/trainingnotes/', uuid);

    fs.readdir(folderPath, (err, files) => {
        if (err || files.length === 0) {
            console.error(`Error reading folder or folder is empty with UUID ${uuid}: ${err}`);
            res.status(500).send("Error fetching video");
            return;
        }

        const videoPath = path.join(folderPath, files[0]);

        fs.stat(videoPath, (err, stats) => {
            if (err) {
                console.error(`Error fetching video with UUID ${uuid}: ${err}`);
                res.status(500).send("Error fetching video");
                return;
            }

            if (!stats.size) {
                res.status(500).send("Could not determine video size");
                return;
            }

            const range = req.headers.range;
            if (!range) {
                res.status(400).send("Requires Range header");
                return;
            }

            const positions = range.replace(/bytes=/, "").split("-");

            if (positions.length !== 2) {
                res.status(400).send("Invalid Range header format");
                return;
            }

            const start = positions[0] ? parseInt(positions[0], 10) : 0;
            const end = positions[1] ? parseInt(positions[1], 10) : stats.size - 1;

            if (isNaN(start) || isNaN(end)) {
                res.status(400).send("Invalid Range header values");
                return;
            }

            if (start >= stats.size || end >= stats.size) {
                res.status(416).send("Requested Range Not Satisfiable");
                return;
            }

            const chunkSize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, {start, end});

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${stats.size}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": "video/mp4"
            });

            file.pipe(res);
        });
    });
});

/**
 * POST route for uploading a video
 */
router.post('/uploadVideo/:id', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res, next) {
    upload.single('video')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: `File Size is too large. Allowed file size is ${FILE_SIZE_LIMIT/(1024*1024)} MB` });
            }
            return res.status(500).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: err.message });
        }

        // file successfully uploaded
        if (req.file) {
            res.status(200).send({ message: "Successfully uploaded the video!" });
        } else {
            res.status(400).send({ message: "No file provided!" });
        }
    });
});

/**
 * POST route for deleting a note
 */
router.post('/delete', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    deleteNote(req.body.noteId).then((result) => {
        res.status(200).send({message: "Successfully deleted the note!"});
    }).catch((err) => {
        console.log("Error: " + err);
        res.status(500).send({message: "There was an error deleting the note! Please try again later."});
    });
});

/**
 * POST route for updating a whole training note
 * It deletes all existing data and inserts all data again
 */
router.post('/update', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), async function (req, res) {
    const sections = req.body.sections;
    const annotations = req.body.annotations;
    const note = req.body.note;
    const teamId = req.body.note.team_fk;
    const title = req.body.title;

    if (note.creator_fk == undefined || note.creator_fk.length == 0) {
        note.creator_fk = req.user.id;
    }

    if (note.created_ugly == undefined || note.created_ugly.length == 0) {
        note.created_ugly = new Date();
    }

    if (req.user.team.id != teamId) {
        res.status(403).send({message: "You are not allowed to edit this note!"});
        return;
    }

    try {
        await deleteNote(note.id);
        const insertNoteResult = await insertNote(note, req.user.id, title);
        const newNoteId = insertNoteResult.rows[0].id;

        const sectionPromises = sections.map(async (section) => {
            const insertSectionResult = await insertSection(section, newNoteId);
            const sectionId = insertSectionResult.rows[0].id;

            if (section.type == 4 && annotations != undefined && annotations.length > 0) {
                const annotationPromises = annotations.map(annotation => {
                    if (annotation.internalId === section.internalId) {
                        return insertAnnotation(annotation, sectionId);
                    }
                });
                await Promise.all(annotationPromises);
            }
        });

        await Promise.all(sectionPromises);
        res.status(200).send({message: "Successfully updated the note!", newNoteId: newNoteId});

    } catch (err) {
        console.log("Error: " + err);
        res.status(500).send({message: "There was an error updating the note! Please try again later."});
    }
});

/**
 * Inserts a new Training note
 */
function insertNote(note, editor, title) {
    return pool.query(`INSERT INTO trainingnotes (creator, editor, lastedited, title, created, team_fk) 
                                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [note.creator_fk, editor, new Date(), title, note.created_ugly, note.team_fk]);
}

/**
 * Inserts a new section
 * @param section
 * @param noteId
 */
function insertSection(section, noteId) {
    return pool.query(`INSERT INTO section ("order", type, value, trainingnotes_fk) VALUES ($1, $2, $3, $4) RETURNING id`,[section.order, section.type, section.value, noteId]);
}

/**
 * Inserts a new Annotation
 * @param annotation
 * @param sectionId
 */
function insertAnnotation(annotation, sectionId) {
    return pool.query(`INSERT INTO annotation (time, text, section_fk, title) VALUES ($1, $2, $3, $4)`, [annotation.time, annotation.text, sectionId, annotation.title]);
}

/**
 * This function returns all training notes for a team
 */
function getTrainingNotes(teamId) {
    return pool.query(`SELECT trainingnotes.id,
                              acc1.username                             AS creator,
                              acc2.username                             AS editor,
                              TO_CHAR(created, 'DD.MM.YYYY HH24:MI')    AS created,
                              TO_CHAR(lastedited, 'DD.MM.YYYY HH24:MI') AS lastedited,
                              trainingnotes.creator AS creator_fk, title, team_fk, trainingnotes.created AS created_ugly
                       FROM trainingnotes
                                LEFT JOIN account AS acc1 ON acc1.id = creator
                                LEFT JOIN account AS acc2 ON acc2.id = editor
                       WHERE team_fk = $1
                       ORDER BY lastedited DESC`, [teamId]);
}

/**
 * This function returns all sections for a training note
 */
function getSections(noteId) {
    return pool.query(`SELECT *
                       FROM section
                       WHERE trainingnotes_fk = $1
                       ORDER BY "order" ASC`, [noteId]);
}

/**
 * This function deletes a training note
 * It cascades to the sections
 * @param noteId
 */
function deleteNote(noteId) {
    return pool.query(`DELETE FROM annotation WHERE section_fk IN (SELECT id FROM section WHERE trainingnotes_fk = $1)`, [noteId])
        .then(() => {
            return pool.query(`DELETE FROM section WHERE trainingnotes_fk = $1`, [noteId])
        }).then(() => {
            return pool.query(`DELETE
                               FROM trainingnotes
                               WHERE id = $1`, [noteId]);
        });
}

/**
 * Gets all annotations for a section
 * @param sectionId
 */
function getAnnotations(sectionId){
    return pool.query(`SELECT * FROM annotation WHERE section_fk = $1 ORDER BY TO_TIMESTAMP(time, 'HH24:MI:SS')`, [sectionId]);
}

module.exports = router;