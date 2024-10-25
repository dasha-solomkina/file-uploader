import bcrypt from 'bcryptjs'
import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import passport from 'passport'
import path from 'path'
import { Strategy as LocalStrategy } from 'passport-local'
// const LocalStrategy = require('passport-local').Strategy // delete when working

import indexRouter from './routes/index'
// const indexRouter = require('./routes/index') // delete when working

// import pool from './db/pool' // todo

const app = express()
const assetsPath = path.join(__dirname, 'public')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(session({ secret: 'cats', resave: false, saveUninitialized: false }))
app.use(passport.session())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(assetsPath))

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.currentUser = req.user
  next()
})

// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const { rows } = await pool.query(
//         'SELECT * FROM users WHERE username = $1',
//         [username]
//       )
//       const user = rows[0]

//       if (!user) {
//         return done(null, false, { message: 'Incorrect username' })
//       }
//       const isMatch = await bcrypt.compare(password, user.password)
//       if (!isMatch) {
//         return done(null, false, { message: 'Incorrect password' })
//       }
//       return done(null, user)
//     } catch (err) {
//       return done(err)
//     }
//   })
// )

// passport.serializeUser((user, done) => {
//   done(null, user.id)
// })

// passport.deserializeUser(async (id, done) => {
//   try {
//     const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
//     const user = rows[0]

//     done(null, user)
//   } catch (err) {
//     done(err)
//   }
// })

app.post(
  '/log-in',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
  })
)

app.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})

app.use('/', indexRouter)

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})
