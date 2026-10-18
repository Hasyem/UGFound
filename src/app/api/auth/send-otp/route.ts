import { NextResponse } from 'next/server'
import { sendOtpToEmail } from '@/lib/otp-service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi!' },
        { status: 400 }
      )
    }

    const result = await sendOtpToEmail(email, name)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error in send-otp route:', err)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal saat mengirimkan OTP.' },
      { status: 500 }
    )
  }
}

