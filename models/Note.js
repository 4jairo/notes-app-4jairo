const mongoose = require('mongoose')

const NoteScheema = new mongoose.Schema({
    content: {
        required: true,
        type: String,
    },
    ownerId: {
        required: true,
        type: String,
    },
    date: {
        required: true,
        type: Date,
    }
})

NoteScheema.set('toJSON', {
    transform: (document, returnDocuemnt) => {
        returnDocuemnt.id = returnDocuemnt._id
        delete returnDocuemnt._id
        delete returnDocuemnt.__v
        delete returnDocuemnt.ownerId
    }
})

const NoteModel = mongoose.model('Note', NoteScheema)

module.exports = { NoteModel }