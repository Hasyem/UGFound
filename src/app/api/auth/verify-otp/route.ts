import { NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-service'
import type { Tables, UserRole } from '@/types/database'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code, otpToken, name, role, phone, password } = body

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email dan kode OTP wajib diisi!' },
        { status: 400 }
      )
    }

    // Ambil token dari payload body atau dari HttpOnly cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/ugfound_otp_token=([^;]+)/)
    const cookieToken = match ? match[1] : undefined
    const token = otpToken || cookieToken

    const verification = verifyOtp(email, code, token)
    if (!verification.success) {
      const resp = NextResponse.json(verification, { status: 400 })
      if (verification.nextOtpToken) {
        resp.cookies.set('ugfound_otp_token', verification.nextOtpToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 360,
        })
      }
      return resp
    }

    const cleanEmail = email.toLowerCase().trim()

    // Determine role (farras.85.243@gmail.com atau far99905@gmail.com selalu admin)
    const isAdmin = cleanEmail === 'farras.85.243@gmail.com' || cleanEmail === 'far99905@gmail.com'
    const finalRole: UserRole = isAdmin ? 'admin' : (role as UserRole) || 'mahasiswa'

    const finalName = isAdmin
      ? (name || 'Farras (Admin UGFound)')
      : (name || cleanEmail.split('@')[0].replace('.', ' ').toUpperCase())

    const user: Tables<'users'> = {
      id: isAdmin ? '00000000-0000-0000-0000-000000000001' : 'usr-' + Date.now(),
      email: cleanEmail,
      name: finalName,
      role: finalRole,
      phone: phone || null,
      email_verified_at: new Date().toISOString(),
      is_active: true,
      avatar_url: null,
      created_at: new Date().toISOString(),
      password: password || null,
    }

    const resp = NextResponse.json({
      success: true,
      message: 'Verifikasi OTP berhasil!',
      user,
    })

    // Bersihkan cookie ugfound_otp_token setelah sukses
    resp.cookies.set('ugfound_otp_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return resp
  } catch (err: any) {
    console.error('Error in verify-otp route:', err)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal saat memverifikasi OTP.' },
      { status: 500 }
    )
  }
}
