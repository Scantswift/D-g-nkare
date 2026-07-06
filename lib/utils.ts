import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(groomName: string, brideName: string, date: Date): string {
  const groom = groomName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const bride = brideName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const year = date.getFullYear()
  return `${groom}-${bride}-${year}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount)
}
