import { Router, Request, Response } from 'express'
import deleteFile from '../service/fileService'
import { getFoldersByUser } from '../service/folderService'
import { z } from 'zod'

const router = Router()

const fileIdSchema = z.object({
  id: z.string().uuid('Invalid file ID format'),
})
const userIdSchema = z.string().uuid('Invalid user ID format')

router.post('/file/:id', async (req: Request, res: Response): Promise<void> => {
  const paramsValidation = fileIdSchema.safeParse(req.params)

  if (!paramsValidation.success) {
    res.status(400).send(paramsValidation.error.errors)
    return
  }

  const fileId = paramsValidation.data.id

  try {
    const { folderId, folder, files } = await deleteFile(fileId)

    res.render('folder', { folderId, folder, files })
  } catch (error) {
    res.status(404).send(error)
  }
})

router.get('/add-file', async (req: Request, res: Response) => {
  const userIdVAlidation = userIdSchema.safeParse(res.locals.currentUser.id)

  if (!userIdVAlidation.success) {
    res.status(400).send(userIdVAlidation.error.errors)
    return
  }
  const userId = userIdVAlidation.data

  try {
    const folders = await getFoldersByUser(userId)
    res.render('add-file', { folders })
  } catch (error) {
    res.status(500).send('Server error')
  }
})

export default router
