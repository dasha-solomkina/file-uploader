import prisma from '../../prisma/client'

export async function getFoldersByUser(userId: string) {
  return prisma.folder.findMany({
    where: { userId },
  })
}

export async function getFolderWithFiles(folderId: string) {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
  })

  const files = await prisma.files.findMany({
    where: { folderId: folderId },
  })

  const modifiedFiles = files.map((file) => ({
    ...file,
    time: file.time.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    }),
  }))

  return { folder, files: modifiedFiles }
}

export async function addFolder(name: string, userId: string) {
  return prisma.folder.create({
    data: { name, userId },
  })
}

export async function deleteFolder(folderId: string) {
  const files = await prisma.files.findMany({
    where: {
      folderId: folderId,
    },
  })

  if (files) {
    await prisma.files.deleteMany({
      where: {
        folderId: folderId,
      },
    })
  }
  await prisma.folder.delete({
    where: { id: folderId },
  })
}
