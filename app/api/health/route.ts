import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'DingDongHSK',
    timestamp: new Date().toISOString(),
  })
}
