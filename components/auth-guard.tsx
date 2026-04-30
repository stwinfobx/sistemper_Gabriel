"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface User {
  username: string
  role: "admin" | "vendedor"
  loginTime: string
}

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("sistemper_user")
        if (userData) {
          const parsedUser = JSON.parse(userData)

          const now = new Date()

          // Verificar se o usuário foi banido
          if (parsedUser.isBanned) {
            localStorage.removeItem("sistemper_user")
            router.push("/login?error=banned")
            return
          }

          // Verificar expiração da licença/conta
          if (parsedUser.expiresAt) {
            const expDate = new Date(parsedUser.expiresAt)
            if (expDate < now) {
              router.push("/activate")
              setIsLoading(false)
              return
            }
          }

          // Verificar se o login da sessão (24h) não expirou
          const loginTime = new Date(parsedUser.loginTime)
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 24) {
            setUser(parsedUser)
          } else {
            localStorage.removeItem("sistemper_user")
            router.push("/login")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        localStorage.removeItem("sistemper_user")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    const publicRoutes = ["/login", "/register", "/activate"]
    if (publicRoutes.includes(pathname)) {
      setIsLoading(false)
      return
    }

    checkAuth()
  }, [router, pathname])

  const publicRoutes = ["/login", "/register", "/activate"]
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não há usuário autenticado, não renderizar nada (redirecionamento já foi feito)
  if (!user) {
    return null
  }

  return <>{children}</>
}
