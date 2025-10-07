'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-transparent"
        aria-hidden="true"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline-block">Modo Claro</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-transparent"
      onClick={handleToggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline-block">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
    </Button>
  )
}
