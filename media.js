'use strict'

import * as util from 'util';
import * as uuid from 'uuid'
import * as fs from 'fs/promises'
import * as path from 'path'

import config from "./config/config";
const database = require('./database')

export const mediaroot = '/media/'
export const uploadroot = '/admin/upload/'
export const mediamanager = '/admin/media'

/**
 * Run a query on the database, and return the result as a promise.
 */
export const queryDatabase = util.promisify(database.query).bind(database)

/**
 * Get an ID without the extension.
 *
 * @param id The ID potentially with extension.
 * @returns {string} The ID without extension.
 */
export function noExtID(id) {
    return id.substr(0, id.length - path.extname(id).length)
}

/**
 * Find the ID with extension from an ID without an extension.
 *
 * @param id
 * @returns {Promise<*>} A string if the file is found, or a null if the file is not found.
 */
export async function findFileID(id) {
    const idnoext = noExtID(id)

    let target = null
    for (const file of await listFiles()) {
        const filenoext = noExtID(file)
        if (filenoext === idnoext) {
            target = file
            break
        }
    }

    return target
}

/**
 * Get a list of all the files in the media directory. This gets their true filenames, regardless of if they are in the database or not.
 *
 * @returns {Promise<string[]>} A list of file names of the files in the media directory.
 */
export async function listFiles() {
    return fs.readdir(config.media.directory)
}

/**
 * Run a database query of a file in the database.
 *
 * @param id The UUID of the file to look up in the database.
 * @returns {Promise<*>} A query result. Results are, in order... filename, title text, alt text, uploader user ID, modifier user ID.
 */
export async function getFileFromDatabase(id) {
    return queryDatabase('SELECT filename, title_text, alt_text, uploader_userid, modifier_userid FROM files WHERE uuid = UNHEX(?)', [id.replaceAll('-', '')])
}

/**
 * Get information of a file in the media folder, regardless of if it is in the database or not. <br>
 *
 * The fields of the file object are...
 *  * database: true if the file has an entry in the database, false if not.
 *  * id: the UUID of the file. Always present if file is in database, only sometimes present if not in the database.
 *  * fs_name: the name of the file on the filesystem / within the media folder.
 *  * filename: The filename of the file
 *  * title: the title text of the file
 *  * alt: the alt text of the file
 *  * uploader_id: file uploader user ID
 *  * uploader_name: the name used for the file uploader
 *  * modifier_id: file modifier user ID
 *  * modifier_name: name used for the file modifier
 *
 *  For the uploader and modifier, the "name" can be either a username or a nickname or full name, or even an email, do not rely on it!
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

    const idnoext = noExtID(file)
    if (uuid.validate(idnoext)) {
        entry.id = idnoext

        const result = await getFileFromDatabase(entry.id)
        if (result.length !== 0) {
            entry.database = true
            entry.filename = result[0].filename
            entry.title = result[0].title_text
            entry.alt = result[0].alt_text
            // Try to get the user information...
            if (result[0].uploader_userid != null) {
                entry.uploader_id = result[0].uploader_userid
                entry.uploader_name = (await queryDatabase('SELECT user_login FROM users WHERE id = ?', [entry.uploader_id]))[0].user_login
            }
            if (result[0].modifier_userid != null) {
                entry.modifier_id = result[0].modifier_userid
                entry.modifier_name = (await queryDatabase('SELECT user_login FROM users WHERE id = ?', [entry.modifier_id]))[0].user_login
            }
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
 * Get a list of all files in the media folder, and get information from the database about them. <br>
 *
 * The fields of the each file object are...
 *  * database: true if the file has an entry in the database, false if not.
 *  * id: the UUID of the file. Always present if file is in database, only sometimes present if not in the database.
 *  * fs_name: the name of the file on the filesystem / within the media folder.
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
