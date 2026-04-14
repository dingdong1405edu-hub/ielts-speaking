import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function requireAdmin() {
  const session = await auth()
  if (!session) return { error: 'Chưa đăng nhập', status: 401, user: null }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true },
  })

  if (!user || user.role !== 'ADMIN') {
    return { error: 'Không có quyền truy cập', status: 403, user: null }
  }

  return { error: null, status: 200, user }
}
