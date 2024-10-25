// import { validationResult } from 'express-validator' // todo: install
// import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'

async function getHome(req: Request, res: Response) {
  try {
    res.render('index')
  } catch (error) {
    res.status(500).send('Server error')
  }
}

const indexController = {
  getHome,
}

export default indexController
