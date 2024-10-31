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
  const userId = res.locals.currentUser.id

  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: userId,
      },
    })
    res.render('add-file', { folders })
  } catch (error) {
    res.status(500).send('Server error')
  }
}

async function getFolder(req: Request, res: Response) {
  const folderId = req.params.id

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    })

    const files = await prisma.files.findMany({
      where: { folderId: folderId },
    })

    const modifiedFiles = files.map((file) => {
      const newTime = file.time.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
      return {
        ...file,
        time: newTime,
      }
    })

    res.render('folder', { folderId, folder, files: modifiedFiles })
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

async function postDeleteFolder(req: Request, res: Response) {
  const folderId = req.params.id

  try {
    await prisma.folder.delete({
      where: { id: folderId },
    })
    res.redirect('/')
  } catch (error) {
    res.status(500).send('Server error')
  }
}

async function postDeleteFile(req: Request, res: Response): Promise<void> {
  const fileId = req.params.id

  try {
    const file = await prisma.files.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      res.status(404).send('File not found')
      return
    }

    const folderId = file.folderId

    await prisma.files.delete({
      where: { id: fileId },
    })

    const files = await prisma.files.findMany({
      where: { folderId: folderId },
    })

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    })

    res.render('folder', { folderId, folder, files })
  } catch (error) {
    res.status(500).send('Server error')
  }
}

const indexController = {
  getHome,
  getLogIn,
  getAddFolder,
  getAddFile,
  getFolder,
  postSignUp,
  postAddFolder,
  postDeleteFolder,
  postDeleteFile,
}

export default indexController
