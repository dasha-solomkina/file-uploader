import { Router, Request, Response, NextFunction } from 'express'
import { validationResult, body } from 'express-validator'
import { findUserByEmail, createUser } from '../service/userService'

const router = Router()

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

router.get('/log-in', (req: Request, res: Response) => {
  res.render('log-in')
})

router.post(
  '/sign-up',
  validateSignUp,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render('sign-up', {
        error: errors
          .array()
          .map((error) => error.msg)
          .join(', '),
        formData: req.body,
      })
    }

    try {
      const existingUser = await findUserByEmail(email)

      if (existingUser) {
        return res.render('sign-up', {
          error: 'Email already taken. Please choose another one.',
          formData: req.body,
        })
      }

      const newUser = await createUser(name, email, password)

      req.login(newUser, (err) => {
        if (err) return next(err)
        res.redirect('/')
      })
    } catch (err) {
      next(err)
    }
  }
)

export default router
