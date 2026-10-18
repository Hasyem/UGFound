'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  PlusCircle,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import ReportCard from '@/components/ui/ReportCard'
import EmptyState from '@/components/ui/EmptyState'
import { ReportGridSkeleton } from '@/components/ui/LoadingSkeleton'
import { CATEGORIES, CAMPUSES } from '@/lib/constants'
import { DataService } from '@/lib/data-service'
import type { ReportWithRelations, ReportType } from '@/types/database'

export default function HomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ReportType>('found')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedCampus, setSelectedCampus] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [stats, setStats] = useState({
    totalReports: 0,
    totalFound: 0,
    totalLost: 0,
    resolvedFound: 0,
    resolutionRate: 85,
    avgResolutionHours: 24,
  })
  const [visibleCount, setVisibleCount] = useState<number>(20)

  const fetchFeed = async () => {
    try {
      setLoading(true)
      const data = await DataService.getReports({
        type: activeTab,
        category_id: selectedCategory || undefined,
        campus: selectedCampus !== 'all' ? selectedCampus : undefined,
        search: searchKeyword || undefined,
      })
      setReports(data)

      const s = await DataService.getAdminStats()
      setStats(s)
    } catch (e) {
      console.error('Error fetching feed:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
    // Poll every 10 seconds for real-time requirement (F-02: maksimal 10 detik tanpa refresh manual)
    const interval = setInterval(() => {
      DataService.getReports({
        type: activeTab,
        category_id: selectedCategory || undefined,
        campus: selectedCampus !== 'all' ? selectedCampus : undefined,
        search: searchKeyword || undefined,
      }).then((newData) => {
        setReports(newData)
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [activeTab, selectedCategory, selectedCampus, searchKeyword])

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchKeyword.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const paginatedReports = useMemo(() => {
    return reports.slice(0, visibleCount)
  }, [reports, visibleCount])

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Platform Terpadu Lost & Found Universitas Gunadarma</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Kembalikan Barang Hilang, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-300">
              Lebih Cepat & Transparan.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Menghubungkan penemu dan pemilik barang di seluruh lingkungan Kampus A, B, C, D, dan E Gunadarma dengan verifikasi ciri khusus rahasia.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-1.5 focus-within:ring-4 focus-within:ring-blue-500/30 transition">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari barang (misal: KTM TI, Kunci Vario, Charger ROG, Jaket)..."
                className="w-full px-3 py-2.5 text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 shadow-sm"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/lapor?type=found"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Saya Menemukan Barang</span>
            </Link>

            <Link
              href="/lapor?type=lost"
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-900/40 transition active:scale-95"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Saya Kehilangan Barang</span>
            </Link>
          </div>
        </div>

        {/* Real-time Campus Metrics Banner */}
        <div className="relative max-w-5xl mx-auto mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4" /> Tingkat Keberhasilan
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats.resolutionRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tingkat Pengembalian (&gt;85%)</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" /> Waktu Pengembalian
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">&lt; {stats.avgResolutionHours || 24} Jam</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Rata-rata Waktu Kembali</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-indigo-400 text-xs font-semibold mb-1">Barang Ditemukan</div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalFound}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Diamankan & Terdata</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-amber-400 text-xs font-semibold mb-1">Barang Dicari</div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalLost}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dalam Pencarian Aktif</p>
          </div>
        </div>
      </section>

      {/* Main Feed Section (F-02) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Feed Header with Tabs and Live Pulse */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Feed Laporan Terkini
              </h2>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Sync (10s)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan laporan terbaru di seluruh kampus Universitas Gunadarma
            </p>
          </div>

          {/* Ditemukan vs Dicari Segmented Control */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('found')
                setVisibleCount(20)
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ditemukan</span>
              <span className={`text-[11px] px-2 py-0.2 rounded-full ${activeTab === 'found' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-300 text-slate-700'}`}>
                {reports.filter((r) => r.type === 'found').length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('lost')
                setVisibleCount(20)
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'lost'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Mencari Barang</span>
              <span className={`text-[11px] px-2 py-0.2 rounded-full ${activeTab === 'lost' ? 'bg-amber-700 text-amber-100' : 'bg-slate-300 text-slate-700'}`}>
                {reports.filter((r) => r.type === 'lost').length}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Category Pills & Campus Selector */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Category Filter Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedCategory === null
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Kategori
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Campus Selector */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs w-full sm:w-auto"
            >
              <option value="all">Semua Kampus (A - E)</option>
              {CAMPUSES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Cards Grid */}
        {loading ? (
          <ReportGridSkeleton count={6} />
        ) : paginatedReports.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {paginatedReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Pagination Load More Button (F-02: 20 per page) */}
            {reports.length > visibleCount && (
              <div className="text-center pt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition active:scale-95 text-xs sm:text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Muat Lebih Banyak ({reports.length - visibleCount} laporan tersisa)</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={activeTab === 'found' ? 'Belum Ada Barang Ditemukan' : 'Belum Ada Laporan Barang Dicari'}
            description="Tidak ada barang aktif yang sesuai dengan kategori atau lokasi yang Anda pilih saat ini."
            reportType={activeTab}
          />
        )}
      </section>

      {/* Campus Lost & Found Information & Workflow Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-10 border border-blue-100">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Alur Pengembalian Barang</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Bagaimana Sistem UGFound Bekerja?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Didesain khusus untuk sivitas akademika Universitas Gunadarma demi mencegah klaim palsu dan mempercepat serah terima barang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Laporkan Cepat & Titipkan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penemu mengunggah foto, menentukan lokasi ditemukan, dan menitipkan barang ke <strong>Pos Satpam</strong> atau loker resmi kampus terdekat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Ciri Khusus Rahasia</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penemu menyimpan <strong>ciri khusus tersembunyi</strong> (hanya dilihat pembuat & admin) yang wajib disebutkan pemilik asli saat proses klaim.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Serah Terima & Tandai Selesai</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pemilik menunjukkan KTM/identitas di lokasi penitipan, mencocokkan ciri khusus, lalu laporan ditandai <strong>Selesai</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
