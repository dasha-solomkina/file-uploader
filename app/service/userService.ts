import bcrypt from 'bcryptjs'
import prisma from '../../prisma/client'

type CreateUserOpts = {
  name: string
  email: string
  password: string
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function createUser(opts: CreateUserOpts) {
  const { name, email, password } = opts
  const hashedPassword = await bcrypt.hash(password, 10)

  return await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })
}
