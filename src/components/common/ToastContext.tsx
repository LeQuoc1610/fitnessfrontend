import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: string; message: string; type?: 'info'|'success'|'error'; duration?: number; action?: { label: string; onClick: () => void | Promise<void> } };

type ToastContextValue = {
  toasts: Toast[];
  addToast: (msg: string, opts?: { type?: Toast['type']; duration?: number; action?: Toast['action'] }) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, opts?: { type?: Toast['type']; duration?: number; action?: Toast['action'] }) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2,8);
    const t: Toast = { id, message, type: opts?.type ?? 'info', duration: opts?.duration ?? 2500, action: opts?.action };
    setToasts((s) => [...s, t]);
    // auto remove
    setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), t.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((s) => s.filter(x => x.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 flex flex-col items-center gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-enter max-w-lg w-full px-4 py-3 rounded-lg text-sm shadow-lg text-white flex items-center justify-between gap-3 ${t.type==='success' ? 'bg-emerald-500' : t.type==='error' ? 'bg-rose-500' : 'bg-zinc-800/90'}`}>
            <div className="flex items-center gap-3">
              <div className="text-xl">
                {t.type === 'success' ? '✔️' : t.type === 'error' ? '❌' : 'ℹ️'}
              </div>
              <div className="truncate">{t.message}</div>
            </div>
            <div className="flex items-center gap-2">
              {t.action && (
                <button onClick={() => {
                  try { t.action!.onClick(); } catch (e) { console.error(e); }
                  removeToast(t.id);
                }} className="bg-black/20 px-3 py-1 rounded-md text-xs font-semibold hover:opacity-90">{t.action.label}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastProvider;
