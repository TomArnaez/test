'use strict'

const sanitise = require('sanitize-filename')
const unique = require('unique-filename')
const express = require('express')
const config = require('./config/config.js')
const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const multer = require('multer')
async function fileExists(name) {
    try {
        await fsp.access(path.join(config.content.directory, name))
        return true
    } catch (e) {
        return false
    }
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

        if (!req.body.replace) {
            const orig_name = name
            // TODO: Investigate potential risk of race conditions if two people try to upload the same file name at once...
            for (let i = 2; await fileExists(name); ++i) {
                name = i.toString() + '_' + orig_name
            }
        }

        cb(null, name)
    }
})
const upload = multer({storage: storage, limits: {fileSize: config.content.fileSize}})

const uploadRouter = express.Router()

uploadRouter.get('/', async (req, res) => {
    res.render('upload')
})
uploadRouter.post('/', upload.single('file'), async (req, res) => {
    res.status(200)
    res.render('upload', {result : {url: req.file.path, name: req.file.filename}})
})

const contentRouter = express.Router()
contentRouter.use('/', express.static(config.content.directory))
contentRouter.get('/', async (req, res) => {
    res.render('content', {files : await listFiles()})
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
