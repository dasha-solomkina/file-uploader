import { Router, Request, Response, NextFunction } from 'express'
import { validationResult, body } from 'express-validator'
import { findUserByEmail, createUser } from '../service/userService'
import { z } from 'zod'

const router = Router()

const signUpSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(5, 'Password must be at least 5 characters long'),
    confirmPassword: z.string(),
    name: z.string().min(1, 'Name is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password confirmation does not match password',
    path: ['confirmPassword'],
  })

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
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.render('index', {
        error: errors
          .array()
          .map((error) => error.msg)
          .join(', '),
        formData: req.body,
      })
    }

    const result = signUpSchema.safeParse(req.body)
    if (!result.success) {
      const zodErrors = result.error.errors.map((err) => err.message).join(', ')
      return res.render('index', {
        error: zodErrors,
        formData: req.body,
      })
    }

    const { email, password, name } = result.data

    try {
      const existingUser = await findUserByEmail(email)

      if (existingUser) {
        return res.render('index', {
          error: 'Email already taken. Please choose another one.',
          formData: req.body,
        })
      }

      const newUser = await createUser({ name, email, password })

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
