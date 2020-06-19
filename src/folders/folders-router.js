const express = require('express')
const FoldersService = require('./folders-service')
const xss = require('xss')
const folderRouter = express.Router()
const jsonParser = express.json()
const path = require('path')

folderRouter
    .route('/folders')
    .get((req, res, next) => {
        FoldersService.getAllFolders(
            req.app.get('db')
        )
            .then(folders => {
                res.json(folders)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { folder_name } = req.body
        const newFolder = { folder_name }

        for (const [key, value] of Object.entries(newFolder)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(`/folders/${folder.id}`)
                    .json(folder)
            })
            .catch(next)
    })

folderRouter
    .route('/folders/:folder_id')
    .all((req, res, next) => {
        const { folder_id } = req.params
        FoldersService.getById( req.app.get('db'), folder_id )
            .then(folder => {
            if (!folder) {
                return res.status(404).json({
                    error: { message: `Folder doesn't exist` }
                })
            }
            res.folder = folder // save the article for the next middleware
            next() // don't forget to call next so the next middleware happens!
        }).catch(next)
    })
    .get((req, res) => {
        res.json({
            id: res.folder.id,
            folder_name: xss(res.folder.folder_name), // sanitize title
            /*content: xss(res.folder.content), // sanitize content
            date_published: res.folder.date_published,*/
        })
    })
    .delete((req, res, next) => {
        const { folder_id } = req.params
        FoldersService.deleteFolder(
            req.app.get('db'), folder_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
   /* .patch((req, res) => {
        res.status(204).end()
    })*/

module.exports = folderRouter