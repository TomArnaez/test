'use strict'

import {queryDatabase} from "./media";

const sanitise = require('sanitize-filename')
const unique = require('unique-filename')
const express = require('express')
const config = require('./config/config')
const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const multer = require('multer')
const uuid = require('uuid')
const pug = require('pug')

const media = require('./media.js')
const mysql = require('mysql')

async function getMessage(message_name) {
    return JSON.parse(await fsp.readFile("strings/media_impl.json", "utf-8"))[message_name]
}

async function getPugMessage(message_name, locals) {
    return pug.render(await getMessage(message_name), locals)
}

async function addToDatabase(id, filename, deleted, user_id) {
    if (user_id)
        return media.queryDatabase('INSERT INTO files (uuid, filename, deleted, uploader_userid) VALUES (UNHEX(?), ?, ?, ?)', [id.replaceAll('-', ''), filename, deleted, user_id])
    else
        return media.queryDatabase('INSERT INTO files (uuid, filename, deleted) VALUES (UNHEX(?), ?, ?)', [id.replaceAll('-', ''), filename, deleted])
}

async function addNewFileToDatabase(filename, user_id) {
    const id = uuid.v4()
    await addToDatabase(id, filename, false, user_id)
    return id
}

function cleanExtension(toclean) {
    const sanitised = sanitise(toclean)
    let extension = path.extname(sanitised)
    if (extension === '') {
        if (sanitised.startsWith('.')) {
            extension = sanitised
        } else if (sanitised === '') {
            extension = ''
        } else {
            extension = '.' + sanitised
        }
    }

    return extension
}

const storage = multer.diskStorage({
    destination: config.media.directory,
    filename: async (req, file, cb) => {
        var name = sanitise(req.body.filename)
        if (name === '') name = sanitise(file.originalname)
        if (name === '') name = unique()

        // TODO: add other details to the database!
        const id = await addNewFileToDatabase(name, req.user)

        let ext = path.extname(name)
        if (req.body.filetype !== '' && req.body.filetype !== undefined) {
            ext = cleanExtension(req.body.filetype)
        }

        var filename = id

        if (ext !== '.') filename += ext

        cb(null, filename)
    }
})
const upload = multer({storage: storage, limits: {fileSize: config.media.fileSize}})

const uploadRouter = express.Router()

uploadRouter.get('/', async (req, res) => {
    res.render('upload')
})
uploadRouter.post('/', upload.single('file'), async (req, res) => {
    res.status(200)

    if (req.file !== undefined) {
        // Now get all the details from the database...
        const file = await media.getFileFull(req.file.filename)

        req.flash('html_success_msg', await getPugMessage('success_pug', {url: media.mediaroot + file.fs_name + '/' + file.filename, text: file.filename}))
    } else {
        req.flash('error_msg', await getMessage('nullfile'))
    }
    res.redirect(303, media.uploadroot)
})

const mediaRouter = express.Router()
// TODO: Make this cache really well!
const mediaStatic = express.static(config.media.directory)
mediaRouter.use('/', mediaStatic)

// This happens if a file is not found... We try to find it!
mediaRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    const found_id = await media.findFileID(id)

    // Redirect if the file is found, and if the file is found, only permanently redirect if the file ID is a proper UUID.
    if (!found_id) {
        res.sendStatus(404)
    } else {
        let file = media.mediaroot + found_id

        if (req.fancyname !== undefined) {
            file += '/' + req.fancyname
        }

        if (uuid.validate(media.noExtID(id))) {
            res.redirect(301, file)
        } else {
            res.redirect(302, file)
        }
    }
})

mediaRouter.get('/:id/:name', async (req, res) => {
    req.url = '/' + req.params.id
    req.fancyname = req.params.name
    mediaRouter.handle(req, res)
})

