import bcrypt from 'bcryptjs'
import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import passport from 'passport'
import path from 'path'
import { Strategy as LocalStrategy } from 'passport-local'
import { PrismaClient } from '@prisma/client'
import indexRouter from './routes/index'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import multer from 'multer'

const prisma = new PrismaClient()
const app = express()
const assetsPath = path.join(__dirname, 'public')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(
  session({
    secret: 'cats',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Check expired sessions every 2 minutes
      dbRecordIdIsSessionId: true, // Use session ID as record ID
      dbRecordIdFunction: undefined,
    }),
  })
)

app.use(passport.session())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(assetsPath))

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.currentUser = req.user
  next()
})

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
        })

        if (!user) {
          return done(null, false, { message: 'Incorrect username' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' })
        }
        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
  )
)

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    })

    done(null, user)
  } catch (err) {
    done(err)
  }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.originalname + '-' + uniqueSuffix)
  },
})

const upload = multer({ storage: storage })

app.post(
  '/add-file',
  upload.single('upload'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, folder } = req.body

      const file = req.file

      if (!file) {
        res.status(400).send('No file uploaded')
        return
      }
      const fileSize = `${(file.size / 1024).toFixed(1)} KB`
      const fileUrl = `path/to/your/storage/${file.originalname}`

      await prisma.files.create({
        data: {
          name,
          size: fileSize,
          url: fileUrl,
          folderId: folder,
        },
      })
      res.redirect('/')
    } catch (error) {
      console.error('Error uploading file:', error)

      res.status(500).send('Server error')
    }
  }
)

app.post(
  '/log-in',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
    failureMessage: 'Invalid email or password',
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
