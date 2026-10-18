import { createClient } from '@/lib/supabase/client'
import { MOCK_REPORTS, MOCK_USERS, MOCK_FLAGS } from './mock-data'
import type { ReportWithRelations, ReportType, ReportStatus, Tables, FlagReason } from '@/types/database'

const LOCAL_STORAGE_KEY = 'ugfound_reports_v2'
const LOCAL_FLAGS_KEY = 'ugfound_flags_v2'
const LOCAL_USERS_KEY = 'ugfound_users_v1'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('your_') && !url.includes('example.com')
}

// Local storage helpers for smooth demo / offline / non-configured environments
function getLocalReports(): ReportWithRelations[] {
  if (typeof window === 'undefined') return MOCK_REPORTS
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_REPORTS))
      return MOCK_REPORTS
    }
    return JSON.parse(data)
  } catch {
    return MOCK_REPORTS
  }
}

function saveLocalReports(reports: ReportWithRelations[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

function getLocalFlags() {
  if (typeof window === 'undefined') return MOCK_FLAGS
  try {
    const data = localStorage.getItem(LOCAL_FLAGS_KEY)
    if (!data) {
      localStorage.setItem(LOCAL_FLAGS_KEY, JSON.stringify(MOCK_FLAGS))
      return MOCK_FLAGS
    }
    return JSON.parse(data)
  } catch {
    return MOCK_FLAGS
  }
}

function saveLocalFlags(flags: any[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_FLAGS_KEY, JSON.stringify(flags))
  } catch (e) {
    console.error('Failed to save flags to localStorage:', e)
  }
}

function getLocalUsers(): Tables<'users'>[] {
  if (typeof window === 'undefined') return MOCK_USERS
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY)
    if (!data) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(MOCK_USERS))
      return MOCK_USERS
    }
    return JSON.parse(data)
  } catch {
    return MOCK_USERS
  }
}

function saveLocalUsers(users: Tables<'users'>[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  } catch (e) {
    console.error('Failed to save users to localStorage:', e)
  }
}

export interface ReportFilterOptions {
  type?: ReportType | 'all'
  category_id?: number
  campus?: string
  search?: string
  status?: ReportStatus | 'all'
  startDate?: string
  endDate?: string
  userId?: string
}

