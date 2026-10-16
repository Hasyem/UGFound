'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Tag, ShieldCheck, HelpCircle } from 'lucide-react'
import { formatRelativeTime, truncateText } from '@/lib/utils'
import { CATEGORY_ICONS, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '@/lib/constants'
import type { ReportWithRelations } from '@/types/database'

interface ReportCardProps {
  report: ReportWithRelations
}

export default function ReportCard({ report }: ReportCardProps) {
  const isFound = report.type === 'found'
  const statusConfig = REPORT_STATUS_COLORS[report.status] || {
    bg: 'bg-slate-100 text-slate-700',
    border: 'border-slate-200',
  }

  return (
    <Link
      href={`/laporan/${report.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400/80 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Thumbnail / Header */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {report.photo_url ? (
          <Image
            src={report.photo_url}
            alt={report.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <span className="text-4xl mb-1">{CATEGORY_ICONS[report.category_id] || '📦'}</span>
            <span className="text-xs font-medium text-slate-500">Tanpa Foto Referensi</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Type Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-md ${
              isFound
                ? 'bg-emerald-600/90 text-white border border-emerald-400/30'
                : 'bg-amber-600/90 text-white border border-amber-400/30'
            }`}
          >
            {isFound ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> DITEMUKAN
              </>
            ) : (
              <>
                <HelpCircle className="w-3.5 h-3.5" /> DICARI
              </>
            )}
          </span>

          {/* Status Badge */}
          {report.status !== 'active' && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md ${statusConfig.bg} ${statusConfig.border}`}
            >
              {REPORT_STATUS_LABELS[report.status]}
            </span>
          )}
        </div>

        {/* Category Chip Bottom Left */}
        <div className="absolute bottom-2.5 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 text-white backdrop-blur-md border border-white/20">
            <Tag className="w-3 h-3 text-blue-300" />
            <span>{report.categories?.name || 'Kategori'}</span>
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
          {report.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {truncateText(report.description, 110)}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          {/* Location */}
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-medium truncate">
              {report.locations
                ? `${report.locations.campus} • ${report.locations.building}${report.locations.floor ? ` (${report.locations.floor})` : ''}`
                : report.location_text || 'Lokasi Kampus'}
            </span>
          </div>

          {/* Time & Reporter */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatRelativeTime(report.created_at)}
            </span>

            {isFound && report.safe_location && (
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[10px] truncate max-w-[140px]" title={report.safe_location}>
                Diamankan: {report.safe_location}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
