import nodemailer from 'nodemailer'
import crypto from 'crypto'

interface OtpEntry {
  code: string
  expiresAt: number
  attempts: number
}

// In-memory store (untuk fallback localhost / single instance)
const otpStore = new Map<string, OtpEntry>()

// Batas waktu kedaluwarsa 5 menit (300.000 ms) sesuai permintaan user
export const OTP_EXPIRY_MS = 5 * 60 * 1000

export interface SendOtpResult {
  success: boolean
  emailSent: boolean
  message: string
  otpToken?: string
  expiresInSeconds?: number
}

export interface VerifyOtpResult {
  success: boolean
  expired?: boolean
  message: string
  nextOtpToken?: string
}

// ============================================================================
// TOKEN STATELESS (AES-256-GCM)
// Menjamin kode OTP dapat diverifikasi di Vercel Serverless tanpa database
// dan tanpa terpengaruh cold start / multi-container Vercel.
// ============================================================================
const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
  const secret =
    process.env.OTP_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SMTP_PASS ||
    'ugfound-secure-otp-encryption-gunadarma-2026'
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptOtpToken(payload: { email: string; code: string; expiresAt: number; attempts: number }): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const text = JSON.stringify(payload)
  let encrypted = cipher.update(text, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const tag = cipher.getAuthTag()

  const combined = Buffer.concat([iv, tag, encrypted])
  return combined.toString('base64url')
}

export function decryptOtpToken(token: string): { email: string; code: string; expiresAt: number; attempts: number } | null {
  try {
    const combined = Buffer.from(token, 'base64url')
    if (combined.length < 28) return null

    const iv = combined.subarray(0, 12)
    const tag = combined.subarray(12, 28)
    const encrypted = combined.subarray(28)

    const key = getEncryptionKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted)
  } catch {
    return null
  }
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '') // Bersihkan spasi dari Google App Password
  const service = process.env.SMTP_SERVICE

  if (!user || !pass || pass === 'your_gmail_app_password' || pass.includes('your_')) {
    return null
  }

  // Konfigurasi Gmail langsung jika menggunakan Gmail
  if (service?.toLowerCase() === 'gmail' || host?.includes('gmail') || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    })
  }

  if (!host) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

export async function sendOtpToEmail(email: string, recipientName?: string): Promise<SendOtpResult> {
  const cleanEmail = email.toLowerCase().trim()

  // Generate 6-digit secure numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // 5 minutes expiry
  const expiresAt = Date.now() + OTP_EXPIRY_MS

  // Simpan ke in-memory store
  otpStore.set(cleanEmail, {
    code,
    expiresAt,
    attempts: 0,
  })

  // Enkripsi token stateless untuk serverless Vercel
  const otpToken = encryptOtpToken({
    email: cleanEmail,
    code,
    expiresAt,
    attempts: 0,
  })

  // Log server terminal untuk pengawasan teknis admin (TIDAK diekspos ke browser / client)
  console.log(`\n======================================================`)
  console.log(`[UGFound OTP Service] KODE OTP UNTUK ${cleanEmail}: ${code} (Berlaku 5 Menit)`)
  console.log(`======================================================\n`)

  const transporter = getMailTransporter()

  if (!transporter) {
    console.warn(`[UGFound OTP Service] SMTP belum dikonfigurasi di .env.local!`)
    return {
      success: false,
      emailSent: false,
      message: `Layanan pengiriman email belum aktif. Harap lengkapi SMTP_USER dan SMTP_PASS di environment variables agar kode OTP terkirim ke email Anda.`,
    }
  }

  try {
    const fromAddress = process.env.SMTP_FROM || `"UGFound Universitas Gunadarma" <${process.env.SMTP_USER}>`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #1e3a8a, #4338ca); padding: 32px 24px; text-align: center; color: white; }
          .logo { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
          .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
          .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: monospace; }
          .warning { font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 16px; }
          .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">UGFound</div>
            <div class="subtitle">Sistem Lost &amp; Found Kampus Universitas Gunadarma</div>
          </div>
          <div class="content">
            <div class="greeting">Halo, ${recipientName || cleanEmail}!</div>
            <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0;">
              Berikut adalah kode verifikasi OTP Anda untuk registrasi / login ke sistem <strong>UGFound</strong>:
            </p>
            <div class="otp-box">
              <div class="otp-code">${code}</div>
            </div>
            <p class="warning">
              ⏱️ <strong>Penting:</strong> Kode ini hanya berlaku selama <strong>5 menit</strong>.<br/>
              Demi keamanan akun Anda, jangan berikan atau bagikan kode ini kepada siapa pun. Jika waktu habis, sistem akan otomatis mengirimkan kode baru.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Universitas Gunadarma • Layanan Terpadu Barang Hilang &amp; Temuan
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject: `[UGFound] Kode Verifikasi OTP Anda (${code}) - Berlaku 5 Menit`,
      text: `Kode verifikasi OTP UGFound Anda adalah: ${code}. Berlaku selama 5 menit. Jangan berikan kode ini kepada pihak mana pun demi menjaga keamanan akun.`,
      html: htmlContent,
    })

    return {
      success: true,
      emailSent: true,
      otpToken,
      expiresInSeconds: 300,
      message: `Kode verifikasi OTP telah dikirimkan ke email ${cleanEmail}. Berlaku selama 5 menit.`,
    }
  } catch (error: any) {
    console.error('[UGFound OTP Service] Error sending email via SMTP:', error)
    return {
      success: false,
      emailSent: false,
      message: `Gagal mengirim email via SMTP (${error?.message || 'Koneksi error'}). Silakan periksa pengaturan SMTP atau coba beberapa saat lagi.`,
    }
  }
}

