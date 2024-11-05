import prisma from '../../prisma/client'

export default async function deleteFile(fileId: string) {
  const file = await prisma.files.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error('File not found')
  }

  const folderId = file.folderId

  await prisma.files.delete({
    where: { id: fileId },
  })

  const files = await prisma.files.findMany({
    where: { folderId: folderId },
  })

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
  })

  return { folderId, folder, files }
}
