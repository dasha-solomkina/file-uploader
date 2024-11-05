import bcrypt from 'bcryptjs'
import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import passport from 'passport'
import path from 'path'
import { Strategy as LocalStrategy } from 'passport-local'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import multer from 'multer'
import cloudinary from './cloudinaryConfig'
import folderRouter from './app/controller/folderRoutes'
import userRouter from './app/controller/userRoutes'
import fileRouter from './app/controller/fileRoutes'
import prisma from './prisma/client'

const app = express()
const assetsPath = path.join(__dirname, 'public')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'app', 'views'))

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

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
//     cb(null, file.originalname + '-' + uniqueSuffix)
//   },
// })

const upload = multer({ storage: multer.memoryStorage() })

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
      const uploadResult = await cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (!result) {
            console.error('Cloudinary upload error:', error)
            res.status(500).send('Cloudinary upload error')
            return
          }

          const fileUrl = result.secure_url

          prisma.files
            .create({
              data: {
                name,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                url: fileUrl,
                folderId: folder,
              },
            })
            .then(() => res.redirect('/'))
            .catch((dbError) => {
              console.error('Database error:', dbError)
              res.status(500).send('Server error')
            })
        }
      )

      uploadResult.end(file.buffer)
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

app.use('/', folderRouter)
app.use('/', userRouter)
app.use('/', fileRouter)

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})
