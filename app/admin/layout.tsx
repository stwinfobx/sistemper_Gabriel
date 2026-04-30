"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, KeyRound, LogOut, ArrowLeft, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("sistemper_user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role === "admin") {
        setIsAdmin(true)
      } else {
        router.push("/")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  if (!isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Verificando permissões...</div>
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Usuários", icon: Users, href: "/admin/usuarios" },
    { name: "Licenças & Keys", icon: KeyRound, href: "/admin/keys" },
  ]

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar do Admin */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            Admin Panel
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Sistema
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => {
            localStorage.removeItem("sistemper_user")
            router.push("/login")
          }}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Sistema
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-muted/20">
        {children}
      </main>
    </div>
  )
}
