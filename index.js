require('dotenv').config()
const helmet = require("helmet")
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const csrf = require('csurf')

const csrfErrorHandlerMiddleware = require('./middlewares/csrf_error_handler')
const localsMiddleware = require('./middlewares/locals')
const statRoutes = require('./routes/stats')
const authRoutes = require('./routes/auth')

const app = express()

app.use(helmet({
    contentSecurityPolicy: false
}))
app.set('view engine', 'pug')
app.set('views', 'views')
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))
app.use(session({
    secret: process.env.SESSION_SECRET_KEY || 'some secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())
app.use(csrf())
// Custom middlewares
app.use(csrfErrorHandlerMiddleware)
app.use(localsMiddleware)

app.use('/auth', authRoutes)
app.use('/stats', statRoutes)
app.get('/', (req, res) => {
    res.redirect('/auth')
})

const server_host = process.env.SERVER_DEFAULT_HOST || 'localhost'
const server_port = process.env.SERVER_DEFAULT_PORT || 8080
const db_host = process.env.DB_HOST || 'localhost'
const db_port = process.env.DB_PORT || 27017
const db_name = process.env.DB_NAME || 'titanic'

mongoose.connect(`mongodb://${db_host}:${db_port}/${db_name}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    app.listen(server_port, () => {
        console.log(`Server running at ${server_host}:${server_port}`)
    })
})
.catch(err => {
    throw err
})