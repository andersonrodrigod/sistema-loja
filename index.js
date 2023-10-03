const express = require('express')
const exphbs = require('express-handlebars')
const handlebarsHelpers = require('handlebars-helpers')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const OrderRoutes = require('./routes/orderRoutes')
const auth = require('./routes/auth')

const exphbsInstance = exphbs.create({
    extname: 'handlebars',
    helpers: handlebarsHelpers,
                 
        
})

app.engine('handlebars', exphbsInstance.engine)
app.set('view engine', 'handlebars')

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(flash())

app.use(express.static('public'))

app.use(express.json())

app.use(
    session({
        name: "session",
        secret: "nosso_secret",
        resave: false,
        saveUninitialized: true,
        store: new FileStore({
            logFn: function() {},
            path: require('path').join(require('os').tmpdir(),'sessions')  
        }),
        cookie: {
            secure: false,
            httpOnly: true,
        }
        
    })
)

app.use((req, res, next) => {
    if(req.session.userid) {
        res.locals.session = req.session
    }

    next()
})

app.use('/', OrderRoutes)
app.use('/', auth)

app.listen(3000, () => {
    console.log('app rodando na porta 3000')
})