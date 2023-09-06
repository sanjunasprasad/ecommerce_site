const express = require('express')
const app = express()
require('dotenv').config();
const mongoose = require('mongoose')
const session = require('express-session')
const nocache = require("nocache")
const path = require('path')
const { v4: uuid } = require("uuid")
const axios = require('axios');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(nocache())

//mongo
const mongoDB = require("./database/connection")

//port
const PORT = process.env.PORT || 6100
mongoDB()


//view child folders mount
app.set('view engine', 'ejs')
// app.set('views', path.join(__dirname, 'views' ,'userView'))
// app.set('views', path.join(__dirname, 'views' ,'adminView'))
app.set('views', [
    path.join(__dirname, 'views/userView'),
    path.join(__dirname, 'views/adminView')
  ]);



// Serve static files from the 'child folders in public folder'
app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/assetu', express.static(path.join(__dirname, 'public/assetu')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));





//mount session
app.use(
    session({
        secret: uuid(),
        resave: false,
        saveUninitialized: true
    })

);
app.use((req,res,next) =>{
    res.locals.message = req.session.message
    delete req.session.message
    next()
})



//routes
const userRoute = require("./routes/userRoute")
const adminRoute = require('./routes/adminRoute')
//route prefix
app.use('/', userRoute)
app.use('/admin', adminRoute)



app.listen(PORT, (() => console.log(`server started at  http://localhost:${PORT}`)))
