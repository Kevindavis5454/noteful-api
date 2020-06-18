const express = require('express')
const NotesService = require('./notes-service')
const xss = require('xss')
const notesRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const posix = require('posix')

notesRouter
    .route('/notes')
    .get((req, res, next) => {
        NotesService.getAllNotes(
            req.app.get('db')
        )
            .then(notes => {
                res.json(notes)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

        const { title, content, folder_id } = req.body

        const newNote = { title, content, folder_id }

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(`/notes/${note.id}`)
                    .json(note)
            })
            .catch(next)
    })

    .delete((req, res, next) => {
        const { id } = req.params
        NotesService.deleteNote(
            req.app.get('db'), id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

notesRouter
    .route('/notes/:note_id')
    .all((req, res, next) => {
        const { id } = req.params
        NotesService.getById( req.app.get('db'), id)
            .then(note => {
            if (!note) {
                return res.status(404).json({
                    error: { message: `Note doesn't exist` }
                })
            }
            res.note = note // save the article for the next middleware
            next() // don't forget to call next so the next middleware happens!
        }).catch(next)
    })
    /*.get((req, res, next) => {
        res.json({
            id: res.note.id,
            title: xss(res.note.title), // sanitize title
            content: xss(res.note.content), // sanitize content
            /!*date_published: res.note.date_published,*!/
        })
    })*/
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch((req, res) => {
        res.status(204).end()
    })
module.exports = notesRouter