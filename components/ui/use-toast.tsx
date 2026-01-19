// Simplified Toast Hook for "shadcn-like" usage without full setup
"use client"

import * as React from "react"

const ToastContext = React.createContext<{
    toast: (props: { title: string; description?: string; duration?: number; variant?: "default" | "destructive"; className?: string }) => void
}>({
    toast: () => { },
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<any[]>([])

    const toast = ({ title, description, duration = 3000, variant = "default", className }: any) => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, title, description, variant, className }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
    }

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`p-4 rounded shadow-lg min-w-[300px] animate-in fade-in slide-in-from-right-5 ${t.variant === "destructive" ? "bg-red-600 text-white" : t.className ? t.className : "bg-white text-black border"
                            }`}
                    >
                        <div className="font-bold">{t.title}</div>
                        {t.description && <div className="text-sm opacity-90">{t.description}</div>}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => React.useContext(ToastContext)