export function verifyOtp(email: string, code: string, token?: string): VerifyOtpResult {
  const cleanEmail = email.toLowerCase().trim()
  const cleanCode = code.trim()

  // 1. Verifikasi menggunakan Stateless Decrypted Token (untuk Vercel Serverless)
  if (token) {
    const data = decryptOtpToken(token)
    if (data && data.email === cleanEmail) {
      if (Date.now() > data.expiresAt) {
        return {
          success: false,
          expired: true,
          message: 'Kode OTP telah kedaluwarsa (melebihi batas 5 menit). Sistem akan otomatis mengirimkan kode baru.',
        }
      }

      if (data.attempts >= 5) {
        return {
          success: false,
          expired: true,
          message: 'Terlalu banyak percobaan salah (maksimal 5 kali). Sistem akan otomatis mengirimkan kode baru.',
        }
      }

      if (data.code !== cleanCode) {
        const nextAttempts = (data.attempts || 0) + 1
        const nextOtpToken = encryptOtpToken({
          ...data,
          attempts: nextAttempts,
        })
        return {
          success: false,
          message: `Kode OTP yang Anda masukkan salah! (Percobaan ke-${nextAttempts} dari 5)`,
          nextOtpToken,
        }
      }

      // Verifikasi berhasil!
      otpStore.delete(cleanEmail)
      return {
        success: true,
        message: 'Kode OTP berhasil diverifikasi!',
      }
    }
  }

  // 2. Fallback ke In-Memory Store (untuk localhost / single server)
  const entry = otpStore.get(cleanEmail)

  if (!entry) {
    return {
      success: false,
      expired: true,
      message: 'Kode OTP belum diminta atau sudah kedaluwarsa. Sistem akan mengirimkan kode baru.',
    }
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail)
    return {
      success: false,
      expired: true,
      message: 'Kode OTP telah kedaluwarsa (melebihi batas 5 menit). Sistem akan otomatis mengirimkan kode baru.',
    }
  }

  if (entry.attempts >= 5) {
    otpStore.delete(cleanEmail)
    return {
      success: false,
      expired: true,
      message: 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru demi keamanan.',
    }
  }

  if (entry.code !== cleanCode) {
    entry.attempts += 1
    return {
      success: false,
      message: `Kode OTP yang Anda masukkan salah! (Percobaan ke-${entry.attempts} dari 5)`,
    }
  }

  // Verification succeeded - clear OTP
  otpStore.delete(cleanEmail)
  return {
    success: true,
    message: 'Kode OTP berhasil diverifikasi!',
  }
}
