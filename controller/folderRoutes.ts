import { Router, Request, Response } from 'express'
import { getFoldersByUser, getFolderWithFiles } from '../service/folderService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const userId = res.locals.currentUser.id
  try {
    const folders = await getFoldersByUser(userId)
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

export default router
