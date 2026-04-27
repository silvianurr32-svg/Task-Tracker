import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[100]">
        {toasts.map(t => (
          <div key={t.id} className="toast-enter flex items-center gap-3 bg-ink text-cream px-4 py-3 rounded-xl shadow-modal max-w-xs">
            {t.type === 'success'
              ? <CheckCircle size={16} className="text-sky shrink-0" />
              : <AlertCircle size={16} className="text-blush shrink-0" />
            }
            <span className="text-sm flex-1">{t.msg}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
