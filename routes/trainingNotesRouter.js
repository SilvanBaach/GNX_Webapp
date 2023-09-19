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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../filestorage/trainingnotes/', req.params.id);
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

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
            const file = fs.createReadStream(videoPath, { start, end });

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
router.post('/uploadVideo/:id', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), upload.single('video'), function (req, res) {
    if (req.file) {
        res.status(200).send({message: "Successfully uploaded the video!"});
    } else {
        res.status(500).send({message: "There was an error uploading the video! Please try again later."});
    }
});

/**
 * POST route for deleting a section
 */
router.post('/deleteSection', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    deleteSection(req.body.sectionId).then((result) => {
        res.status(200).send({message: "Successfully deleted the section!"});
    }).catch((err) => {
        console.log("Error: " + err);
        res.status(500).send({message: "There was an error deleting the Sections! Please try again later."});
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
 * POST route for upserting sections of a Training Note
 */
router.post('/upsert', checkNotAuthenticated, permissionCheck('trainingnotes', 'canOpen'), function (req, res) {
    upsertTrainingNote(req.body.note.title, req.user.id, req.body.note.id, req.user.team.id).then((returnedNoteId) => {
        upsertSections(req.body.sections, returnedNoteId) // Pass the returnedNoteId here
            .then(() => {
                res.status(200).send({message: "Successfully updated the training note!"});
            })
            .catch((err) => {
                console.log("Error: " + err);
                res.status(500).send({message: "There was an error updating the sections of the note! Please try again later."});
            });
    })
        .catch((err) => {
            console.log("Error: " + err);
            res.status(500).send({message: "There was an error upserting the training note! Please try again later."});
        });
});

/**
 * This function returns all training notes for a team
 */
function getTrainingNotes(teamId){
    return pool.query(`SELECT trainingnotes.id, acc1.username AS creator, acc2.username AS editor, TO_CHAR(created, 'DD.MM.YYYY HH24:MI') AS created, 
                                            TO_CHAR(lastedited, 'DD.MM.YYYY HH24:MI') AS lastedited, title FROM trainingnotes
                                        LEFT JOIN account AS acc1 ON acc1.id = creator
                                        LEFT JOIN account AS acc2 ON acc2.id = editor
                                        WHERE team_fk = $1 ORDER BY lastedited DESC`, [teamId]);
}

/**
 * This function upserts all sections for a training note
 */
function upsertSections(sections = [], noteId) {
    if (!sections.length) return Promise.resolve();

    const promises = sections.map((section) => {
        return new Promise((resolve, reject) => {
            if (section.id) {
                // Update section
                pool.query(`UPDATE section SET value = $1, "order" = $3 WHERE id = $2`, [section.value, section.id, section.order], (err, results) => {
                    if (err) {
                        console.log("Error updating section: " + err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                // Insert section
                pool.query(`INSERT INTO section (trainingnotes_fk, type, value, "order") VALUES ($1, $2, $3, $4)`, [noteId, section.type, section.value, section.order], (err, results) => {
                    if (err) {
                        console.log("Error inserting section: " + err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });

    return Promise.all(promises);
}

/**
 * This function returns all sections for a training note
 */
function getSections(noteId){
    return pool.query(`SELECT * FROM section WHERE trainingnotes_fk = $1 ORDER BY "order" ASC`, [noteId]);
}

/**
 * This function deletes a section
 * @param sectionId
 * @returns {Promise<QueryResult<any>>}
 */
function deleteSection(sectionId){
    return pool.query(`DELETE FROM section WHERE id = $1`, [sectionId]);
}

/**
 * This function updates a training note
 * @param title
 * @param editorId
 * @param noteId
 * @param teamId
 * @returns {Promise<QueryResult<any>>}
 */
function upsertTrainingNote(title, editorId, noteId, teamId){
    return new Promise((resolve, reject) => {
        if (noteId > 0) {
            // Update
            pool.query(`UPDATE trainingnotes SET title = $1, editor = $2, lastedited = NOW() WHERE id = $3 RETURNING id`, [title, editorId, noteId], (err, results) => {
                if (err) {
                    console.log("Error updating training note: " + err);
                    reject(err);
                } else {
                    resolve(results.rows[0].id); // Return the noteId
                }
            });
        } else {
            // Insert
            pool.query(`INSERT INTO trainingnotes (title, editor, lastedited, creator, created, team_fk) VALUES ($1, $2, NOW(), $2, NOW(), $3) RETURNING id`, [title, editorId, teamId], (err, results) => {
                if (err) {
                    console.log("Error inserting training note: " + err);
                    reject(err);
                } else {
                    resolve(results.rows[0].id); // Return the newly inserted noteId
                }
            });
        }
    });
}

/**
 * This function deletes a training note
 * It cascades to the sections
 * @param noteId
 */
function deleteNote(noteId){
    return pool.query(`DELETE FROM section WHERE trainingnotes_fk = $1`, [noteId])
        .then(() => {
            return pool.query(`DELETE FROM trainingnotes WHERE id = $1`, [noteId]);
        });
}

module.exports = router;