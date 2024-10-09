"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import React, { createContext, useCallback, useContext, useState } from 'react'
import { Button } from "./button"

interface Toast {
    id: number
    title: string
    description?: string
    variant?: 'default' | 'destructive'
}

interface ToastContextType {
    toasts: Toast[]
    toast: (toast: Omit<Toast, 'id'>) => void
    dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
        setToasts((prevToasts) => [...prevToasts, { ...newToast, id: Date.now() }])
    }, [])

    const dismiss = useCallback((id: number) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

const ToastContainer: React.FC = () => {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className={`bg-white rounded-lg shadow-lg p-4 max-w-md ${toast.variant === 'destructive' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-gray-900">{toast.title}</h3>
                                {toast.description && <p className="mt-1 text-sm text-gray-500">{toast.description}</p>}
                            </div>
                            <Button
                                onClick={() => dismiss(toast.id)}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}