import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '@/lib/toast'

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
  error:   <XCircle      className="h-4 w-4 text-red-500 shrink-0" />,
  info:    <Info         className="h-4 w-4 text-[var(--primary)] shrink-0" />,
}

const BG = {
  success: 'border-emerald-100 bg-white',
  error:   'border-red-100   bg-white',
  info:    'border-indigo-100 bg-white',
}

export function ToastContainer() {
  const toasts = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: -8,  scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`pointer-events-auto flex w-72 items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.10)] backdrop-blur-md ${BG[t.type]}`}
          >
            {ICONS[t.type]}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-[650] text-gray-900 leading-snug">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-[11px] text-gray-500 leading-snug truncate">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => {}}
              className="ml-1 shrink-0 rounded-md p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
