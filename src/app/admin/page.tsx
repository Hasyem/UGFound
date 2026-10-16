'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield,
  AlertTriangle,
  Flag,
  Users,
  BarChart3,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  TrendingUp,
  Clock,
  Archive,
  Search,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { DataService } from '@/lib/data-service'
import { MOCK_USERS, MOCK_FLAGS } from '@/lib/mock-data'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, CATEGORIES, CAMPUSES } from '@/lib/constants'
import type { ReportWithRelations, Tables } from '@/types/database'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user, profile, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'users' | 'analytics'>('moderation')
  const [flags, setFlags] = useState<any[]>([])
  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [users, setUsers] = useState<Tables<'users'>[]>(MOCK_USERS)
  const [stats, setStats] = useState<any>({
    totalReports: 0,
    totalFound: 0,
    totalLost: 0,
    resolvedFound: 0,
    resolutionRate: 0,
    avgResolutionHours: 0,
    openFlagsCount: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const f = await DataService.getAdminFlags()
      setFlags(f)

      const r = await DataService.getReports({ status: 'all' })
      setReports(r)

      const s = await DataService.getAdminStats()
      setStats(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Terbatas: Hanya Administrator</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Halaman ini memerlukan kredensial peran admin (F-09). Anda saat ini login sebagai{' '}
          <strong className="text-slate-800">{profile?.name || 'Tamu'}</strong> ({profile?.role || 'user'}).
        </p>
        <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-700">
          💡 Gunakan menu <strong>"Ganti Role"</strong> di bilah atas navbar lalu pilih <strong>"Admin Lost & Found UG"</strong> untuk mengakses panel ini.
        </div>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const handleHideReport = async (reportId: string) => {
    if (!confirm('Sembunyikan laporan ini dari publik?')) return
    const ok = await DataService.updateReportStatus(reportId, 'hidden', user?.id, 'Disembunyikan oleh admin')
    if (ok) {
      toast.success('Laporan berhasil disembunyikan.')
      loadAdminData()
    }
  }

  const handleRestoreReport = async (reportId: string) => {
    const ok = await DataService.updateReportStatus(reportId, 'active', user?.id, 'Dipulihkan oleh admin')
    if (ok) {
      toast.success('Laporan berhasil dipulihkan menjadi Aktif.')
      loadAdminData()
    }
  }

  const handleToggleUser = (userId: string, currentActive: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !currentActive } : u))
    )
    toast.success(
      currentActive
        ? 'Akun pengguna dinonaktifkan (tidak dapat membuat laporan).'
        : 'Akun pengguna diaktifkan kembali.'
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Panel Moderasi & Administrasi
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            UGFound • F-09 Moderasi Dasar, Antrean Laporan Pelanggaran, dan Analitik Kampus
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 transition w-fit shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* KPI Objective Banner (PRD Section 3 OKRs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolution Rate</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">KR 1 (&gt;85%)</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.resolutionRate}%</p>
          <p className="text-xs text-slate-500 mt-0.5">{stats.resolvedFound} dari {stats.totalFound} temuan selesai</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rata-rata Waktu</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">KR 2 (&lt;48 Jam)</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.avgResolutionHours || 24} Jam</p>
          <p className="text-xs text-slate-500 mt-0.5">Dari lapor hingga serah terima</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Semua Laporan</span>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalReports}</p>
          <p className="text-xs text-slate-500 mt-0.5">{stats.totalFound} Ditemukan • {stats.totalLost} Dicari</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Antrean Moderasi</span>
            <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">F-08 Flags</span>
          </div>
          <p className="text-3xl font-black text-rose-600 mt-2">{flags.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Laporan perlu ditinjau admin</p>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'moderation', label: `Antrean Moderasi (${flags.length})`, icon: Flag },
          { id: 'reports', label: `Semua Laporan (${reports.length})`, icon: Archive },
          { id: 'users', label: `Manajemen Akun (${users.length})`, icon: Users },
          { id: 'analytics', label: 'Distribusi & Analitik', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Moderation Queue (F-08 & F-09) */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Aturan Moderasi Otomatis (F-08):</strong>
              <p className="mt-0.5 text-amber-800">
                Laporan yang dilaporkan oleh 3 pengguna berbeda disembunyikan otomatis oleh sistem dari feed beranda sampai ditinjau oleh Admin di sini.
              </p>
            </div>
          </div>

          {flags.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100">
                {flags.map((flag) => (
                  <div key={flag.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Alasan: {flag.reason}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatRelativeTime(flag.created_at)}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">
                        Postingan: {flag.reports?.title || 'Laporan'}
                      </h4>

                      {flag.note && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <strong>Catatan Pelapor:</strong> "{flag.note}"
                        </p>
                      )}

                      <p className="text-[11px] text-slate-500">
                        Dilaporkan oleh: <strong>{flag.reporter?.name || 'Sivitas'}</strong> ({flag.reporter?.email})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/laporan/${flag.report_id}`}
                        target="_blank"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Periksa Postingan"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleHideReport(flag.report_id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
                      >
                        Sembunyikan Post
                      </button>

                      <button
                        onClick={() => handleRestoreReport(flag.report_id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
                      >
                        Abaikan / Pulihkan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Antrean Bersih</p>
              <p>Tidak ada postingan yang dilaporkan oleh pengguna saat ini.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Reports Management */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Barang</th>
                  <th className="p-4">Jenis</th>
                  <th className="p-4">Kategori & Lokasi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Pelapor</th>
                  <th className="p-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900 max-w-[200px] truncate">
                      {r.title}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.type === 'found' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.type === 'found' ? 'Ditemukan' : 'Dicari'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{r.categories?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {r.locations?.campus || r.location_text}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        REPORT_STATUS_COLORS[r.status]?.bg || 'bg-slate-100 text-slate-700'
                      }`}>
                        {REPORT_STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{r.users?.name || 'Sivitas'}</div>
                      <div className="text-[10px] text-slate-400">{r.users?.role}</div>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Link
                        href={`/laporan/${r.id}`}
                        target="_blank"
                        className="inline-block p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Buka Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {r.status === 'hidden' ? (
                        <button
                          onClick={() => handleRestoreReport(r.id)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold"
                        >
                          Pulihkan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHideReport(r.id)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-bold"
                        >
                          Sembunyikan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Management (F-09) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
            Admin dapat menonaktifkan akun yang melanggar ketentuan. Akun yang dinonaktifkan tidak dapat membuat laporan atau login.
          </div>
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{u.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                    {!u.is_active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                        Dinonaktifkan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{u.email} • HP: {u.phone || '-'}</p>
                </div>

                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleToggleUser(u.id, u.is_active)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      u.is_active
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Kembali'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Distribution & Analytics (PRD Metrics) */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Distribusi Laporan Berdasarkan Kategori</h3>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const count = reports.filter((r) => r.category_id === cat.id).length
                const pct = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat.icon} {cat.name}</span>
                      <span>{count} laporan ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Sebaran Lokasi Kampus</h3>
            <div className="space-y-3">
              {CAMPUSES.map((cam) => {
                const count = reports.filter((r) => r.locations?.campus === cam.name).length
                const pct = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0
                return (
                  <div key={cam.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cam.name}</span>
                      <span>{count} laporan ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}