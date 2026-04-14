import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Plan config
// ---------------------------------------------------------------------------
const PLAN_CONFIG = {
  '1m': { plan: 'ONE_MONTH' as const, months: 1, amount: 100_000 },
  '2m': { plan: 'TWO_MONTHS' as const, months: 2, amount: 180_000 },
  '3m': { plan: 'THREE_MONTHS' as const, months: 3, amount: 240_000 },
} satisfies Record<string, { plan: 'ONE_MONTH' | 'TWO_MONTHS' | 'THREE_MONTHS'; months: number; amount: number }>

type PlanKey = keyof typeof PLAN_CONFIG

// ---------------------------------------------------------------------------
// POST /api/orders — create a PremiumOrder (status: PENDING)
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // 1. Authenticate
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Bạn cần đăng nhập để thực hiện thao tác này.' },
      { status: 401 },
    )
  }

  // 2. Parse & validate body
  let body: { plan?: string; transferNote?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body không hợp lệ.' }, { status: 400 })
  }

  const planKey = body.plan as PlanKey | undefined
  if (!planKey || !(planKey in PLAN_CONFIG)) {
    return NextResponse.json(
      { error: 'Gói không hợp lệ. Chọn 1m, 2m hoặc 3m.' },
      { status: 400 },
    )
  }

  const { plan, months, amount } = PLAN_CONFIG[planKey]
  const transferNote = body.transferNote?.trim() ?? null

  // 3. Create order in DB
  try {
    const order = await prisma.premiumOrder.create({
      data: {
        userId: session.user.id,
        plan,
        months,
        amount,
        status: 'PENDING',
        transferNote,
      },
      select: { id: true, amount: true, plan: true, createdAt: true },
    })

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        plan: order.plan,
        message:
          'Đơn hàng đã được ghi nhận. Tài khoản sẽ được kích hoạt trong vòng 24 giờ sau khi xác nhận chuyển khoản.',
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[api/orders] create error:', err)
    return NextResponse.json(
      { error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// GET /api/orders — list current user's orders
// ---------------------------------------------------------------------------
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  try {
    const orders = await prisma.premiumOrder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        plan: true,
        months: true,
        amount: true,
        status: true,
        transferNote: true,
        confirmedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ orders })
  } catch (err) {
    console.error('[api/orders] list error:', err)
    return NextResponse.json({ error: 'Không thể lấy danh sách đơn hàng.' }, { status: 500 })
  }
}
