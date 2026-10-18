'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { UploadCloud, X, AlertCircle, ShieldAlert, Image as ImageIcon } from 'lucide-react'
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/lib/constants'

interface PhotoUploadProps {
  onPhotoSelected: (url: string | null, file: File | null) => void
  currentUrl?: string | null
  required?: boolean
  label?: string
}

export default function PhotoUpload({
  onPhotoSelected,
  currentUrl,
  required = false,
  label = 'Foto Barang',
}: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcess = (file: File) => {
    setErrorMessage(null)

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage('Format file tidak didukung! Harap unggah foto dengan format JPG, PNG, atau WebP.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('Ukuran file melebihi batas 5 MB! Harap kompres foto Anda terlebih dahulu.')
      return
    }

    // Read as Data URL for preview and fallback storage
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewUrl(result)
      onPhotoSelected(result, file)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setErrorMessage(null)
    onPhotoSelected(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>{label}</span>
          {required ? <span className="text-rose-500">*</span> : <span className="text-xs text-slate-400 font-normal">(Opsional)</span>}
        </label>
        <span className="text-[11px] text-slate-500 font-medium">Maks. 5 MB (JPG/PNG/WebP)</span>
      </div>

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 group aspect-[16/9] max-h-72">
          <Image
            src={previewUrl}
            alt="Preview Foto Barang"
            fill
            unoptimized
            className="object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 bg-rose-600/90 hover:bg-rose-700 text-white p-2 rounded-xl backdrop-blur-md shadow-lg transition active:scale-95"
            title="Hapus foto"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Foto berhasil dipilih. Pastikan privasi dokumen terjaga.</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0])
              }
            }}
          />

          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-800 mb-1">
            Klik untuk pilih foto atau seret ke sini
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Format yang didukung: JPG, PNG, atau WebP (Maksimum 5 MB)
          </p>

          {/* Privacy Warning Guideline Box */}
          <div className="max-w-md mx-auto text-left bg-amber-50/90 border border-amber-200/90 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Panduan Privasi:</strong> Jika memotret KTM, KTP, atau dokumen, mohon samarkan nama lengkap dan nomor identitas (NIM/NIK) demi keamanan pemilik.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