export const DataService = {
  isLive: isSupabaseConfigured(),

  async getReports(options: ReportFilterOptions = {}): Promise<ReportWithRelations[]> {
    if (this.isLive) {
      const supabase = createClient()
      let query = (supabase as any)
        .from('reports')
        .select(`
          *,
          users (*),
          categories (*),
          locations (*)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (options.type && options.type !== 'all') {
        query = query.eq('type', options.type)
      }

      if (options.status && options.status !== 'all') {
        query = query.eq('status', options.status)
      } else {
        // By default, only active and claim_in_progress in public feeds
        query = query.in('status', ['active', 'claim_in_progress'])
      }

      if (options.category_id) {
        query = query.eq('category_id', options.category_id)
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId)
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }

      const { data, error } = await query
      if (!error && data) {
        let results = data as unknown as ReportWithRelations[]
        if (options.campus) {
          results = results.filter((r) => r.locations?.campus === options.campus)
        }
        return results
      }
    }

    // Fallback to local / mock
    let reports = getLocalReports().filter((r) => !r.deleted_at)

    if (options.userId) {
      reports = reports.filter((r) => r.user_id === options.userId)
    } else {
      if (options.status && options.status !== 'all') {
        reports = reports.filter((r) => r.status === options.status)
      } else {
        reports = reports.filter((r) => r.status === 'active' || r.status === 'claim_in_progress')
      }
    }

    if (options.type && options.type !== 'all') {
      reports = reports.filter((r) => r.type === options.type)
    }

    if (options.category_id) {
      reports = reports.filter((r) => r.category_id === options.category_id)
    }

    if (options.campus) {
      reports = reports.filter((r) => r.locations?.campus === options.campus)
    }

    if (options.search) {
      const q = options.search.toLowerCase()
      reports = reports.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.location_text && r.location_text.toLowerCase().includes(q))
      )
    }

    if (options.startDate) {
      reports = reports.filter((r) => new Date(r.event_at) >= new Date(options.startDate!))
    }

    if (options.endDate) {
      reports = reports.filter((r) => new Date(r.event_at) <= new Date(options.endDate!))
    }

    return reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  async getReportById(id: string): Promise<ReportWithRelations | null> {
    if (this.isLive) {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('reports')
        .select(`
          *,
          users (*),
          categories (*),
          locations (*)
        `)
        .eq('id', id)
        .single()

      if (!error && data) {
        return data as unknown as ReportWithRelations
      }
    }

    const reports = getLocalReports()
    return reports.find((r) => r.id === id) || null
  },

  async createReport(reportData: Partial<ReportWithRelations>): Promise<ReportWithRelations> {
    const newReport: ReportWithRelations = {
      id: 'rep-' + Date.now(),
      user_id: reportData.user_id || 'usr-mhs-01',
      type: reportData.type || 'found',
      category_id: reportData.category_id || 1,
      location_id: reportData.location_id || null,
      location_text: reportData.location_text || null,
      event_at: reportData.event_at || new Date().toISOString(),
      title: reportData.title || 'Laporan Barang',
      description: reportData.description || '',
      photo_url: reportData.photo_url || null,
      safe_location: reportData.safe_location || null,
      hidden_features: reportData.hidden_features || null,
      contact: reportData.contact || null,
      status: 'active',
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      categories: reportData.categories || { id: reportData.category_id || 1, name: 'Umum' },
      locations: reportData.locations || null,
      users: reportData.users || MOCK_USERS[1],
    }

    if (this.isLive) {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('reports')
        .insert({
          user_id: newReport.user_id,
          type: newReport.type,
          category_id: newReport.category_id,
          location_id: newReport.location_id,
          location_text: newReport.location_text,
          event_at: newReport.event_at,
          title: newReport.title,
          description: newReport.description,
          photo_url: newReport.photo_url,
          safe_location: newReport.safe_location,
          hidden_features: newReport.hidden_features,
          contact: newReport.contact,
          status: 'active',
        })
        .select(`*, users(*), categories(*), locations(*)`)
        .single()

      if (!error && data) {
        return data as unknown as ReportWithRelations
      }
    }

    const current = getLocalReports()
    const updated = [newReport, ...current]
    saveLocalReports(updated)
    return newReport
  },

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    adminId?: string,
    note?: string
  ): Promise<boolean> {
    const resolved_at = status === 'resolved' ? new Date().toISOString() : null

    if (this.isLive) {
      const supabase = createClient()
      const updatePayload: any = { status, updated_at: new Date().toISOString() }
      if (status === 'resolved') {
        updatePayload.resolved_at = resolved_at
      } else if (status === 'active') {
        updatePayload.resolved_at = null
      }

      const { error } = await (supabase as any)
        .from('reports')
        .update(updatePayload)
        .eq('id', id)

      if (!error) {
        if (adminId) {
          await (supabase as any).from('admin_actions').insert({
            admin_id: adminId,
            action: status === 'hidden' ? 'hide_report' : 'restore_report',
            target_report_id: id,
            note: note || `Status diubah menjadi ${status}`,
          })
        }
        return true
      }
    }

    const reports = getLocalReports()
    const index = reports.findIndex((r) => r.id === id)
    if (index !== -1) {
      reports[index] = {
        ...reports[index],
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : reports[index].resolved_at,
        updated_at: new Date().toISOString(),
      }
      saveLocalReports(reports)
      return true
    }
    return false
  },

  async reopenReport(id: string, userId: string): Promise<{ success: boolean; message: string }> {
    const report = await this.getReportById(id)
    if (!report) return { success: false, message: 'Laporan tidak ditemukan' }
    if (report.user_id !== userId && !userId.includes('admin')) {
      return { success: false, message: 'Hanya pembuat laporan atau admin yang dapat membuka kembali laporan ini' }
    }

    if (report.resolved_at) {
      const resolvedTime = new Date(report.resolved_at).getTime()
      const now = Date.now()
      const diffHours = (now - resolvedTime) / (1000 * 60 * 60)
      if (diffHours > 24) {
        return {
          success: false,
          message: 'Batas waktu pembukaan kembali laporan adalah 24 jam setelah ditandai selesai.',
        }
      }
    }

    await this.updateReportStatus(id, 'active')
    return { success: true, message: 'Laporan berhasil dibuka kembali dan aktif di feed.' }
  },

  async flagReport(
    reportId: string,
    reporterId: string,
    reason: FlagReason,
    note?: string
  ): Promise<{ success: boolean; message: string }> {
    const flagId = 'flag-' + Date.now()
    const newFlag = {
      id: flagId,
      report_id: reportId,
      reporter_id: reporterId,
      reason,
      note: note || null,
      status: 'open' as const,
      created_at: new Date().toISOString(),
    }

    if (this.isLive) {
      const supabase = createClient()
      const { error } = await (supabase as any).from('report_flags').insert(newFlag)
      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'Anda sudah pernah melaporkan postingan ini.' }
        }
        return { success: false, message: 'Gagal mengirim laporan: ' + error.message }
      }

      // Check count of flags from distinct users
      const { count } = await (supabase as any)
        .from('report_flags')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', reportId)

      if (count && count >= 3) {
        await (supabase as any)
          .from('reports')
          .update({ status: 'hidden' })
          .eq('id', reportId)
      }

      return {
        success: true,
        message: 'Laporan berhasil dikirim. Tim admin akan segera meninjau postingan ini.',
      }
    }

    const flags = getLocalFlags()
    const alreadyFlagged = flags.some((f: any) => f.report_id === reportId && f.reporter_id === reporterId)
    if (alreadyFlagged) {
      return { success: false, message: 'Anda sudah pernah melaporkan postingan ini.' }
    }

    flags.push(newFlag)
    saveLocalFlags(flags)

    // Check count for auto-hide
    const distinctReporters = new Set(
      flags.filter((f: any) => f.report_id === reportId).map((f: any) => f.reporter_id)
    )

    if (distinctReporters.size >= 3) {
      await this.updateReportStatus(reportId, 'hidden')
    }

    return {
      success: true,
      message: 'Laporan berhasil dikirim ke antrean moderasi admin.',
    }
  },

  async getAdminStats() {
    const reports = getLocalReports()
    const totalFound = reports.filter((r) => r.type === 'found').length
    const resolvedFound = reports.filter((r) => r.type === 'found' && r.status === 'resolved').length
    const resolutionRate = totalFound > 0 ? Math.round((resolvedFound / totalFound) * 100) : 0

    // Average resolution time in hours
    const resolvedWithTime = reports.filter((r) => r.resolved_at && r.created_at)
    let avgHours = 0
    if (resolvedWithTime.length > 0) {
      const totalHours = resolvedWithTime.reduce((acc, r) => {
        const start = new Date(r.created_at).getTime()
        const end = new Date(r.resolved_at!).getTime()
        return acc + Math.max(0, (end - start) / (1000 * 60 * 60))
      }, 0)
      avgHours = Math.round(totalHours / resolvedWithTime.length)
    }

    const flags = getLocalFlags().filter((f: any) => f.status === 'open')

    return {
      totalReports: reports.length,
      totalFound,
      totalLost: reports.filter((r) => r.type === 'lost').length,
      resolvedFound,
      resolutionRate,
      avgResolutionHours: avgHours,
      openFlagsCount: flags.length,
    }
  },

  async getAdminFlags() {
    if (this.isLive) {
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('report_flags')
        .select(`*, reports (*), reporter:users (*)`)
        .order('created_at', { ascending: false })
      if (data) return data
    }
    return getLocalFlags()
  },

  async getUsers(): Promise<Tables<'users'>[]> {
    if (this.isLive) {
      const supabase = createClient()
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
      if (data) return data
    }
    return getLocalUsers()
  },

  async getUserByEmail(email: string): Promise<Tables<'users'> | null> {
    const cleanEmail = email.toLowerCase().trim()
    if (this.isLive) {
      const supabase = createClient()
      const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).single()
      if (data) return data
    }
    const users = getLocalUsers()
    return users.find((u) => u.email.toLowerCase().trim() === cleanEmail) || null
  },

  async authenticateUser(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: Tables<'users'>; message: string }> {
    const cleanEmail = email.toLowerCase().trim()

    if (!password) {
      return { success: false, message: 'Password wajib diisi untuk masuk ke akun!' }
    }

    // 1. Role Admin Verification: farras.85.243@gmail.com atau far99905@gmail.com
    if (cleanEmail === 'farras.85.243@gmail.com' || cleanEmail === 'far99905@gmail.com') {
      const users = getLocalUsers()
      const existingAdmin = users.find((u) => u.email.toLowerCase().trim() === cleanEmail)
      const validAdminPass = existingAdmin?.password || 'FAS99905'

      if (password !== validAdminPass && password !== 'FAZ99905' && password !== 'FAS99905') {
        return { success: false, message: 'Password untuk akun Administrator salah!' }
      }

      const adminUser: Tables<'users'> = {
        id: '00000000-0000-0000-0000-000000000001',
        email: cleanEmail,
        name: existingAdmin?.name || 'Farras (Admin UGFound)',
        role: 'admin',
        phone: existingAdmin?.phone || '081234567890',
        email_verified_at: new Date().toISOString(),
        is_active: true,
        avatar_url: null,
        created_at: existingAdmin?.created_at || '2026-09-01T08:00:00Z',
        password: password,
      }
      await this.createOrUpdateUser(adminUser)
      return { success: true, user: adminUser, message: 'Selamat datang kembali, Administrator!' }
    }

    // 2. Cek pengguna terdaftar
    const existing = await this.getUserByEmail(cleanEmail)
    if (!existing) {
      return {
        success: false,
        message: 'Akun dengan email ini belum terdaftar. Silakan daftar akun baru terlebih dahulu.',
      }
    }

    if (!existing.is_active) {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh Administrator.' }
    }

    // Verifikasi kecocokan password jika pengguna sudah menetapkan password
    if (existing.password && existing.password !== password) {
      return {
        success: false,
        message: 'Password yang Anda masukkan salah. Periksa kembali password Anda!',
      }
    }

    return { success: true, user: existing, message: `Selamat datang kembali, ${existing.name}!` }
  },

  async createOrUpdateUser(userData: Partial<Tables<'users'>> & { email: string }): Promise<Tables<'users'>> {
    const cleanEmail = userData.email.toLowerCase().trim()
    const users = getLocalUsers()
    const existingIndex = users.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail)

    let updatedUser: Tables<'users'>
    if (existingIndex >= 0) {
      updatedUser = {
        ...users[existingIndex],
        ...userData,
        email: cleanEmail,
        password: userData.password !== undefined ? userData.password : users[existingIndex].password,
      }
      users[existingIndex] = updatedUser
    } else {
      updatedUser = {
        id: userData.id || (cleanEmail === 'farras.85.243@gmail.com' || cleanEmail === 'far99905@gmail.com' ? '00000000-0000-0000-0000-000000000001' : 'usr-' + Date.now()),
        email: cleanEmail,
        name: userData.name || (cleanEmail === 'farras.85.243@gmail.com' || cleanEmail === 'far99905@gmail.com' ? 'Farras (Admin UGFound)' : cleanEmail.split('@')[0].replace('.', ' ').toUpperCase()),
        role: (cleanEmail === 'farras.85.243@gmail.com' || cleanEmail === 'far99905@gmail.com') ? 'admin' : (userData.role || 'mahasiswa'),
        phone: userData.phone || null,
        email_verified_at: userData.email_verified_at || new Date().toISOString(),
        is_active: true,
        avatar_url: userData.avatar_url || null,
        created_at: userData.created_at || new Date().toISOString(),
        password: userData.password || null,
      }
      users.push(updatedUser)
    }

    saveLocalUsers(users)

    if (this.isLive) {
      try {
        const supabase = createClient()
        await (supabase as any).from('users').upsert(updatedUser)
      } catch (err) {
        console.error('Failed to sync user with Supabase:', err)
      }
    }

    return updatedUser
  },
}