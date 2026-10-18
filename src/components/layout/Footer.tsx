import Link from 'next/link'
import { Shield, MapPin, Heart, Clock, AlertTriangle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg">
                UG
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                UG<span className="text-blue-400">Found</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem Pelaporan dan Pencarian Barang Hilang & Temuan Terpusat di lingkungan kampus Universitas Gunadarma (Kampus A - E). Mempercepat dan mengamankan pengembalian barang secara transparan dan terverifikasi.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>Verifikasi Berbasis Ciri Khusus Rahasia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-blue-400 transition">Beranda Laporan Terkini</Link>
              </li>
              <li>
                <Link href="/cari" className="hover:text-blue-400 transition">Pencarian & Filter Barang</Link>
              </li>
              <li>
                <Link href="/lapor?type=found" className="hover:text-blue-400 transition">Lapor Barang Ditemukan (Penemu)</Link>
              </li>
              <li>
                <Link href="/lapor?type=lost" className="hover:text-blue-400 transition">Lapor Barang Hilang (Pemilik)</Link>
              </li>
              <li>
                <Link href="/laporan-saya" className="hover:text-blue-400 transition">Kelola Laporan Saya</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition">Autentikasi Akun Kampus</Link>
              </li>
            </ul>
          </div>

          {/* SOP Penitipan Barang */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              SOP Penitipan Barang
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 leading-relaxed">
                <strong className="text-slate-200">Masa Penitipan:</strong> Barang temuan yang belum diambil dalam <span className="text-amber-300 font-semibold">7 hari</span> akan diamankan di Pos Satpam / loker resmi kampus selama <span className="text-amber-300 font-semibold">1 bulan</span>.
              </p>
              <div className="flex items-start gap-2 text-[11px] text-slate-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Pengambilan wajib menunjukkan kartu identitas & membuktikan ciri khusus rahasia.</span>
              </div>
            </div>
          </div>

          {/* Lokasi Kampus */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Jangkauan Kampus UG
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><strong className="text-slate-200">Kampus A:</strong> Kenari, Jakarta Pusat</li>
              <li><strong className="text-slate-200">Kampus B:</strong> Salemba Raya, Jakarta Pusat</li>
              <li><strong className="text-slate-200">Kampus C:</strong> Salemba Tengah, Jakarta Pusat</li>
              <li><strong className="text-slate-200">Kampus D:</strong> Jl. Margonda Raya No. 100, Depok</li>
              <li><strong className="text-slate-200">Kampus E:</strong> Kelapa Dua, Cimanggis, Depok</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} UGFound — Universitas Gunadarma. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>untuk Komunitas Sivitas Akademika UG</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
