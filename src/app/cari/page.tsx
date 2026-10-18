'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  Layers,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import ReportCard from '@/components/ui/ReportCard'
import EmptyState from '@/components/ui/EmptyState'
import { ReportGridSkeleton } from '@/components/ui/LoadingSkeleton'
import { CATEGORIES, CAMPUSES } from '@/lib/constants'
import { DataService } from '@/lib/data-service'
import type { ReportWithRelations, ReportType } from '@/types/database'

function SearchFilterContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialType = (searchParams.get('type') as ReportType) || 'all'
  const initialCategory = searchParams.get('cat') ? Number(searchParams.get('cat')) : null
  const initialCampus = searchParams.get('campus') || 'all'

  const [search, setSearch] = useState<string>(initialQuery)
  const [type, setType] = useState<ReportType | 'all'>(initialType)
  const [categoryId, setCategoryId] = useState<number | null>(initialCategory)
  const [campus, setCampus] = useState<string>(initialCampus)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false)

  const performSearch = async () => {
    setLoading(true)
    try {
      const data = await DataService.getReports({
        type: type !== 'all' ? type : undefined,
        category_id: categoryId || undefined,
        campus: campus !== 'all' ? campus : undefined,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: 'all', // filter will keep active & claim_in_progress
      })
      // Only active and claim_in_progress per F-05
      const filtered = data.filter((r) => r.status === 'active' || r.status === 'claim_in_progress')
      setReports(filtered)
    } catch (e) {
      console.error('Search error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    performSearch()
  }, [type, categoryId, campus, startDate, endDate])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const resetFilters = () => {
    setSearch('')
    setType('all')
    setCategoryId(null)
    setCampus('all')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters =
    search !== '' ||
    type !== 'all' ||
    categoryId !== null ||
    campus !== 'all' ||
    startDate !== '' ||
    endDate !== ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Pencarian & Filter Terperinci
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Temukan barang hilang atau barang temuan di seluruh area kampus Gunadarma berdasarkan kata kunci, kategori, lokasi, dan tanggal.
        </p>
      </div>

      {/* Main Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex items-center bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-1.5 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition">
          <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ketik kata kunci nama barang, ciri-ciri, atau lokasi (misal: helm bogo, stnk, dompet biru)..."
            className="w-full px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm shrink-0"
          >
            Cari Barang
          </button>
        </div>
      </form>

      {/* Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter (F-05) */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter Laporan</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Jenis Laporan */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jenis Laporan
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { id: 'all', label: 'Semua Laporan' },
                { id: 'found', label: '🔍 Ditemukan' },
                { id: 'lost', label: '🔎 Dicari' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as any)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    type === item.id
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kategori Barang
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryId(null)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  categoryId === null
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua Kategori
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    categoryId === c.id
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lokasi Kampus */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lokasi Kampus
            </label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kampus</option>
              {CAMPUSES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.address.split(',')[1]?.trim() || c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Rentang Tanggal */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Rentang Tanggal
            </label>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-400">Mulai Tanggal:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Sampai Tanggal:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Results Column */}
        <main className="lg:col-span-3 space-y-4">
          {/* Header Summary */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs">
            <div className="text-slate-600">
              Ditemukan <strong className="text-slate-900">{reports.length}</strong> laporan aktif yang cocok
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-semibold"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter ({hasActiveFilters ? 'Aktif' : 'Semua'})</span>
            </button>
          </div>

          {/* Mobile Filter Sheet */}
          {mobileFilterOpen && (
            <div className="lg:hidden bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs">Filter Mobile</span>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-xs text-rose-600 font-semibold">
                    Reset
                  </button>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jenis:</label>
                <div className="flex gap-2">
                  {['all', 'found', 'lost'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        type === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t === 'all' ? 'Semua' : t === 'found' ? 'Ditemukan' : 'Dicari'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kampus:</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-xl text-xs"
                >
                  <option value="all">Semua Kampus</option>
                  {CAMPUSES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Grid / List of Items */}
          {loading ? (
            <ReportGridSkeleton count={6} />
          ) : reports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Tidak Ada Laporan yang Cocok"
              description="Barang yang Anda cari belum ditemukan di database atau filter terlalu spesifik. Coba ubah kata kunci atau buat laporan kehilangan."
              showReportButton={true}
              reportType="lost"
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat antarmuka pencarian...</div>}>
      <SearchFilterContent />
    </Suspense>
  )
}
