import { formatDistanceToNow, format, isValid } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    if (!isValid(d)) return '-'
    return formatDistanceToNow(d, {
      addSuffix: true,
      locale: id,
    })
  } catch {
    return '-'
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    if (!isValid(d)) return '-'
    return format(d, 'dd MMMM yyyy, HH:mm', { locale: id })
  } catch {
    return '-'
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    if (!isValid(d)) return '-'
    return format(d, 'dd MMM yyyy', { locale: id })
  } catch {
    return '-'
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  if (!name) return 'UG'
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function isGunadarmaEmail(email: string): boolean {
  if (!email) return false
  const lower = email.toLowerCase().trim()
  return (
    lower.endsWith('@student.gunadarma.ac.id') ||
    lower.endsWith('@gunadarma.ac.id')
  )
}

export function validateFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes
}

export function validateFileType(file: File, acceptedTypes: string[]): boolean {
  return acceptedTypes.includes(file.type)
}
