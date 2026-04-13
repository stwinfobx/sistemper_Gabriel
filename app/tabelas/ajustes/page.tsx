"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, RefreshCw, TrendingUp, Percent, Database, Zap } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdjustmentsDashboard() {
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAdjustments()
  }, [])

  const fetchAdjustments = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/materials")
      const data = await response.json()
      setAdjustments(data.adjustments || [])
    } catch (error) {
      console.error("Error fetching adjustments:", error)
      toast.error("Erro ao carregar ajustes")
    } finally {
      setLoading(false)
    }
  }

  const handlePercentageChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setAdjustments(prev => prev.map(adj => 
      adj.id === id ? { ...adj, percentage: numValue } : adj
    ))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustments })
      })

      if (response.ok) {
        toast.success("Todos os ajustes foram salvos com sucesso!")
      } else {
        throw new Error("Falha ao salvar")
      }
    } catch (error) {
      console.error("Error saving adjustments:", error)
      toast.error("Erro ao salvar ajustes no banco de dados")
    } finally {
      setSaving(false)
    }
  }

  const glassAdjustments = adjustments.filter(a => a.type === "Glass")
  const otherAdjustments = adjustments.filter(a => a.type !== "Glass")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tabelas">
              <Button variant="ghost" size="sm" className="gap-2 bg-transparent opacity-70 hover:opacity-100">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                 <TrendingUp className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight">Central de Ajustes Globais</h1>
            </div>
          </div>
          <Button 
            onClick={handleSaveAll} 
            disabled={saving}
            className="gap-2 shadow-lg shadow-primary/20 bg-primary min-w-[140px]"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Tudo
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-5xl space-y-10">
        
        {/* Intro Alert Style Card */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
           <Zap className="h-6 w-6 text-primary shrink-0 mt-1" />
           <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-1">Controle de Margens e Repasses</h2>
              <p className="text-sm text-primary/70 leading-relaxed font-medium">
                 Os valores abaixo são aplicados globalmente em todos os cálculos do sistema. 
                 Ao alterar um percentual aqui, todos os orçamentos (novos e em edição) serão afetados instantaneamente. 
                 Valores positivos aumentam o preço, valores negativos aplicam desconto.
              </p>
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Glass Adjustments */}
           <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                 <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20">Vidros</Badge>
                 <h2 className="text-xs font-black uppercase text-muted-foreground tracking-tighter">Markup por Fornecedor</h2>
              </div>
              
              <div className="space-y-4">
                {glassAdjustments.map(adj => (
                  <Card key={adj.id} className="border-primary/10 hover:border-primary/30 transition-all shadow-sm group">
                    <CardContent className="p-6 flex items-center justify-between">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tempermax / Divinal / etc</span>
                          <span className="font-black text-lg group-hover:text-primary transition-colors">{adj.provider}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input 
                              type="number"
                              className="w-24 pl-8 h-12 text-center font-black text-lg border-primary/10 focus:border-primary"
                              value={adj.percentage}
                              onChange={(e) => handlePercentageChange(adj.id, e.target.value)}
                            />
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
           </div>

           {/* Other Adjustments (Profiles, Acc) */}
           <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                 <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-orange-500/20 text-orange-600">Geral</Badge>
                 <h2 className="text-xs font-black uppercase text-muted-foreground tracking-tighter">Markup por Categoria</h2>
              </div>
              
              <div className="space-y-4">
                {otherAdjustments.map(adj => (
                  <Card key={adj.id} className="border-orange-500/10 hover:border-orange-500/30 transition-all shadow-sm group">
                    <CardContent className="p-6 flex items-center justify-between">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Repasse Geral</span>
                          <span className="font-black text-lg group-hover:text-orange-600 transition-colors">
                             {adj.type === "Aluminum" ? "Perfis de Alumínio" : 
                              adj.type === "Accessory" ? "Ferragens e Acessórios" : adj.type}
                          </span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input 
                              type="number"
                              className="w-24 pl-8 h-12 text-center font-black text-lg border-orange-500/10 focus:border-orange-500"
                              value={adj.percentage}
                              onChange={(e) => handlePercentageChange(adj.id, e.target.value)}
                            />
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}
                
                {otherAdjustments.length === 0 && !loading && (
                   <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl opacity-40">
                      <Database className="h-8 w-8 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhum ajuste geral encontrado</p>
                   </div>
                )}
              </div>
           </div>
        </div>

        {loading && (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="h-10 w-10 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">Consolidando Dados...</p>
           </div>
        )}

      </main>
    </div>
  )
}
