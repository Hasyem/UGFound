import nodemailer from 'nodemailer'

interface OtpEntry {
  code: string
  expiresAt: number
  attempts: number
}

// In-memory store for OTPs (keyed by lowercase email)
const otpStore = new Map<string, OtpEntry>()

export interface SendOtpResult {
  success: boolean
  emailSent: boolean
  message: string
  devCode?: string
}

export interface VerifyOtpResult {
  success: boolean
  message: string
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
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
  })
}

export async function sendOtpToEmail(email: string, recipientName?: string): Promise<SendOtpResult> {
  const cleanEmail = email.toLowerCase().trim()

  // Generate 6-digit secure numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // 10 minutes expiry
  const expiresAt = Date.now() + 10 * 60 * 1000

  otpStore.set(cleanEmail, {
    code,
    expiresAt,
    attempts: 0,
  })

  console.log(`[UGFound OTP Service] Generated OTP for ${cleanEmail}: ${code}`)

  const transporter = getMailTransporter()

  if (!transporter) {
    return {
      success: true,
      emailSent: false,
      devCode: code,
      message: `Kode OTP berhasil dibuat untuk ${cleanEmail}. (Aktifkan SMTP di .env.local untuk pengiriman email langsung)`,
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
              Berikut adalah kode verifikasi OTP Anda untuk masuk ke sistem <strong>UGFound</strong>:
            </p>
            <div class="otp-box">
              <div class="otp-code">${code}</div>
            </div>
            <p class="warning">
              ⏱️ <strong>Penting:</strong> Kode ini hanya berlaku selama <strong>10 menit</strong>.<br/>
              Jangan berikan kode ini kepada pihak mana pun demi menjaga keamanan akun sivitas akademika Anda.
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
      subject: `[UGFound] Kode Verifikasi OTP Anda: ${code}`,
      text: `Kode verifikasi OTP UGFound Anda adalah: ${code}. Berlaku selama 10 menit.`,
      html: htmlContent,
    })

    return {
      success: true,
      emailSent: true,
      message: `Kode verifikasi OTP telah dikirimkan ke email ${cleanEmail}. Silakan periksa kotak masuk atau spam Anda.`,
    }
  } catch (error: any) {
    console.error('[UGFound OTP Service] Error sending email via SMTP:', error)
    // Fallback gracefully so login is never blocked if SMTP temporarily fails
    return {
      success: true,
      emailSent: false,
      devCode: code,
      message: `Gagal mengirim email via SMTP (${error?.message || 'Koneksi error'}). Kode OTP sementara: ${code}`,
    }
  }
}

export function verifyOtp(email: string, code: string): VerifyOtpResult {
  const cleanEmail = email.toLowerCase().trim()
  const entry = otpStore.get(cleanEmail)

  if (!entry) {
    return {
      success: false,
      message: 'Kode OTP belum diminta atau sudah kedaluwarsa. Silakan minta kode baru.',
    }
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail)
    return {
      success: false,
      message: 'Kode OTP telah kedaluwarsa (melebihi batas 10 menit). Silakan minta kode baru.',
    }
  }

  if (entry.attempts >= 5) {
    otpStore.delete(cleanEmail)
    return {
      success: false,
      message: 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru demi keamanan.',
    }
  }

  if (entry.code !== code.trim()) {
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

