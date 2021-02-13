'use strict'

import * as util from 'util';
import * as uuid from 'uuid'
import * as fs from 'fs/promises'
import * as path from 'path'

import config from "./config/config";
const database = require('./database')


/**
 * Run a query on the database, and return the result as a promise.
 */
export const queryDatabase = util.promisify(database.query).bind(database)

/**
 * Find the ID with extension from an ID without an extension.
 *
 * @param id
 * @returns {Promise<*>}
 */
// TODO: make this more strict
export async function findFileID(id) {
    const idnoext = id.substr(0, id.length - path.extname(id).length)

    let target = id
    for (const file of await content.listFiles()) {
        if (file.startsWith(id) || file.startsWith(idnoext)) {
            target = contentroot + file
            break
        }
    }

    return target
}

/**
 * Get a list of all the files in the content directory. This gets their true filenames, regardless of if they are in the database or not.
 *
 * @returns {Promise<string[]>} A list of file names of the files in the content directory.
 */
export async function listFiles() {
    return fs.readdir(config.content.directory)
}

/**
 * Run a database query of a file in the database.
 *
 * @param id The UUID of the file to look up in the database.
 * @returns {Promise<*>} A query result. Results are, in order... filename, title text, and alt text.
 */
export async function getFileFromDatabase(id) {
    return queryDatabase('SELECT filename, title_text, alt_text FROM files WHERE uuid = UNHEX(?)', [id.replaceAll('-', '')])
}

/**
 * Get information of a file in the content folder, regardless of if it is in the database or not. <br>
 *
 * The fields of the file object are...
 *  * database: true if the file has an entry in the database, false if not.
 *  * id: the UUID of the file. Always present if file is in database, only sometimes present if not in the database.
 *  * fs_name: the name of the file on the filesystem / within the content folder.
 *  * filename: The filename of the file
 *  * title: the title text of the file
 *  * alt: the alt text of the file
 *
 * @param id The ID of the file (with or without extension)
 * @param skip_check Skip any checks for if it is a real file or not. If true requires the id to have the file extention.
 * @returns {Promise<*>} An object with details of the file
 */
export async function getFileFull(id, skip_check) {
    const file = skip_check ? id : await findFileID(id)

    let entry = {
        fs_name: file
    }

    const idnoext = file.substr(0, file.length - path.extname(file).length)
    if (uuid.validate(idnoext)) {
        entry.id = idnoext

        const result = await getFileFromDatabase(entry.id)
        if (result.length !== 0) {
            entry.database = true
            entry.filename = result[0].filename
            entry.title = result[0].title_text
            entry.alt = result[0].alt_text
        } else {
            entry.database = false
        }
    } else {
        entry.database = false
    }

    if (!entry.database) entry.filename = entry.fs_name

    return entry
}

/**
 * Get a list of all files in the content folder, and get information from the database about them. <br>
 *
 * The fields of the each file object are...
 *  * database: true if the file has an entry in the database, false if not.
 *  * id: the UUID of the file. Always present if file is in database, only sometimes present if not in the database.
 *  * fs_name: the name of the file on the filesystem / within the content folder.
 *  * filename: The filename of the file
 *  * title: the title text of the file
 *  * alt: the alt text of the file
 *
 * @returns {Promise<[]>}
 */
export async function getFilesFromDatabase () {
    const files = []
    for (const file of await listFiles()) {
        files.push(await getFileFull(file, true))
    }
    return files
}
