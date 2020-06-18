require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const notesRouter = require('./notes/notes-router')
/*const NotesService = require('./notes/notes-service')*/
const folderRouter = require('./folders/folders-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(notesRouter)
app.use(folderRouter)

/*app.get((req, res, next) => {
    NotesService.getAllNotes(
        req.app.get('db')
    )
        .then(notes => {
            res.json(notes)
        })
        .catch(next)
})*/

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app