'use client'

import { useState } from 'react'
import { X, ShieldCheck, MapPin, Phone, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ReportWithRelations } from '@/types/database'
import { DataService } from '@/lib/data-service'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ClaimModalProps {
  report: ReportWithRelations
  currentUser: { id: string; email: string } | null
  isOpen: boolean
  onClose: () => void
  onStatusChanged?: () => void
}

export default function ClaimModal({
  report,
  currentUser,
  isOpen,
  onClose,
  onStatusChanged,
}: ClaimModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleClaimSubmit = async () => {
    if (!currentUser) {
      toast.error('Silakan login terlebih dahulu untuk mengajukan klaim!')
      return
    }

    setSubmitting(true)
    try {
      const ok = await DataService.updateReportStatus(report.id, 'claim_in_progress')
      if (ok) {
        setIsSuccess(true)
        toast.success('Pengajuan klaim berhasil! Status barang kini "Dalam Proses Klaim".')
        if (onStatusChanged) onStatusChanged()
      } else {
        toast.error('Gagal memperbarui status laporan.')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat memproses klaim.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Instruksi & Prosedur Klaim</h3>
              <p className="text-xs text-slate-500">Verifikasi Kepemilikan Barang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Item Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Barang yang Diklaim</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{report.title}</p>
            <p className="text-xs text-slate-600 mt-1">Kategori: {report.categories?.name}</p>
          </div>

          {/* Safe Location Info */}
          {report.safe_location && (
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Lokasi Barang Diamankan
                  </h4>
                  <p className="text-sm font-semibold text-emerald-900 mt-0.5">
                    {report.safe_location}
                  </p>
                  <p className="text-xs text-emerald-800 mt-1">
                    Silakan langsung datangi lokasi di atas untuk proses serah terima barang.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verification Requirements Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Syarat Wajib Saat Pengambilan
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-slate-800">Sebutkan Ciri Khusus Tersembunyi:</strong>
                  <p className="text-slate-500 mt-0.5">Penemu telah mencatat ciri khusus rahasia. Anda wajib menyebutkannya (seperti goresan, stiker, isi dompet, atau serial number) sebelum barang diserahkan.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <div>
                  <strong className="text-slate-800">Tunjukkan Kartu Identitas:</strong>
                  <p className="text-slate-500 mt-0.5">Bawa KTM Gunadarma atau KTP asli sebagai bukti tanda pengenal Anda kepada petugas satpam atau penemu.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-slate-800">Penandatanganan Berita Acara (Jika di Pos Satpam):</strong>
                  <p className="text-slate-500 mt-0.5">Petugas satpam akan mencatat identitas penerima barang di buku log pengembalian barang kampus.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Kontak Pelapor / Penemu
                </h4>
                <p className="text-sm font-semibold text-blue-900">
                  {report.contact || report.users?.phone || report.users?.email || 'Hubungi Pos Satpam'}
                </p>
                <p className="text-[11px] text-blue-700">
                  Pelapor: {report.users?.name || 'Sivitas UG'} ({report.users?.role || 'Mahasiswa'})
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center space-y-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mx-auto" />
                <p className="text-xs font-semibold text-amber-900">
                  Kontak Pelapor Dilindungi
                </p>
                <p className="text-[11px] text-amber-700">
                  Sesuai kebijakan privasi, nomor kontak penemu hanya dapat dilihat oleh sivitas akademika yang telah masuk ke akun UGFound.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Masuk Sekarang untuk Melihat Kontak
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200/60 transition"
          >
            Tutup
          </button>

          {currentUser && report.status === 'active' && !isSuccess && (
            <button
              type="button"
              onClick={handleClaimSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Memproses...' : 'Tandai Sedang Diproses Klaim'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
