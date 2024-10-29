import { cn } from '@/lib/utils'
import React, { createContext, useContext } from 'react'

type ToggleGroupContextType = {
    value: string
    onChange: (value: string) => void
}

const ToggleGroupContext = createContext<ToggleGroupContextType | undefined>(undefined)

interface ToggleGroupProps<T extends string> {
    type: 'single' | 'multiple'
    value: T
    onValueChange: (value: T) => void
    className?: string
    children: React.ReactNode
}

export function ToggleGroup<T extends string>({ value, onValueChange, className, children }: ToggleGroupProps<T>) {
    return (
        <ToggleGroupContext.Provider value={{
            value,
            onChange: (newValue: string) => {
                if (newValue as T) {
                    onValueChange(newValue as T)
                }
            }
        }}>
            <div className={cn('inline-flex rounded-md shadow-sm', className)}>
                {children}
            </div>
        </ToggleGroupContext.Provider>
    )
}

interface ToggleGroupItemProps {
    value: string
    className?: string
    children: React.ReactNode
}

export function ToggleGroupItem({ value, className, children }: ToggleGroupItemProps) {
    const context = useContext(ToggleGroupContext)
    if (!context) {
        throw new Error('ToggleGroupItem must be used within a ToggleGroup')
    }

    const { value: groupValue, onChange } = context
    const isSelected = groupValue === value

    return (
        <button
            type="button"
            className={cn(
                'px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-gray-700 hover:bg-gray-50',
                className
            )}
            onClick={() => onChange(value)}
        >
            {children}
        </button>
    )
}