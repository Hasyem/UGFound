export const CATEGORIES = [
  { id: 1, name: 'Elektronik', icon: '💻' },
  { id: 2, name: 'Dokumen/KTM', icon: '📄' },
  { id: 3, name: 'Kunci', icon: '🔑' },
  { id: 4, name: 'Pakaian', icon: '👕' },
  { id: 5, name: 'Dompet/Tas', icon: '👜' },
  { id: 6, name: 'Lainnya', icon: '📦' },
] as const

export const CAMPUSES = [
  {
    name: 'Kampus A',
    address: 'Jl. Kenari No. 13, Jakarta Pusat',
    buildings: [
      { name: 'Gedung 1', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'] },
      { name: 'Gedung 2', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3'] },
      { name: 'Perpustakaan', floors: ['Lantai 1', 'Lantai 2'] },
      { name: 'Kantin', floors: [] },
      { name: 'Pos Satpam', floors: [] },
    ],
  },
  {
    name: 'Kampus B',
    address: 'Jl. Salemba Raya No. 53, Jakarta Pusat',
    buildings: [
      { name: 'Gedung 1', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'] },
      { name: 'Gedung 2', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3'] },
      { name: 'Kantin', floors: [] },
      { name: 'Mushola', floors: [] },
      { name: 'Pos Satpam', floors: [] },
    ],
  },
  {
    name: 'Kampus C',
    address: 'Jl. Salemba Tengah No. 36, Jakarta Pusat',
    buildings: [
      { name: 'Gedung 1', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'] },
      { name: 'Lab Komputer', floors: ['Lantai 1', 'Lantai 2'] },
      { name: 'Kantin', floors: [] },
      { name: 'Pos Satpam', floors: [] },
    ],
  },
  {
    name: 'Kampus D',
    address: 'Jl. Margonda Raya No. 100, Pondok Cina, Depok',
    buildings: [
      { name: 'Gedung 1', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4', 'Lantai 5'] },
      { name: 'Gedung 2', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'] },
      { name: 'Gedung 3', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3'] },
      { name: 'Gedung 4', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3'] },
      { name: 'Perpustakaan Pusat', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3'] },
      { name: 'Auditorium', floors: ['Lantai 1', 'Lantai 2'] },
      { name: 'Kantin Utama', floors: [] },
      { name: 'Masjid Darul Ilmi', floors: ['Lantai 1', 'Lantai 2'] },
      { name: 'Pos Satpam Utama Margonda', floors: [] },
      { name: 'Pos Satpam Belakang', floors: [] },
    ],
  },
  {
    name: 'Kampus E',
    address: 'Jl. Akses UI, Kelapa Dua, Cimanggis, Depok',
    buildings: [
      { name: 'Gedung 1', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'] },
      { name: 'Gedung 2', floors: ['Lantai 1', 'Lantai 2', 'Lantai 3'] },
      { name: 'Gedung 3', floors: ['Lantai 1', 'Lantai 2'] },
      { name: 'Kantin', floors: [] },
      { name: 'Pos Satpam Kelapa Dua', floors: [] },
    ],
  },
] as const

export const REPORT_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  claim_in_progress: 'Proses Klaim',
  resolved: 'Selesai',
  stored: 'Diamankan Satpam',
  hidden: 'Disembunyikan',
}

export const REPORT_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' },
  claim_in_progress: { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' },
  resolved: { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' },
  stored: { bg: 'bg-purple-50 text-purple-700', text: 'text-purple-700', border: 'border-purple-200' },
  hidden: { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' },
}

export const CATEGORY_ICONS: Record<number, string> = {
  1: '💻',
  2: '📄',
  3: '🔑',
  4: '👕',
  5: '👜',
  6: '📦',
}

export const USER_ROLES = [
  { value: 'mahasiswa', label: 'Mahasiswa (NIM Gunadarma)' },
  { value: 'dosen', label: 'Dosen / Tenaga Pendidik' },
  { value: 'staf_kebersihan', label: 'Staf Kebersihan / Cleaning' },
  { value: 'satpam', label: 'Petugas Satpam / Keamanan' },
  { value: 'admin', label: 'Administrator Sistem' },
] as const

export const FLAG_REASONS = [
  { value: 'spam', label: 'Spam / Iklan tidak relevan' },
  { value: 'tidak_pantas', label: 'Konten atau foto tidak pantas' },
  { value: 'data_pribadi', label: 'Membocorkan data pribadi tanpa sensor (NIK/NIM terbuka)' },
  { value: 'lainnya', label: 'Lainnya / Kecurigaan penipuan' },
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const REPORTS_PER_PAGE = 20
