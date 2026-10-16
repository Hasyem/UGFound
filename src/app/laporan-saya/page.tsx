'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Tag,
  MapPin,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Eye,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { DataService } from '@/lib/data-service'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import type { ReportWithRelations, ReportStatus } from '@/types/database'
import toast from 'react-hot-toast'

export default function MyReportsPage() {
  const { user, profile } = useAuth()
  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchMyReports = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await DataService.getReports({
        userId: user.id,
        status: 'all',
      })
      setReports(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyReports()
  }, [user])

  const handleMarkResolved = async (reportId: string) => {
    if (!confirm('Tandai laporan ini sebagai selesai (barang sudah kembali ke pemilik)?')) {
      return
    }

    try {
      const ok = await DataService.updateReportStatus(reportId, 'resolved')
      if (ok) {
        toast.success('Laporan berhasil ditandai selesai!')
        fetchMyReports()
      } else {
        toast.error('Gagal memperbarui status laporan.')
      }
    } catch {
      toast.error('Terjadi kesalahan.')
    }
  }

  const handleReopen = async (reportId: string) => {
    if (!user) return
    try {
      const res = await DataService.reopenReport(reportId, user.id)
      if (res.success) {
        toast.success(res.message)
        fetchMyReports()
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('Terjadi kesalahan.')
    }
  }

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true
    return r.status === statusFilter
  })

  const totalReports = reports.length
  const totalResolved = reports.filter((r) => r.status === 'resolved').length
  const totalActive = reports.filter((r) => r.status === 'active' || r.status === 'claim_in_progress').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Laporan Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola dan pantau status barang hilang atau temuan yang pernah Anda laporkan.
          </p>
        </div>

        <Link
          href="/lapor"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Dibuat</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalReports}</p>
          <p className="text-xs text-slate-500 mt-0.5">Semua jenis laporan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Selesai / Kembali</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalResolved}</p>
          <p className="text-xs text-slate-500 mt-0.5">Berhasil diserahterimakan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Masih Aktif</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalActive}</p>
          <p className="text-xs text-slate-500 mt-0.5">Tampil di feed beranda</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'Semua Status' },
          { id: 'active', label: 'Aktif' },
          { id: 'claim_in_progress', label: 'Proses Klaim' },
          { id: 'resolved', label: 'Selesai' },
          { id: 'stored', label: 'Diamankan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat laporan Anda...</div>
      ) : filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isFound = report.type === 'found'
            const isResolved = report.status === 'resolved'
            const canReopen =
              isResolved &&
              report.resolved_at &&
              (Date.now() - new Date(report.resolved_at).getTime()) / (1000 * 60 * 60) <= 24

            return (
              <div
                key={report.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Side: Thumbnail & Summary */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {report.photo_url ? (
                      <Image
                        src={report.photo_url}
                        alt={report.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {CATEGORY_ICONS[report.category_id] || '📦'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isFound ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isFound ? 'Ditemukan' : 'Dicari'}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          REPORT_STATUS_COLORS[report.status]?.bg || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {REPORT_STATUS_LABELS[report.status]}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(report.created_at)}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.categories?.name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">
                          {report.locations?.campus || report.location_text}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex flex-wrap md:flex-col items-center md:items-end justify-end gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    href={`/laporan/${report.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail</span>
                  </Link>

                  {!isResolved ? (
                    <button
                      onClick={() => handleMarkResolved(report.id)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tandai Selesai</span>
                    </button>
                  ) : canReopen ? (
                    <button
                      onClick={() => handleReopen(report.id)}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Buka Kembali</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Arsip Selesai</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Laporan</h3>
          <p className="text-xs text-slate-500">
            Anda belum memiliki laporan {statusFilter !== 'all' ? `berstatus ${statusFilter}` : ''} di sistem.
          </p>
          <Link
            href="/lapor"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
          >
            Buat Laporan Sekarang
          </Link>
        </div>
      )}
    </div>
  )
}