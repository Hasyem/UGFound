import { NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-service'
import type { Tables, UserRole } from '@/types/database'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code, name, role, phone } = body

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email dan kode OTP wajib diisi!' },
        { status: 400 }
      )
    }

    const verification = verifyOtp(email, code)
    if (!verification.success) {
      return NextResponse.json(verification, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Determine role (farras.85.243@gmail.com is always admin)
    const finalRole: UserRole =
      cleanEmail === 'farras.85.243@gmail.com'
        ? 'admin'
        : (role as UserRole) || 'mahasiswa'

    const finalName =
      cleanEmail === 'farras.85.243@gmail.com'
        ? (name || 'Farras (Admin UGFound)')
        : (name || cleanEmail.split('@')[0].replace('.', ' ').toUpperCase())

    const user: Tables<'users'> = {
      id: cleanEmail === 'farras.85.243@gmail.com' ? '00000000-0000-0000-0000-000000000001' : 'usr-' + Date.now(),
      email: cleanEmail,
      name: finalName,
      role: finalRole,
      phone: phone || null,
      email_verified_at: new Date().toISOString(),
      is_active: true,
      avatar_url: null,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: 'Verifikasi OTP berhasil!',
      user,
    })
  } catch (err: any) {
    console.error('Error in verify-otp route:', err)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal saat memverifikasi OTP.' },
      { status: 500 }
    )
  }
}

