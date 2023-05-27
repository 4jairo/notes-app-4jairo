//const mongoose = require('mongoose')
const { NoteModel } = require('../models/Note')
const { UserModel } = require('../models/User')

const express = require('express')
const notesRouter = express.Router()

const jwt = require('jsonwebtoken')

//token verification
notesRouter.use('/', (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const payload = jwt.verify(token, process.env.SECRET)
        const timeDifference = (new Date - new Date(payload.expiration)) / 60000
        
        if(timeDifference < 120) {
            res.payload = payload
            next()
        } else res.json({error: 'token expired'})
        
    } catch (err) {
        console.log('notes', err)
        next(err)
    }
})

notesRouter.post('/', async (req, res, next) => {
    try {
        const { userId } = res.payload
        const content = req.body.content === '' ? '[ empty note ]' : req.body.content

        const newNote = new NoteModel({
            content: content,
            date: new Date,
            ownerId: userId
        })
        const savedNote = await newNote.save()
        res.json(savedNote)
    
        //update user notes array
        const user = await UserModel.findById(userId)
        user.notes = user.notes.concat(savedNote._id)
        user.save()
    
    } catch (err) {
        console.log('post notes', err)
        next(err)
    }
})

notesRouter.delete('/:id', async (req, res, next) => {
    try {
        const toRemoveId = req.params.id
        const deletedNote = await NoteModel.findByIdAndDelete(toRemoveId)
        res.json(deletedNote)

        //update notes user array
        const user = await UserModel.findById(deletedNote.ownerId)
        const userDeletedNoteIndex = user.notes.findIndex(note => note._id.toString() === toRemoveId)
        user.notes.splice(userDeletedNoteIndex, 1)
        user.save()

    } catch (err) {
        console.log('delete note', err)
        next(err)
    }
})

notesRouter.patch('/:id', async (req, res, next) => {
    try {
        // const newNoteContent = {}
        // Object.keys(NoteModel.schema.obj).forEach(component => {
        //     const includesComponent = req.body[component]
        //     if(includesComponent) newNoteContent[component] = includesComponent
        //     if(component === 'date') newNoteContent.date = new Date
        // })

        const newNoteContent = { 
            content: req.body.content,
            date: new Date
        }
        
        const updatedNote = await NoteModel.findByIdAndUpdate(req.params.id, newNoteContent, {new: true})
        res.json(updatedNote)

    } catch (err) {
        console.log('updating note', err)
        next(err)
    }
})

/*
notesRouter.get('/', (req, res, next) => {
    NoteModel.find()
    .then(respnose => {
        if(respnose) res.json(respnose)
        else next() //404
    })
    .catch(err => {
        next(err)
    })
})
*/

/*
notesRouter.get('/:id', (req, res, next) => {
    NoteModel.findById(req.params.id)
    .then(respnose => {
        if(respnose) res.json(respnose)
        else next() //404
    })
    .catch(err => {
        console.log(err)
        next(err)
    })
})
*/

module.exports = notesRouter