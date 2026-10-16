import Link from 'next/link'
import { SearchX, PlusCircle } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  showReportButton?: boolean
  reportType?: 'lost' | 'found'
}

export default function EmptyState({
  title = 'Tidak Ada Laporan Ditemukan',
  description = 'Belum ada barang yang cocok dengan kriteria pencarian atau filter yang dipilih.',
  showReportButton = true,
  reportType = 'lost',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-slate-200 text-center max-w-xl mx-auto shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {showReportButton && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/lapor?type=${reportType}`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{reportType === 'lost' ? 'Buat Laporan Kehilangan' : 'Lapor Temuan Barang'}</span>
          </Link>
          <Link
            href="/cari"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Reset Semua Filter
          </Link>
        </div>
      )}
    </div>
  )
}
