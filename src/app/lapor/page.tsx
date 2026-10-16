'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  HelpCircle,
  Clock,
  Tag,
  Lock,
  Phone,
  Send,
  AlertTriangle,
  Info,
} from 'lucide-react'
import LocationPicker, { type SelectedLocationData } from '@/components/ui/LocationPicker'
import PhotoUpload from '@/components/ui/PhotoUpload'
import { CATEGORIES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { DataService } from '@/lib/data-service'
import type { ReportType } from '@/types/database'
import toast from 'react-hot-toast'

function CreateReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = (searchParams.get('type') as ReportType) || 'found'

  const { user, profile } = useAuth()

  const [type, setType] = useState<ReportType>(initialType)
  const [title, setTitle] = useState<string>('')
  const [categoryId, setCategoryId] = useState<number>(1)
  const [eventAt, setEventAt] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  )
  const [description, setDescription] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [safeLocation, setSafeLocation] = useState<string>('')
  const [hiddenFeatures, setHiddenFeatures] = useState<string>('')
  const [contact, setContact] = useState<string>(profile?.phone || profile?.email || '')
  const [locationData, setLocationData] = useState<SelectedLocationData>({
    campus: 'Kampus D',
    building: '',
    floor: '',
    isOutside: false,
    locationText: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<boolean>(false)

  const isFound = type === 'found'

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!title.trim()) {
      errs.title = 'Nama/judul barang wajib diisi'
    }

    if (!categoryId) {
      errs.category = 'Kategori barang wajib dipilih'
    }

    if (!eventAt) {
      errs.eventAt = 'Waktu kejadian wajib diisi'
    } else {
      const selectedTime = new Date(eventAt).getTime()
      if (selectedTime > Date.now()) {
        errs.eventAt = 'Tanggal dan waktu tidak boleh di masa depan'
      }
    }

    if (!description.trim()) {
      errs.description = 'Deskripsi barang wajib diisi secara informatif'
    } else if (description.trim().length < 10) {
      errs.description = 'Deskripsi terlalu pendek (minimal 10 karakter)'
    }

    if (isFound) {
      if (!photoUrl) {
        errs.photo = 'Foto barang temuan wajib diunggah untuk dokumentasi'
      }
      if (!safeLocation.trim()) {
        errs.safeLocation = 'Lokasi barang diamankan wajib diisi (mis. Pos Satpam Kampus D)'
      }
    }

    if (locationData.isOutside) {
      if (!locationData.locationText.trim()) {
        errs.location = 'Deskripsi lokasi luar kampus wajib diisi'
      }
    } else {
      if (!locationData.building) {
        errs.location = 'Gedung/Fasilitas kampus wajib dipilih'
      }
    }

    if (!contact.trim()) {
      errs.contact = 'Nomor WhatsApp atau kontak pelapor wajib diisi'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Harap lengkapi seluruh kolom wajib yang bertanda bintang (*)')
      return
    }

    setSubmitting(true)

    try {
      const catObj = CATEGORIES.find((c) => c.id === categoryId)

      const created = await DataService.createReport({
        user_id: user?.id || 'usr-mhs-01',
        type,
        title: title.trim(),
        category_id: categoryId,
        event_at: new Date(eventAt).toISOString(),
        description: description.trim(),
        photo_url: photoUrl,
        safe_location: isFound ? safeLocation.trim() : null,
        hidden_features: isFound && hiddenFeatures.trim() ? hiddenFeatures.trim() : null,
        contact: contact.trim(),
        location_text: locationData.locationText,
        categories: { id: categoryId, name: catObj?.name || 'Lainnya' },
        locations: !locationData.isOutside
          ? {
              id: 99,
              campus: locationData.campus,
              building: locationData.building,
              floor: locationData.floor || null,
              is_active: true,
            }
          : null,
        users: profile || undefined,
      })

      toast.success(
        isFound
          ? 'Laporan barang temuan berhasil dibuat & aktif di feed!'
          : 'Laporan barang hilang berhasil dikirim ke feed Dicari!'
      )

      router.push(`/laporan/${created.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan laporan. Coba beberapa saat lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Formulir Pelaporan Barang
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sistem Lost & Found Universitas Gunadarma • Pilih jenis laporan yang ingin Anda buat.
        </p>
      </div>

      {/* Segmented Type Selector: Ditemukan vs Dicari */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
        <button
          type="button"
          onClick={() => {
            setType('found')
            setErrors({})
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
            isFound
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Lapor Barang Ditemukan (Penemu)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setType('lost')
            setErrors({})
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
            !isFound
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Lapor Barang Hilang (Pemilik)</span>
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* Banner Guidance */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
            isFound
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>{isFound ? 'Tips untuk Penemu Barang:' : 'Tips untuk yang Kehilangan:'}</strong>
            <p className="mt-0.5">
              {isFound
                ? 'Unggah foto barang dengan jelas, tentukan lokasi barang sekarang diamankan (misal dititipkan ke Pos Satpam Kampus), dan tambahkan ciri rahasia agar hanya pemilik asli yang bisa mengambil.'
                : 'Jelaskan barang Anda secara mendetail dan sebutkan perkiraan lokasi serta jam terakhir terlihat di area kampus Gunadarma.'}
            </p>
          </div>
        </div>

        {/* Judul Barang */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            Nama / Judul Barang <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isFound
                ? 'Contoh: KTM Gunadarma Sistem Informasi, Kunci Motor Vario, Helm Bogo Hitam'
                : 'Contoh: Charger ASUS ROG Type-C, Dompet Kulit Cokelat, Flashdisk Sandisk'
            }
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {errors.title && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.title}</p>}
        </div>

        {/* Kategori & Waktu Kejadian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" /> Kategori Barang <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{isFound ? 'Waktu Ditemukan' : 'Waktu Terakhir Terlihat'} <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="datetime-local"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {errors.eventAt && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.eventAt}</p>}
          </div>
        </div>

        {/* Location Picker (F-03 & F-04 Dropdown Terstruktur) */}
        <LocationPicker
          onLocationChange={setLocationData}
          defaultValues={locationData}
        />
        {errors.location && <p className="text-[11px] text-rose-600 font-semibold">{errors.location}</p>}

        {/* Deskripsi Umum */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
            Deskripsi Umum Barang <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={
              isFound
                ? 'Jelaskan kondisi umum barang, warna, merek, dan konteks saat Anda menemukannya di kampus...'
                : 'Jelaskan secara detail spesifikasi barang Anda yang hilang, ciri khas, dan aktivitas Anda sebelum menyadari kehilangan...'
            }
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {errors.description && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.description}</p>}
        </div>

        {/* Photo Upload (F-03 Mandatory for found, F-04 Optional for lost) */}
        <div>
          <PhotoUpload
            required={isFound}
            label={isFound ? 'Foto Barang Temuan (Wajib)' : 'Foto Referensi Barang (Opsional)'}
            onPhotoSelected={(url) => setPhotoUrl(url)}
            currentUrl={photoUrl}
          />
          {errors.photo && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.photo}</p>}
        </div>

        {/* F-03 Khusus Barang Ditemukan: Lokasi Barang Diamankan & Ciri Khusus Tersembunyi */}
        {isFound && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Lokasi Diamankan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Lokasi Barang Diamankan / Dititipkan <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                value={safeLocation}
                onChange={(e) => setSafeLocation(e.target.value)}
                placeholder="Misal: Pos Satpam Utama Margonda Kampus D, Loker Prodi TI, atau Dititipkan ke Pak Bambang Satpam"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Lokasi fisik di mana pemilik dapat mendatangi dan mengambil barang ini secara langsung.
              </p>
              {errors.safeLocation && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.safeLocation}</p>}
            </div>

            {/* Ciri Khusus Tersembunyi (Hidden Features) */}
            <div className="bg-purple-50/70 border border-purple-200/80 p-5 rounded-2xl space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Ciri Khusus Tersembunyi (Rahasia & Opsional)</span>
              </label>
              <textarea
                value={hiddenFeatures}
                onChange={(e) => setHiddenFeatures(e.target.value)}
                rows={3}
                placeholder="Contoh: Ada stiker lab di belakang, baret di pojok kanan bawah, isi dompet berupa kartu flash berstiker kucing, dsb."
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-start gap-2 text-[11px] text-purple-800">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Hanya Anda dan Admin yang dapat melihat ini!</strong> Kolom ini TIDAK AKAN PERNAH ditampilkan di halaman publik. Gunakan untuk mencocokkan identitas pemilik asli saat verifikasi serah terima.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Kontak Pelapor */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Kontak Pelapor (WhatsApp / Telepon) <span className="text-rose-500">*</span></span>
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contoh: 0812-3456-7890 (WhatsApp)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            🔒 Demi privasi, kontak Anda hanya akan ditampilkan kepada sivitas akademika yang telah login.
          </p>
          {errors.contact && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.contact}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            href="/"
            className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50 ${
              isFound
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/30'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/30'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Menyimpan Laporan...' : isFound ? 'Terbitkan Laporan Temuan' : 'Terbitkan Laporan Kehilangan'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default function CreateReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat formulir pelaporan...</div>}>
      <CreateReportForm />
    </Suspense>
  )
}
