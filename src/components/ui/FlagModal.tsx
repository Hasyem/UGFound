'use client'

import { useState } from 'react'
import { X, Flag, AlertTriangle } from 'lucide-react'
import { FLAG_REASONS } from '@/lib/constants'
import { DataService } from '@/lib/data-service'
import type { FlagReason } from '@/types/database'
import toast from 'react-hot-toast'

interface FlagModalProps {
  reportId: string
  reportTitle: string
  currentUserId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function FlagModal({
  reportId,
  reportTitle,
  currentUserId,
  isOpen,
  onClose,
}: FlagModalProps) {
  const [reason, setReason] = useState<FlagReason>('spam')
  const [note, setNote] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      toast.error('Silakan login terlebih dahulu untuk melaporkan postingan!')
      return
    }

    setSubmitting(true)
    try {
      const res = await DataService.flagReport(reportId, currentUserId, reason, note)
      if (res.success) {
        toast.success(res.message)
        onClose()
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengirim laporan.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Laporkan Postingan</h3>
              <p className="text-xs text-slate-500">Moderasi Komunitas UGFound</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 font-semibold">Postingan:</span>
            <p className="text-slate-800 font-bold mt-0.5 line-clamp-1">{reportTitle}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Alasan Pelaporan <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {FLAG_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    reason === r.value
                      ? 'border-rose-400 bg-rose-50/60 font-semibold text-rose-950 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="flag_reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value as FlagReason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs sm:text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Keterangan Tambahan (Opsional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Berikan detail lebih lanjut mengapa postingan ini mencurigakan atau melanggar SOP..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Postingan yang dilaporkan oleh 3 pengguna berbeda akan disembunyikan otomatis oleh sistem hingga ditinjau oleh Admin.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
