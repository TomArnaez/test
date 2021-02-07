'use strict'

const contentroot = '/content/'

const sanitise = require('sanitize-filename')
const unique = require('unique-filename')
const express = require('express')
const config = require('./config/config.js')
const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const multer = require('multer')
const uuid = require('uuid')
const database = require('./database.js')
const util = require('util');

const queryDatabase = util.promisify(database.query).bind(database)

async function addToDatabase(id, filename, deleted) {
    return queryDatabase('INSERT INTO files (uuid, filename, deleted) VALUES (UNHEX(?), ?, ?)', [id.replaceAll('-', ''), filename, deleted])
}

async function addNewFileToDatabase(filename) {
    const id = uuid.v4()
    console.log(await addToDatabase(id, filename, false))
    return id
}

async function getNameFromDatabase(id) {
    return queryDatabase('SELECT filename FROM files WHERE uuid = UNHEX(?)', [id.replaceAll('-', '')])
}

async function listFiles() {
    return fsp.readdir(config.content.directory)
}

const storage = multer.diskStorage({
    destination: config.content.directory,
    filename: async (req, file, cb) => {
        var name = sanitise(req.body.filename)
        if (name === '') name = sanitise(file.originalname)
        if (name === '') name = unique()

        // TODO: add other details to the database!
        console.log(file)
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
    // TODO: make this give it the "nice" link
    res.render('upload', {result : {url: contentroot + req.file.filename, name: req.file.filename}})
})

const contentRouter = express.Router()
// TODO: Make this cache really well!
const contentStatic = express.static(config.content.directory)
contentRouter.use('/', contentStatic)
contentRouter.get('/', async (req, res) => {
    let names = []
    for (const file of await listFiles()) {
        const idnoext = file.substr(0, file.length - path.extname(file).length)
        const result = await getNameFromDatabase(idnoext)

        if (result.length !== 0) {
            names.push([file + '/' + result[0].filename, result[0].filename + " (" + idnoext + ")"])
        } else {
            names.push([file, file])
        }
    }

    res.render('content', {files : names})
})

async function findFileID(id) {
    const idnoext = id.substr(0, id.length - path.extname(id).length)

    let target = id
    for (const file of await listFiles()) {
        if (file.startsWith(id) || file.startsWith(idnoext)) {
            target = contentroot + file
            break
        }
    }

    return target
}

// This happens if a file is not found... We try to find it!
contentRouter.get('/:id', async (req, res) => {
    const id = req.params.id
    let file = await findFileID(id)
    if (req.fancyname !== undefined) {
        file += '/' + req.fancyname
    }
    // TODO: Determine when we can safely use a permanent redirect!
    if (file !== id) res.redirect(302, file)
    else res.sendStatus(404)
})

contentRouter.get('/:id/:name', async (req, res) => {
    req.url = '/' + req.params.id
    req.fancyname = req.params.name
    contentRouter.handle(req, res)
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
