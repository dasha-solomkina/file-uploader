import { Router, Request, Response } from 'express'
import deleteFile from '../service/fileService'
import { getFoldersByUser } from '../service/folderService'

const router = Router()

router.post('/file/:id', async (req: Request, res: Response) => {
  const fileId = req.params.id

  try {
    const { folderId, folder, files } = await deleteFile(fileId)

    res.render('folder', { folderId, folder, files })
  } catch (error) {
    res.status(404).send(error)
  }
})

router.get('/add-file', async (req: Request, res: Response) => {
  const userId = res.locals.currentUser.id
  try {
    const folders = await getFoldersByUser(userId)
    res.render('add-file', { folders })
  } catch (error) {
    res.status(500).send('Server error')
  }
})

export default router
