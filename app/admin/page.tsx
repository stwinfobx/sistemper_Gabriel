"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  KeyRound, 
  Activity, 
  UserPlus, 
  PlusCircle, 
  Clock, 
  Ban,
  ArrowRight
} from "lucide-react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    expiredUsers: 0,
    bannedUsers: 0,
    availableKeys: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const [usersRes, keysRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/keys")
        ])
        
        const users = await usersRes.json()
        const keys = await keysRes.json()
        
        const now = new Date()
        const active = users.filter((u: any) => !u.isBanned && (!u.expiresAt || new Date(u.expiresAt) > now)).length
        const expired = users.filter((u: any) => u.expiresAt && new Date(u.expiresAt) <= now).length
        const banned = users.filter((u: any) => u.isBanned).length
        const unusedKeys = keys.filter((k: any) => !k.isUsed).length

        setStats({
          totalUsers: users.length,
          activeUsers: active,
          expiredUsers: expired,
          bannedUsers: banned,
          availableKeys: unusedKeys
        })
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const quickActions = [
    {
      title: "Novo Usuário",
      description: "Cadastrar um novo acesso manualmente",
      icon: UserPlus,
      href: "/register",
      color: "text-blue-500"
    },
    {
      title: "Gerar Chaves",
      description: "Criar novos códigos de acesso",
      icon: PlusCircle,
      href: "/admin/keys",
      color: "text-green-500"
    },
    {
      title: "Listar Usuários",
      description: "Ver e gerenciar todos os perfis",
      icon: Users,
      href: "/admin/usuarios",
      color: "text-purple-500"
    }
  ]

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">Bem-vindo ao centro de controle do Sistemper.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
            Ver Sistema
          </Button>
          <Button onClick={() => router.push("/admin/keys")} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="w-4 h-4" />
            Nova Key
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{loading ? "..." : stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Acesso liberado</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expirados/Banidos</CardTitle>
            <div className="flex gap-1">
              <Clock className="w-3 h-3 text-yellow-500" />
              <Ban className="w-3 h-3 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex gap-2">
              <span className="text-yellow-500">{loading ? "..." : stats.expiredUsers}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-red-500">{loading ? "..." : stats.bannedUsers}</span>
            </div>
            <p className="text-xs text-muted-foreground">Acesso bloqueado</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Keys Disponíveis</CardTitle>
            <KeyRound className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{loading ? "..." : stats.availableKeys}</div>
            <p className="text-xs text-muted-foreground">Prontas para uso</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-auto p-6 flex flex-col items-start gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                onClick={() => router.push(action.href)}
              >
                <div className={`p-3 rounded-xl bg-background border border-border group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Log de Atividades</CardTitle>
              <CardDescription>Resumo das últimas ações administrativas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Nenhuma atividade recente registrada.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card className="bg-blue-600 text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-24 h-24 rotate-12" />
            </div>
            <CardHeader>
              <CardTitle>Dica do Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-100 text-sm">
                Usuários expirados são automaticamente redirecionados para a tela de ativação. Gere uma Key de 30 dias para renovar o acesso deles rapidamente.
              </p>
              <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50" onClick={() => router.push("/admin/keys")}>
                Gerar Key agora
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
