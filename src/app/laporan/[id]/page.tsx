'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Tag,
  ShieldCheck,
  HelpCircle,
  Lock,
  EyeOff,
  Phone,
  MessageSquare,
  Share2,
  Flag,
  CheckCircle2,
  RotateCcw,
  Shield,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { DataService } from '@/lib/data-service'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import type { ReportWithRelations, ReportStatus } from '@/types/database'
import ClaimModal from '@/components/ui/ClaimModal'
import FlagModal from '@/components/ui/FlagModal'
import { ReportCardSkeleton } from '@/components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params?.id as string

  const { user, profile, isAdmin } = useAuth()
  const [report, setReport] = useState<ReportWithRelations | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [claimModalOpen, setClaimModalOpen] = useState<boolean>(false)
  const [flagModalOpen, setFlagModalOpen] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  const fetchReport = async () => {
    if (!reportId) return
    setLoading(true)
    try {
      const data = await DataService.getReportById(reportId)
      setReport(data)
    } catch (err) {
      console.error('Error fetching report:', err)
      toast.error('Gagal memuat detail laporan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportId])

  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    if (!report) return
    setActionLoading(true)
    try {
      const ok = await DataService.updateReportStatus(report.id, newStatus)
      if (ok) {
        toast.success(`Status laporan berhasil diubah ke ${REPORT_STATUS_LABELS[newStatus] || newStatus}`)
        fetchReport()
      } else {
        toast.error('Gagal mengubah status laporan.')
      }
    } catch {
      toast.error('Terjadi kesalahan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReopen = async () => {
    if (!report || !user) return
    setActionLoading(true)
    try {
      const res = await DataService.reopenReport(report.id, user.id)
      if (res.success) {
        toast.success(res.message)
        fetchReport()
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('Terjadi kesalahan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Tautan laporan berhasil disalin ke clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <ReportCardSkeleton />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Laporan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Laporan yang Anda cari mungkin telah dihapus, disembunyikan oleh sistem, atau tautan salah.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const isFound = report.type === 'found'
  const isOwner = user?.id === report.user_id
  const canManage = isOwner || isAdmin
  const statusConfig = REPORT_STATUS_COLORS[report.status] || {
    bg: 'bg-slate-100 text-slate-700',
    border: 'border-slate-200',
  }

  // Check if report can be reopened (< 24 hours since resolved)
  const canReopen =
    report.status === 'resolved' &&
    report.resolved_at &&
    new Date().getTime() - new Date(report.resolved_at).getTime() < 24 * 60 * 60 * 1000

  // Format WhatsApp number
  const cleanPhone = (report.contact || '').replace(/\D/g, '')
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <nav className="flex items-center gap-1.5 text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/cari" className="hover:text-blue-600 transition">
            Laporan
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-medium truncate max-w-[180px] sm:max-w-xs">
            {report.title}
          </span>
        </nav>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
          title="Bagikan tautan laporan"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Bagikan</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header Badges */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                isFound
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {isFound ? (
                <>
                  <ShieldCheck className="w-4 h-4" /> Barang Ditemukan
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4" /> Barang Dicari (Hilang)
                </>
              )}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.border}`}
            >
              {REPORT_STATUS_LABELS[report.status] || report.status}
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Dilaporkan {formatRelativeTime(report.created_at)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Photo Showcase */}
          {report.photo_url ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 max-h-[420px] flex items-center justify-center">
              <img
                src={report.photo_url}
                alt={report.title}
                className={`w-full max-h-[420px] object-contain ${
                  (report.category_id === 2 || (report as any).is_blurred_privacy) ? 'blur-md scale-105' : ''
                }`}
              />
              {(report.category_id === 2 || (report as any).is_blurred_privacy) && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md text-white p-3.5 rounded-xl text-xs flex items-center gap-2.5 border border-white/10 shadow-lg">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Privasi Terlindungi:</strong> Foto KTM / dokumen identitas disamarkan otomatis demi mencegah kebocoran data pribadi (KTM / NIK / NIM).
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 px-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-dashed border-slate-200 text-center">
              <span className="text-5xl block mb-2">{CATEGORY_ICONS[report.category_id] || '📦'}</span>
              <p className="text-xs text-slate-500 font-medium">Pelapor tidak menyertakan foto referensi</p>
            </div>
          )}

          {/* Title & Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                <Tag className="w-3.5 h-3.5" />
                {CATEGORY_ICONS[report.category_id]} {report.categories?.name || 'Kategori'}
              </span>

              <span className="text-slate-300">•</span>

              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Waktu Kejadian: {formatDate(report.event_at)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {report.title}
            </h1>

            {/* Hierarchical Location */}
            <div className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">
                  {report.locations?.campus || 'Kampus Universitas Gunadarma'}
                </span>
                <span className="text-slate-500"> — </span>
                <span>
                  {report.locations
                    ? `${report.locations.building}${report.locations.floor ? ` (${report.locations.floor})` : ''}`
                    : report.location_text || 'Lokasi Kampus'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Deskripsi Umum
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
              {report.description}
            </div>
          </div>

          {/* Lokasi Barang Diamankan & Instruksi Serah Terima (Khusus Barang Temuan) */}
          {isFound && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Shield className="w-4 h-4 text-emerald-600" />
                Lokasi Barang Diamankan &amp; Instruksi Pengambilan Fisik
              </div>

              {report.safe_location && (
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Titik Penitipan Fisik: {report.safe_location}</span>
                </div>
              )}

              <p className="text-xs text-emerald-900 leading-relaxed">
                <strong>Pengingat Verifikasi Serah Terima:</strong> Demi mencegah klaim palsu oleh oknum tidak bertanggung jawab, pengklaim wajib <strong>menyebutkan ciri khusus rahasia</strong> barang serta <strong>menunjukkan KTM atau identitas resmi asli</strong> saat serah terima di pos satpam / titik penitipan.
              </p>
            </div>
          )}

          {/* Ciri Khusus Tersembunyi (Hidden Features) */}
          {isFound && (
            <div>
              {canManage ? (
                <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900 uppercase flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-700" />
                      Ciri Khusus Tersembunyi (Hanya Anda &amp; Admin yang Melihat)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-extrabold">
                      RAHASIA VERIFIKASI
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs font-medium text-amber-950">
                    {report.hidden_features || 'Tidak ada ciri khusus rahasia yang dicatat.'}
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Gunakan catatan rahasia di atas saat pihak yang mengaku pemilik menghubungi Anda, untuk memvalidasi apakah mereka benar-benar pemilik sah.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                  <EyeOff className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    <strong>Ciri Khusus Tersembunyi</strong> dirahasiakan oleh sistem demi keamanan untuk menjamin verifikasi kepemilikan anti-klaim palsu.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Kontak Pelapor (Terproteksi Autentikasi) */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="text-xs font-bold text-purple-950 uppercase tracking-wide flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-700" />
              Kontak Penemu / Pelapor
            </div>

            {user ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-purple-200">
                <div className="space-y-0.5">
                  <div className="text-sm font-extrabold text-slate-900">
                    {report.contact || 'Kontak tidak dicantumkan'}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    ✓ Terbuka karena Anda login sebagai sivitas akademika terverifikasi ({user.email})
                  </div>
                </div>

                {report.contact && (
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Hubungi via WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Nomor WhatsApp dan kontak pelapor disembunyikan untuk pengunjung umum demi perlindungan privasi.
                  </span>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  Login Sivitas Gunadarma
                </Link>
              </div>
            )}
          </div>

          {/* Owner / Admin Management Panel */}
          {canManage && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Panel Manajemen Laporan (Pembuat / Admin)
                </span>
                <span className="text-[11px] text-slate-300">
                  Status: <strong>{REPORT_STATUS_LABELS[report.status]}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {report.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Tandai Selesai (Barang Sudah Diterima)
                    </button>

                    {report.status !== 'claim_in_progress' ? (
                      <button
                        onClick={() => handleUpdateStatus('claim_in_progress')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                      >
                        Set Dalam Proses Klaim
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus('active')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                      >
                        Kembalikan ke Aktif
                      </button>
                    )}
                  </>
                )}

                {canReopen && (
                  <button
                    onClick={handleReopen}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Buka Kembali Laporan (Masih &lt;24 Jam)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Footer: Klaim & Laporkan Postingan */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFlagModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                Laporkan Postingan
              </button>
            </div>

            {isFound && report.status === 'active' && !isOwner && (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow hover:shadow-md transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Ini Barang Saya (Ajukan Klaim)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        report={report}
        currentUser={user}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onStatusChanged={fetchReport}
      />

      {/* Flag Modal */}
      <FlagModal
        reportId={report.id}
        reportTitle={report.title}
        currentUserId={user?.id || null}
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
      />
    </div>
  )
}

