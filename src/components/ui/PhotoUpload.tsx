'use client'

import { useState, useRef, useId } from 'react'
import Image from 'next/image'
import { UploadCloud, X, AlertCircle, ShieldAlert, Image as ImageIcon, CheckCircle2, RefreshCw } from 'lucide-react'

interface PhotoUploadProps {
  onPhotoSelected: (url: string | null, file: File | null) => void
  currentUrl?: string | null
  required?: boolean
  label?: string
}

/**
 * Client-side canvas image compressor & resizer.
 * Resizes large images (up to 20MB) to max 1200px width/height and compresses to optimized JPEG (~100KB),
 * preventing browser localStorage quota exceeded errors and ensuring instant page loads.
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not in browser environment, fallback to reader
    if (typeof window === 'undefined' || !window.FileReader) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onerror = (err) => reject(err)
    reader.onload = (event) => {
      const img = new window.Image()
      img.onerror = () => resolve(event.target?.result as string)
      img.onload = () => {
        try {
          const maxWidth = 1200
          const maxHeight = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(event.target?.result as string)
            return
          }

          // Draw and compress to quality 0.8 JPEG
          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(dataUrl)
        } catch {
          resolve(event.target?.result as string)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function PhotoUpload({
  onPhotoSelected,
  currentUrl,
  required = false,
  label = 'Foto Barang',
}: PhotoUploadProps) {
  const inputId = useId()
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null)

    // Validate that file is an image
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|jfif|heic)$/i.test(file.name)
    if (!isImage) {
      setErrorMessage('Format file tidak didukung! Harap unggah file foto gambar (JPG, PNG, WebP, dsb).')
      return
    }

    // Limit original file size to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Ukuran file foto terlalu besar (maksimal 15 MB).')
      return
    }

    setIsProcessing(true)
    try {
      // Compress and optimize image for responsive loading & localStorage storage
      const optimizedDataUrl = await compressImage(file)
      setPreviewUrl(optimizedDataUrl)
      onPhotoSelected(optimizedDataUrl, file)
    } catch (err) {
      console.error('Error processing photo:', err)
      setErrorMessage('Gagal memproses file foto. Silakan coba unggah foto lain.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
        <label htmlFor={inputId} className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>{label}</span>
          {required ? (
            <span className="text-rose-500">*</span>
          ) : (
            <span className="text-xs text-slate-400 font-normal">(Opsional)</span>
          )}
        </label>
        <span className="text-[11px] text-slate-500 font-medium">JPG, PNG, WebP (Otomatis Dioptimasi)</span>
      </div>

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/80 bg-slate-900 group aspect-[16/9] max-h-72 shadow-xs">
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
            className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl backdrop-blur-md shadow-lg transition active:scale-95 cursor-pointer z-10"
            title="Hapus / Ganti Foto"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-xl flex items-center justify-between border border-white/10">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Foto berhasil diunggah &amp; siap disimpan</span>
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] text-blue-300 hover:text-white underline cursor-pointer"
            >
              Ganti Foto
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 bg-slate-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              {isProcessing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <p className="text-sm font-bold text-slate-800 mb-1">
              {isProcessing ? 'Mengompresi & Memproses Foto...' : 'Klik untuk Pilih Foto dari Perangkat atau Seret ke Sini'}
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Kamera smartphone, file JPG, PNG, atau WebP
            </p>

            {/* Privacy Warning Guideline Box */}
            <div className="max-w-md mx-auto text-left bg-amber-50/90 border border-amber-200/90 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Panduan Privasi:</strong> Jika memotret KTM, KTP, atau dokumen beridentitas, mohon tutupi/sensor nomor identitas (NIK / NIM) demi melindungi data pribadi pemilik.
              </p>
            </div>
          </label>

          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0])
              }
            }}
          />
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
