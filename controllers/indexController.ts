import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function getHome(req: Request, res: Response) {
  const userId = res.locals.currentUser.id

  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: userId,
      },
    })
    console.log(folders)
    res.render('index', { folders: folders })
  } catch (error) {
    res.status(500).send('Server error')
  }
}

async function getLogIn(req: Request, res: Response) {
  try {
    res.render('log-in')
  } catch (error) {
    res.status(500).send('Server error')
  }
}

async function getAddFolder(req: Request, res: Response) {
  try {
    res.render('add-folder')
  } catch (error) {
    res.status(500).send('Server error')
  }
}

async function getAddFile(req: Request, res: Response) {
  try {
    res.render('add-file')
  } catch (error) {
    res.status(500).send('Server error')
  }
}

async function postSignUp(req: Request, res: Response, next: NextFunction) {
  const { email, password, name } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log('errors')

    return res.render('sign-up', {
      error: errors
        .array()
        .map((error) => error.msg)
        .join(', '),
      formData: req.body,
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    })

    if (user) {
      return res.render('sign-up', {
        error: 'Email already taken. Please choose another one.',
        formData: req.body,
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    })

    req.login(newUser, (err) => {
      if (err) {
        return next(err)
      }
      return res.redirect('/')
    })
  } catch (err) {
    return next(err)
  }
}

async function postAddFolder(req: Request, res: Response) {
  const { name } = req.body

  try {
    const userId = res.locals.currentUser.id

    await prisma.folder.create({
      data: {
        name: name,
        userId: userId,
      },
    })
    res.redirect('/')
  } catch (error) {
    res.status(500).send('Server error')
  }
}

const indexController = {
  getHome,
  getLogIn,
  postSignUp,
  getAddFolder,
  getAddFile,
  postAddFolder,
}

export default indexController
