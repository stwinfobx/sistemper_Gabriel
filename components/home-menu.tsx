"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  FileText,
  Search,
  Building2,
  Settings,
  Power,
  PowerOff,
  Save,
  Fish,
  Palette,
  CalendarDays,
} from "lucide-react"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export function HomeMenu() {
  const [systemStatus, setSystemStatus] = useState<"active" | "standby">("active")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const toggleSystemStatus = () => {
    setSystemStatus((prev) => (prev === "active" ? "standby" : "active"))
  }

  const handleSaveAndClose = () => {
    if (hasUnsavedChanges) {
      // Show confirmation dialog
      const confirmed = window.confirm("Existem alterações não salvas. Deseja salvar antes de fechar?")
      if (confirmed) {
        // Save logic here
        setHasUnsavedChanges(false)
      }
    }
    // Close logic here
  }

  const menuItems = [
    {
      title: "Cálculo Rápido - Vidros",
      description: "Configure e calcule orçamentos para vidros temperados",
      icon: Calculator,
      href: "/calculo/vidros",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "Cálculo Rápido - Esquadrias",
      description: "Calcule esquadrias de alumínio com precisão",
      icon: Building2,
      href: "/calculo/esquadrias",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    {
      title: "Novo Orçamento",
      description: "Cadastre cliente e inicie um novo orçamento",
      icon: FileText,
      href: "/orcamentos/novo",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      title: "Buscar Orçamentos",
      description: "Localize clientes e orçamentos existentes",
      icon: Search,
      href: "/orcamentos/buscar",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      title: "Aquário",
      description: "Cálculo especializado para aquários de vidro",
      icon: Fish,
      href: "/calculo/aquario",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      title: "Itens Adicionais",
      description: "Jatos, películas e complementares",
      icon: Palette,
      href: "/itens-adicionais",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
    {
      title: "Central de Agendamentos",
      description: "Controle visitas técnicas e retornos com calendário unificado",
      icon: CalendarDays,
      href: "/agendamentos",
      color: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    {
      title: "Dados da Empresa",
      description: "Configure informações institucionais",
      icon: Settings,
      href: "/empresa",
      color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Sistemper 2025</h1>
              <Badge
                variant={systemStatus === "active" ? "default" : "secondary"}
                className={systemStatus === "active" ? "status-active" : "status-standby"}
              >
                {systemStatus === "active" ? "Sistema Ativo" : "Standby"}
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSystemStatus}
                className="flex items-center space-x-2 bg-transparent"
              >
                {systemStatus === "active" ? (
                  <>
                    <PowerOff className="h-4 w-4" />
                    <span>Standby</span>
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    <span>Ativar</span>
                  </>
                )}
              </Button>

              <Button variant="default" size="sm" onClick={handleSaveAndClose} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Fechar & Salvar</span>
              </Button>

              <ThemeToggle />

              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Draft Resume Card */}
        {hasUnsavedChanges && (
          <Card className="mb-8 border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-warning">Orçamento em Rascunho</CardTitle>
              <CardDescription>Você possui alterações não salvas. Clique para retomar o trabalho.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-warning text-warning hover:bg-warning/10 bg-transparent">
                Retomar Orçamento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* System Info */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">Sistemper 2025 v0.1 - Sistema de Orçamentos para Vidraçarias</p>
          <p className="text-muted-foreground text-xs mt-1">
            Desenvolvido para otimizar cálculos e gestão de orçamentos
          </p>
        </div>
      </main>
    </div>
  )
}
