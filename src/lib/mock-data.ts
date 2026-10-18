import type { ReportWithRelations, Tables } from '@/types/database'

export const MOCK_USERS: Tables<"users">[] = [
  {
    id: "usr-admin-01",
    name: "Farras (Admin UGFound)",
    email: "farras.85.243@gmail.com",
    role: "admin",
    phone: "081234567890",
    email_verified_at: "2026-09-01T08:00:00Z",
    is_active: true,
    avatar_url: null,
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "usr-mhs-01",
    name: "Dimas Aditya Pratama",
    email: "dimas.aditya@student.gunadarma.ac.id",
    role: "mahasiswa",
    phone: "082198765432",
    email_verified_at: "2026-10-01T10:00:00Z",
    is_active: true,
    avatar_url: null,
    created_at: "2026-10-01T10:00:00Z",
  },
  {
    id: "usr-mhs-02",
    name: "Annisa Larasati",
    email: "annisa.larasati@student.gunadarma.ac.id",
    role: "mahasiswa",
    phone: "081387654321",
    email_verified_at: "2026-10-05T09:30:00Z",
    is_active: true,
    avatar_url: null,
    created_at: "2026-10-05T09:30:00Z",
  },
  {
    id: "usr-satpam-01",
    name: "Pak Bambang (Satpam Kampus D)",
    email: "bambang.keamanan@gmail.com",
    role: "satpam",
    phone: "085712345678",
    email_verified_at: "2026-09-15T07:00:00Z",
    is_active: true,
    avatar_url: null,
    created_at: "2026-09-15T07:00:00Z",
  },
  {
    id: "usr-cleaner-01",
    name: "Bu Rohani (Staf Kebersihan)",
    email: "rohani.cleaning@gmail.com",
    role: "staf_kebersihan",
    phone: "089676543210",
    email_verified_at: "2026-09-20T06:30:00Z",
    is_active: true,
    avatar_url: null,
    created_at: "2026-09-20T06:30:00Z",
  },
]

export const MOCK_REPORTS: ReportWithRelations[] = []

export const MOCK_FLAGS: any[] = []
