'use strict'

const sanitise = require('sanitize-filename')
const unique = require('unique-filename')
const express = require('express')
const config = require('./config/config')
const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const multer = require('multer')
const uuid = require('uuid')
const util = require('util');

const content = require('./content.js')


async function addToDatabase(id, filename, deleted) {
    return content.queryDatabase('INSERT INTO files (uuid, filename, deleted) VALUES (UNHEX(?), ?, ?)', [id.replaceAll('-', ''), filename, deleted])
}

async function addNewFileToDatabase(filename) {
    const id = uuid.v4()
    await addToDatabase(id, filename, false)
    return id
}

const storage = multer.diskStorage({
    destination: config.content.directory,
    filename: async (req, file, cb) => {
        var name = sanitise(req.body.filename)
        if (name === '') name = sanitise(file.originalname)
        if (name === '') name = unique()

        // TODO: add other details to the database!
        const id = await addNewFileToDatabase(name)

        const ext = path.extname(name)

        var filename = id

        if (ext !== '.') filename += ext

        cb(null, filename)
    }
})
const upload = multer({storage: storage, limits: {fileSize: config.content.fileSize}})

const uploadRouter = express.Router()

uploadRouter.get('/', async (req, res) => {
    res.render('upload')
})
uploadRouter.post('/', upload.single('file'), async (req, res) => {
    res.status(200)
    // Now get all the details from the database...
    if (req.file !== undefined) {
        const file = await content.getFileFull(req.file.filename)
        res.render('upload', {
            result: {
                url: content.contentroot + file.fs_name + '/' + file.filename,
                name: file.filename
            }
        })
    } else {
        res.status(400)
        res.render('upload', {
            fail: "nullfile"
        })
    }
})

const contentRouter = express.Router()
// TODO: Make this cache really well!
const contentStatic = express.static(config.content.directory)
contentRouter.use('/', contentStatic)
contentRouter.get('/', async (req, res) => {
    let names = []
    for (const file of await content.getFilesFromDatabase()) {
        if (file.database) {
            names.push([file.fs_name + '/' + file.filename, file.filename + " (" + file.id + ")", file.fs_name, true, file.filename, file.alt, file.title])
        } else {
            names.push([file.fs_name, file.filename, file.fs_name, false, file.filename])
        }
    }

    res.render('content', {files : names})
})

// This happens if a file is not found... We try to find it!
contentRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    let file = content.contentroot + await content.findFileID(id)

    if (req.fancyname !== undefined) {
        file += '/' + req.fancyname
    }

    // Redirect if the file is found, and if the file is found, only redirect if the file ID is a proper UUID.
    if (file)
        if (uuid.validate(content.noExtID(id))) res.redirect(301, file)
        else res.redirect(302, file)
    else res.sendStatus(404)
})

contentRouter.get('/:id/:name', async (req, res) => {
    req.url = '/' + req.params.id
    req.fancyname = req.params.name
    contentRouter.handle(req, res)
})

contentRouter.post('/:id', async (req, res)=> {
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
            if (uuid.validate(idnoext)) await content.queryDatabase("UPDATE files SET deleted = True WHERE uuid = UNHEX(?)", [idhex])
            try {
                await fsp.rm(path.join(config.content.directory, id))
            } catch (e) {
                // TODO: Notify user of error properly?
                console.error(e)
                res.sendStatus(503)
                return
            }
            break;
        case "convert":
            try {
                const ext = path.extname(id)

                // Generate UUID and add to database
                const new_id = await addNewFileToDatabase(id)

                try {
                    // Rename the file to match the IID
                    const new_filename = new_id + ext
                    await fsp.rename(path.join(config.content.directory, id), path.join(config.content.directory, new_filename))
                } catch (e) {
                    await content.queryDatabase("DELETE FROM files WHERE uuid = UNHEX(?)", [idhex])
                    // Throw it again!
                    throw(e)
                }
            } catch (e) {
                console.error(e)
                res.sendStatus(503)
                return
            }
            break;

        case "update":
            if (req.body.name === "") {
                res.sendStatus(400)
                console.error("Someone tried to set a filename to empty!", req)
                return
            }
            if (req.body.name !== undefined) {
                try {
                    await content.queryDatabase("UPDATE files SET filename = ? WHERE uuid = UNHEX(?)", [sanitise(req.body.name), idhex])
                } catch (e) {
                    console.error(e)
                    res.sendStatus(503)
                    return
                }
            }
            if (req.body.alt !== undefined) {
                if (req.body.alt === "") req.body.alt = null
                try {
                    await content.queryDatabase("UPDATE files SET alt_text = ? WHERE uuid = UNHEX(?)", [req.body.alt, idhex])
                } catch (e) {
                    console.error(e)
                    res.sendStatus(503)
                    return
                }
            }
            if (req.body.title !== undefined) {
                if (req.body.title === "") req.body.title = null
                try {
                    await content.queryDatabase("UPDATE files SET title_text = ? WHERE uuid = UNHEX(?)", [req.body.title, idhex])
                } catch (e) {
                    console.error(e)
                    res.sendStatus(503)
                    return
                }
            }
            break;
        default:
    }

    res.redirect(303, content.contentroot)
})

module.exports = {
    setupSync : () => {
        if (!fs.existsSync(config.content.directory)) {
            fs.mkdirSync(config.content.directory)
        }
    },

    // Ends up as "/content".
    contentRoute : contentRouter,

    // "Ends up as "/upload"
    uploadRoute: uploadRouter
}
