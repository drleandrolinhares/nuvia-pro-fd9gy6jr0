import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export function CurrencyInput({ value, onChange, disabled }: CurrencyInputProps) {
  const [inputValue, setInputValue] = useState(() => (value * 100).toFixed(0))

  useEffect(() => {
    const num = parseInt(inputValue || '0', 10) / 100
    if (num !== value) setInputValue((value * 100).toFixed(0))
  }, [value, inputValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const val = e.target.value.replace(/\D/g, '')
    setInputValue(val)
    const num = parseInt(val || '0', 10) / 100
    onChange(num)
  }

  const formatDisplay = (val: string) => {
    const num = parseInt(val || '0', 10) / 100
    if (num === 0 && !val) return ''
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="relative flex items-center">
      <span
        className={cn(
          'absolute left-3 font-medium',
          disabled ? 'text-slate-500' : 'text-slate-400',
        )}
      >
        R$
      </span>
      <Input
        disabled={disabled}
        className={cn(
          'pl-10 text-right bg-slate-900/50 border-slate-800 h-9 font-medium shadow-sm transition-colors',
          disabled
            ? 'opacity-70 cursor-not-allowed text-slate-400'
            : 'hover:border-slate-600 focus:bg-slate-800 focus:border-amber-500/50 text-slate-200 focus:text-white',
        )}
        value={formatDisplay(inputValue)}
        onChange={handleChange}
        placeholder="0,00"
      />
    </div>
  )
}
