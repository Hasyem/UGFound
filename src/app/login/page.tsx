'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Building,
  RefreshCw,
  Phone,
  Info,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { isGunadarmaEmail } from '@/lib/utils'
import { USER_ROLES } from '@/lib/constants'
import { DataService } from '@/lib/data-service'
import type { UserRole } from '@/types/database'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { loginWithCustomUser } = useAuth()

  // Tabs: 'password' | 'otp' | 'register'
  const [authMethod, setAuthMethod] = useState<'password' | 'otp' | 'register'>('password')

  // Form states
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [role, setRole] = useState<UserRole>('mahasiswa')

  // OTP flow states
  const [otpStep, setOtpStep] = useState<boolean>(false)
  const [otpCode, setOtpCode] = useState<string>('')
  const [otpToken, setOtpToken] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(300) // 5 menit = 300 detik
  const [isAutoResending, setIsAutoResending] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // 1. Password Login Handler (Direct login, e.g. Admin farras.85.243@gmail.com / FAS99905)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Alamat email wajib diisi!')
      return
    }

    if (!password) {
      toast.error('Password wajib diisi!')
      return
    }

    setLoading(true)
    try {
      const result = await DataService.authenticateUser(email, password)
      if (result.success && result.user) {
        loginWithCustomUser(result.user)
        toast.success(`Selamat datang, ${result.user.name}!`)
        if (result.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        toast.error(result.message || 'Login gagal. Periksa kembali email dan password Anda.')
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memproses login.')
    } finally {
      setLoading(false)
    }
  }

  // Otomatis kirim ulang OTP jika waktu 5 menit kedaluwarsa
  const handleAutoResendOtp = useCallback(async () => {
    if (isAutoResending || loading || !email) return
    setIsAutoResending(true)
    toast('Waktu 5 menit telah habis. Mengirimkan kode OTP baru secara otomatis...', {
      icon: '🔄',
      duration: 5000,
    })

    try {
      const cleanEmail = email.toLowerCase().trim()
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name }),
      })

      const data = await res.json()

      if (data.success) {
        if (data.otpToken) setOtpToken(data.otpToken)
        setTimeLeft(300)
        setOtpCode('')
        toast.success(`Kode OTP baru telah otomatis dikirimkan ke ${cleanEmail}! Periksa email Anda.`, {
          duration: 6000,
        })
      } else {
        toast.error(data.message || 'Gagal mengirimkan kode OTP baru.')
      }
    } catch {
      toast.error('Gagal menghubungi server untuk mengirimkan kode OTP otomatis.')
    } finally {
      setIsAutoResending(false)
    }
  }, [isAutoResending, loading, email, name])

  // Countdown timer 5 menit (300 detik)
  useEffect(() => {
    if (!otpStep) return

    if (timeLeft <= 0) {
      handleAutoResendOtp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [otpStep, timeLeft, handleAutoResendOtp])

  // 2. Request OTP Code Handler
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!email) {
      toast.error('Alamat email wajib diisi!')
      return
    }

    // Role validation: Mahasiswa & Dosen require Gunadarma email
    const cleanEmail = email.toLowerCase().trim()
    const isAdminEmail = cleanEmail === 'farras.85.243@gmail.com' || cleanEmail === 'far99905@gmail.com'

    if (!isAdminEmail && (role === 'mahasiswa' || role === 'dosen') && !isGunadarmaEmail(cleanEmail)) {
      toast.error(
        'Mahasiswa & Dosen wajib menggunakan email resmi (@student.gunadarma.ac.id atau @gunadarma.ac.id)!'
      )
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name }),
      })

      const data = await res.json()

      if (data.success) {
        setOtpStep(true)
        if (data.otpToken) setOtpToken(data.otpToken)
        setTimeLeft(300)
        setOtpCode('')
        toast.success(
          data.message || `Kode OTP 6-digit telah dikirimkan ke email ${cleanEmail}! Berlaku selama 5 menit.`,
          { duration: 6000 }
        )
      } else {
        toast.error(data.message || 'Gagal mengirimkan kode OTP.')
      }
    } catch (err) {
      toast.error('Gagal menghubungi server untuk mengirim OTP.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Verify OTP Code Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Harap masukkan 6-digit kode OTP!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: otpCode.trim(),
          otpToken,
          name,
          role,
          phone,
        }),
      })

      const data = await res.json()

      if (data.success && data.user) {
        // Save user to DataService and local session
        await DataService.createOrUpdateUser(data.user)
        loginWithCustomUser(data.user)

        toast.success(`Verifikasi berhasil! Selamat datang, ${data.user.name}.`)
        if (data.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        if (data.nextOtpToken) {
          setOtpToken(data.nextOtpToken)
        }
        if (data.expired) {
          // Jika server menyatakan kode sudah kedaluwarsa, otomatis kirim ulang!
          handleAutoResendOtp()
        } else {
          toast.error(data.message || 'Kode OTP tidak valid atau telah kedaluwarsa.')
        }
      }
    } catch {
      toast.error('Terjadi kesalahan saat memverifikasi OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
          UG
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Masuk ke Portal UGFound
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Sistem Informasi Layanan Barang Hilang &amp; Temuan Universitas Gunadarma
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Method Switcher Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password')
              setOtpStep(false)
            }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
              authMethod === 'password'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk dengan Password
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp')
              setOtpStep(false)
            }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
              authMethod === 'otp'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Login dengan OTP Email
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('register')
              setOtpStep(false)
            }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
              authMethod === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: Password Login */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Pengguna / Akun</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email Anda"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2 & 3: OTP Flow (Request OTP / Verify OTP) */}
          {(authMethod === 'otp' || authMethod === 'register') && (
            <div>
              {!otpStep ? (
                /* Step 1: Request OTP Form */
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {authMethod === 'register' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masukkan nama lengkap Anda"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Peran Sivitas Kampus</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm bg-white transition"
                        >
                          <option value="mahasiswa">Mahasiswa (Email Gunadarma)</option>
                          <option value="dosen">Dosen / Tenaga Pengajar (Email Gunadarma)</option>
                          <option value="satpam">Petugas Keamanan / Satpam (Email Bebas / Pribadi)</option>
                          <option value="staf_kebersihan">Staf Kebersihan Kampus (Email Bebas / Pribadi)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Aktif</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Masukkan nomor WhatsApp aktif"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Email Penerima OTP</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan alamat email Anda"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm transition"
                      />
                    </div>
                  </div>

                  {/* Informative notice */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verifikasi Email Otentik</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Sistem akan mengirimkan 6-digit kode OTP langsung ke alamat email yang Anda masukkan. Kode berlaku selama 5 menit (otomatis kirim ulang jika habis).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengirimkan OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Kode OTP ke Email</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Input OTP Verification Code */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Periksa Email Anda</h3>
                    <p className="text-xs text-slate-500">
                      Kode OTP 6-digit telah dikirimkan ke:
                    </p>
                    <p className="text-xs font-bold text-blue-700 bg-blue-50 py-1 px-3 rounded-lg inline-block">
                      {email}
                    </p>
                  </div>

                  {/* Countdown Timer 5 Menit & Auto Resend Notice */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>Waktu Tersisa:</span>
                      <span className="font-mono text-sm font-black text-amber-950 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-xs">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Kode OTP berlaku selama <strong>5 menit</strong>. Jika waktu habis, sistem akan <strong>otomatis mengirimkan kode OTP baru</strong> ke email Anda.
                    </p>
                  </div>


                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 text-center block">
                      Masukkan 6 Digit Kode OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      required
                      autoFocus
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black py-3 rounded-xl border-2 border-blue-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Kode...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verifikasi &amp; Masuk</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      ← Ganti Email
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                    >
                      Kirim Ulang Kode
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Return Home */}
      <div className="text-center">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-blue-600 font-medium transition"
        >
          ← Kembali ke Beranda UGFound
        </Link>
      </div>
    </div>
  )
}