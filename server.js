require('dotenv').config()
const mongoose = require('mongoose')
//const { UserModel } = require('./models/User')
//const { NoteModel } = require('./models/Note')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors.js')

const usersRouter = require('./routes/users')
const notesRouter = require('./routes/notes')

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//public
app.use('/home', express.static('public'))

//login - signin
app.use('/', usersRouter)

//notes
app.use('/notes', notesRouter)

//middlewares
app.use(notFound)
app.use(handleErrors)

app.listen(3000, null, () => {
    console.log('notes app ready on http://localhost:3000/home')
})

mongoose.connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
// mongoose.connect('mongodb://127.0.0.1:27017/newDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
