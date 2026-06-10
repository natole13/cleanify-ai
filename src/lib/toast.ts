import { useState, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  description?: string
}

type Sub = (t: ToastItem[]) => void

let _toasts: ToastItem[] = []
const _subs = new Set<Sub>()
const _notify = () => _subs.forEach(s => s([..._toasts]))

export function toast(type: ToastType, title: string, description?: string) {
  const id = Math.random().toString(36).slice(2)
  _toasts = [..._toasts, { id, type, title, description }]
  _notify()
  setTimeout(() => {
    _toasts = _toasts.filter(t => t.id !== id)
    _notify()
  }, 4500)
}

export function useToastStore() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => {
    _subs.add(setItems)
    return () => { _subs.delete(setItems) }
  }, [])
  return items
}
