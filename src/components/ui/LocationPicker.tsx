'use client'

import { useState, useEffect } from 'react'
import { CAMPUSES } from '@/lib/constants'
import { MapPin, Building2, Layers, Compass } from 'lucide-react'

export interface SelectedLocationData {
  campus: string
  building: string
  floor: string
  isOutside: boolean
  locationText: string
}

interface LocationPickerProps {
  onLocationChange: (data: SelectedLocationData) => void
  defaultValues?: Partial<SelectedLocationData>
}

export default function LocationPicker({
  onLocationChange,
  defaultValues,
}: LocationPickerProps) {
  const [isOutside, setIsOutside] = useState<boolean>(defaultValues?.isOutside || false)
  const [campus, setCampus] = useState<string>(defaultValues?.campus || 'Kampus D')
  const [building, setBuilding] = useState<string>(defaultValues?.building || '')
  const [floor, setFloor] = useState<string>(defaultValues?.floor || '')
  const [locationText, setLocationText] = useState<string>(defaultValues?.locationText || '')

  const currentCampusData = CAMPUSES.find((c) => c.name === campus)
  const currentBuildingData = currentCampusData?.buildings.find((b) => b.name === building)

  useEffect(() => {
    let computedText = ''
    if (isOutside) {
      computedText = locationText ? `Luar Kampus: ${locationText}` : 'Luar Kampus'
    } else {
      computedText = `${campus}${building ? ` - ${building}` : ''}${floor ? ` (${floor})` : ''}`
    }

    onLocationChange({
      campus,
      building,
      floor,
      isOutside,
      locationText: isOutside ? locationText : computedText,
    })
  }, [campus, building, floor, isOutside, locationText, onLocationChange])

  return (
    <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Lokasi Kejadian <span className="text-rose-500">*</span></span>
        </label>

        {/* Toggle Di Kampus vs Luar Kampus */}
        <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 text-xs font-semibold shadow-xs">
          <button
            type="button"
            onClick={() => setIsOutside(false)}
            className={`px-3 py-1.5 rounded-lg transition ${
              !isOutside
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Di Lingkungan Kampus UG
          </button>
          <button
            type="button"
            onClick={() => setIsOutside(true)}
            className={`px-3 py-1.5 rounded-lg transition ${
              isOutside
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Area Luar Kampus
          </button>
        </div>
      </div>

      {!isOutside ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dropdown Kampus */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-400" /> Kampus
            </label>
            <select
              value={campus}
              onChange={(e) => {
                setCampus(e.target.value)
                setBuilding('')
                setFloor('')
              }}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              required
            >
              {CAMPUSES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.address.split(',')[1]?.trim() || c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Gedung */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Gedung / Fasilitas
            </label>
            <select
              value={building}
              onChange={(e) => {
                setBuilding(e.target.value)
                setFloor('')
              }}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              required
            >
              <option value="">Pilih Gedung...</option>
              {currentCampusData?.buildings.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Lantai */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Lantai (Opsional)
            </label>
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              disabled={!building || !currentBuildingData?.floors || currentBuildingData.floors.length === 0}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">{currentBuildingData?.floors?.length ? 'Pilih Lantai...' : 'Tidak ada lantai'}</option>
              {currentBuildingData?.floors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Deskripsi Lokasi Luar Kampus <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="Contoh: Halte Margonda depan Kampus D, Jembatan Penyeberangan, atau Warkop samping kampus"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Sebutkan patokan yang jelas di sekitar area kampus Universitas Gunadarma.
          </p>
        </div>
      )}
    </div>
  )
}
