import { Router } from 'express'
import { body } from 'express-validator'
import indexController from '../controllers/indexController'

const indexRouter = Router()

const validateSignUp = [
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password')
    }
    return true
  }),
]

indexRouter.get('/', indexController.getHome)
indexRouter.get('/log-in', indexController.getLogIn)
indexRouter.post('/sign-up', validateSignUp, indexController.postSignUp)
indexRouter.get('/add-folder', indexController.getAddFolder)
indexRouter.get('/add-file', indexController.getAddFile)

export default indexRouter
