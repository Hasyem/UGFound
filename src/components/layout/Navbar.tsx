'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Search,
  Menu,
  X,
  PlusCircle,
  FileText,
  LogOut,
  Shield,
  User,
  ChevronDown,
} from 'lucide-react'

export default function Navbar() {
  const { user, profile, isAdmin, loading, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <>

      {/* Main Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl tracking-tighter">UG</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tracking-tight text-slate-900">UG<span className="text-blue-600">Found</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Kampus</span>
                </div>
                <p className="text-[10px] text-slate-500 -mt-0.5">Lost & Found Universitas Gunadarma</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              <Link
                href="/"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  pathname === '/'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                Beranda
              </Link>
              <Link
                href="/cari"
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition',
                  pathname === '/cari'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                <Search className="w-4 h-4" />
                Cari Barang
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition',
                    pathname === '/admin'
                      ? 'bg-white text-purple-700 shadow-xs font-semibold'
                      : 'text-purple-600 hover:text-purple-900 hover:bg-white/50'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/lapor"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/25 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Laporan</span>
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'UG'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                        {profile?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">{profile?.role || 'Mahasiswa'}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-900">{profile?.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{profile?.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Role: {profile?.role}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/laporan-saya"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            Laporan Saya
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition"
                            >
                              <Shield className="w-4 h-4 text-purple-500" />
                              Panel Moderasi Admin
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => {
                              setDropdownOpen(false)
                              signOut()
                            }}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full text-left transition"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition"
                >
                  Masuk
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/lapor"
                className="bg-blue-600 text-white p-2 rounded-lg text-xs font-semibold"
                title="Lapor"
              >
                <PlusCircle className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <nav className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Beranda
              </Link>
              <Link
                href="/cari"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Cari Barang
              </Link>
              <Link
                href="/lapor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50"
              >
                + Buat Laporan Barang
              </Link>
              <Link
                href="/laporan-saya"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Laporan Saya
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-50"
                >
                  Panel Moderasi Admin
                </Link>
              )}
            </nav>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{profile?.name}</p>
                <p className="text-slate-500">{profile?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut()
                }}
                className="text-xs text-rose-600 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50"
              >
                Keluar
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
