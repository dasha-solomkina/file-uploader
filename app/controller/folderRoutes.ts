import { Router, Request, Response } from 'express'
import {
  addFolder,
  deleteFolder,
  getFoldersByUser,
  getFolderWithFiles,
} from '../service/folderService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  let folders = null
  try {
    if (res.locals.currentUser) {
      const userId = res.locals.currentUser.id
      folders = await getFoldersByUser(userId)
    }
    res.render('index', { folders })
  } catch (error) {
    res.status(500).send('Server error')
  }
})

router.get('/folder/:id', async (req: Request, res: Response) => {
  const folderId = req.params.id
  try {
    const { folder, files } = await getFolderWithFiles(folderId)
    res.render('folder', { folderId, folder, files })
  } catch (error) {
    res.status(500).send('Server error')
  }
})

router.get('/add-folder', async (req: Request, res: Response) => {
  try {
    res.render('add-folder')
  } catch (error) {
    res.status(500).send('Server error')
  }
})

router.post('/add-folder', async (req: Request, res: Response) => {
  const { name } = req.body
  const userId = res.locals.currentUser.id

  try {
    await addFolder(name, userId)
    res.redirect('/')
  } catch (error) {
    res.status(500).send('Server error')
  }
})

router.post('/folder/:id', async (req: Request, res: Response) => {
  const folderId = req.params.id

  try {
    await deleteFolder(folderId)
    res.redirect('/')
  } catch (error) {
    res.status(500).send('Server error')
  }
})

export default router
