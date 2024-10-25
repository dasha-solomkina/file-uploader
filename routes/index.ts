import { Router } from 'express'
const indexRouter = Router()
// import { body } from 'express-validator'

import indexController from '../controllers/indexController'

// const validateSignUp = [
//   body('password')
//     .isLength({ min: 5 })
//     .withMessage('Password must be at least 5 characters long'),
//   body('confirmPassword').custom((value, { req }) => {
//     if (value !== req.body.password) {
//       throw new Error('Password confirmation does not match password')
//     }
//     return true
//   }),
// ]

indexRouter.get('/', indexController.getHome)

export default indexRouter