mediaRouter.post('/:id', async (req, res)=> {
    if (!req.isAuthenticated()) {
        res.sendStatus(401)
        return
    }

    // Get the ID including file extention
    const id = req.params.id
    // Get the UUID
    const idnoext = id.substr(0, id.length - path.extname(id).length)

    // Determine what action we need to take... First we figure out what action so we don't do multiple at once!
    let action = ""
    if (req.query.delete !== undefined) {
        action = "delete"
    }
    if (req.query.convert !== undefined) {
        if (action !== "") action = "conflict"
        else action = "convert"
    }
    if (req.query.update !== undefined) {
        if (action !== "") action = "conflict"
        else action = "update"
    }

    const idhex = idnoext.replaceAll('-', '')

    // TODO: Make it more obvious to the user that something happened?
    switch (action) {
        case "":
        case "conflict":
            res.sendStatus(400)
            return;
        case "delete":
            // Attempt to delete the file in the DB if it is a UUID!
            if (uuid.validate(idnoext)) await media.queryDatabase("UPDATE files SET deleted = True WHERE uuid = UNHEX(?)", [idhex])
            try {
                await fsp.rm(path.join(config.media.directory, id))
            } catch (e) {
                // TODO: Notify user of error properly?
                console.error(e)
                res.sendStatus(503)
                return
            }
            req.flash('success_msg', await getMessage('delete_success'))
            break;
        case "convert":
            try {
                const ext = path.extname(id)

                // Generate UUID and add to database
                const new_id = await addNewFileToDatabase(id)

                try {
                    // Rename the file to match the UUID
                    const new_filename = new_id + ext
                    await fsp.rename(path.join(config.media.directory, id), path.join(config.media.directory, new_filename))
                } catch (e) {
                    await media.queryDatabase("DELETE FROM files WHERE uuid = UNHEX(?)", [idhex])
                    // Throw it again!
                    throw(e)
                }
            } catch (e) {
                console.error(e)
                res.sendStatus(503)
                return
            }

            req.flash('success_msg', await getMessage('convert_success'))
            break;

        case "update":
            if (req.body.name === "") {
                console.error("Someone tried to set a filename to empty!", req)

                req.flash('error_msg', await getMessage('empty_name'))

                break
            }

            async function updateQuery(data, idhex) {
                const data_keys = Object.keys(data)
                const parts = []
                let str = 'UPDATE files SET '
                if (data_keys.length > 0) {
                    let first = true
                    for (const column of data_keys) {
                        parts.push(data[column])
                        if (first) {
                            first = false
                        } else {
                            str += ', '
                        }
                        str += mysql.escapeId(column) + ' = ?'
                    }

                    str += ' WHERE uuid = UNHEX(?)'
                    parts.push(idhex)

                    return await queryDatabase(str, parts)
                }
            }

            let data = {}
            if (req.body.name !== undefined) {
                const original_name = (await media.getFileFromDatabase(idnoext))[0].filename
                const new_name = sanitise(req.body.name)
                if (new_name !== original_name) {
                    data.filename = new_name
                }
            }

            let modified = Object.keys(data).length > 0

            if (req.body.filetype !== undefined) {
                // Get a reasonable extension from the human-provided input
                const extension = cleanExtension(req.body.filetype)

                if (path.extname(id) !== extension) {
                    // Now try to modify the actual filesystem...
                    await fsp.rename(path.join(config.media.directory, id), path.join(config.media.directory, idnoext + extension))
                    modified = true
                }
            }

            if (modified) {
                data.modifier_userid = req.user

                try {
                    // Generate the query and run it...
                    await updateQuery(data, idhex)
                } catch (e) {
                    console.error(e)
                    res.sendStatus(503)
                    return
                }

                // If it works, then we tell the user.
                req.flash('success_msg', await getMessage('update_success'))
            }

            break;
        default:
    }

    res.redirect(303, media.mediamanager)
})

async function mediaManager(req, res) {
    let names = []
    for (const file of await media.getFilesFromDatabase()) {
        if (file.database) {
            names.push([media.mediaroot + file.fs_name + '/' + file.filename, file.filename + " (" + file.id + ")", media.mediaroot + file.fs_name, true, file.filename, file.filetype, file.uploader_name, file.modifier_name])
        } else {
            names.push([media.mediaroot + file.fs_name, file.filename, media.mediaroot + file.fs_name, false, file.filename])
        }
    }

    res.render('media', {files : names})
}

module.exports = {
    setupSync : () => {
        if (!fs.existsSync(config.media.directory)) {
            fs.mkdirSync(config.media.directory)
        }
    },

    // Ends up as "/media".
    mediaRoute : mediaRouter,

    // Ends up as "/admin/upload"
    uploadRoute: uploadRouter,

    // Ends up as "/admin/media"
    mediaManger: mediaManager
}
