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
    const response = NextResponse.json(result)

    if (result.success && result.otpToken) {
      response.cookies.set('ugfound_otp_token', result.otpToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 360, // 6 minutes (covers 5-minute validity)
      })
    }

    return response
  } catch (err: any) {
    console.error('Error in send-otp route:', err)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal saat mengirimkan OTP.' },
      { status: 500 }
    )
  }
}

