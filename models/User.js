const mongoose = require('mongoose')

const UserScheema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
})

// UserScheema.set('toJSON', {
//     transform: (document, returnObj) => {
//         returnObj.id = returnObj._id
//         delete returnObj._id
//         delete returnObj.__v
//         delete returnObj.password
//     }
// })

const UserModel = mongoose.model('User', UserScheema)

module.exports = { UserModel }
