const express = require('express')
const usersRouter = express.Router()

const { UserModel } = require('../models/User')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const populateOptoins = {
    path: 'notes',
    select: { content: 1, date: 1 },
    options: { sort: {date: -1} }
}

//login by token
usersRouter.post('/login', async (req, res, next) => {
    try {
        if(req.headers.authorization){
            const token = req.headers.authorization.split(" ")[1]
            const payload = jwt.verify(token, process.env.SECRET)
            const timeDifference = (new Date - new Date(payload.expiration)) / 60000 //this returns the token lifetime in minutes
        
            if(timeDifference < 120) {
                const user = await UserModel.findById(payload.userId).populate(populateOptoins)
                const {notes, name} = user

                res.json({token, notes, name})
            } else {
                res.json({error: 'token expired'})
            }

        } else {
            next()
        }
        
    } catch (err) {
        console.log('login by token:',err)
        next(err)
    }
})

//login by name and password
usersRouter.post('/login', async (req, res, next) => {
    try{
        const { name, password } = req.body
        const user = await UserModel.findOne({name: name}).populate(populateOptoins)

        const ispasswordOk = user 
            ? await bcryptjs.compare(`${password}`, user.password)
            : false 
        //
        if(ispasswordOk){
            const payload = {
                name: user.name,
                userId: user._id,
                expiration: new Date
            }

            const token = jwt.sign(payload, process.env.SECRET)
            res.json({ token, notes: user.notes, name: user.name })

        } else {
            res.json({error: 'Password or Username not correct'})
        }
    } catch (err) {
        console.log('login by password:',err)
        next(err)
    }
})

//signin
usersRouter.post('/signin', async (req, res, next) => {
    try {
        const {name, password} = req.body
        const user = await UserModel.findOne({name: name})

        if(user) {
            res.json({error: 'This user alredy exists'})
        } else {
            const hashedPassword = await bcryptjs.hash(password, 10)
            const newUser = new UserModel({
                name: name,
                password: hashedPassword
            })
            
            newUser.save().then(savedUser => {
                const payload = {
                    name: savedUser.name,
                    userId: savedUser._id,
                    expiration: new Date
                }
                const token = jwt.sign(payload, process.env.SECRET)
                res.json({token, name: savedUser.name})
            })
        }
    } catch (err) {next(err)}
})

module.exports = usersRouter