"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Boxes, TrendingUp, RefreshCw, RotateCcw, Plus, Loader2, Layers3, Edit2 } from "lucide-react"

type Material = {
  id: string
  name: string
  baseName: string | null
  thickness: number | null
  price: number
  provider: string | null
}

type Adjustment = {
  type: string
  provider: string | null
  percentage: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value)

export function GlassTables() {
  const [groupedMaterials, setGroupedMaterials] = useState<any[]>([])
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [inputAdjustments, setInputAdjustments] = useState<Record<string, number>>({
    Tempermax: 0,
    Divinal: 0,
    Blindex: 0
  })
  const [selectedDetailMaterial, setSelectedDetailMaterial] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [newPrice, setNewPrice] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleBulkAdjustment = async (provider: string) => {
    const increment = inputAdjustments[provider]
    if (increment === 0) return
    setSaving(provider)
    try {
      const res = await fetch("/api/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "Glass", provider, increment })
      })
      if (res.ok) {
        await fetchMaterials()
        setInputAdjustments(prev => ({ ...prev, [provider]: 0 }))
      }
    } catch (err) {
      console.error("Failed to apply bulk adjustment:", err)
    } finally {
      setSaving(null)
    }
  }

  const handleUpdateSinglePrice = async (materialId: string, provider: string) => {
    if (!materialId || !newPrice) return
    setIsUpdating(true)
    try {
      const response = await fetch("/api/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: materialId, price: Number(newPrice) })
      })
      if (response.ok) {
        await fetchMaterials() // Reloads data
        setEditingProvider(null)
        setIsModalOpen(false) // Close modal since data is snapshot, to avoid stale state
      }
    } catch (error) {
      console.error("Error updating price:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/materials?type=Glass&grouped=true")
      const data = await res.json()
      if (data && data.grouped) {
        setGroupedMaterials(data.grouped.sort((a: any, b: any) => 
          (a.baseName || "").localeCompare(b.baseName || "")
        ))
        setAdjustments(data.adjustments || [])
      }
    } catch (err) {
      console.error("Failed to fetch materials:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const getAdjustment = (provider: string) => {
    const adj = adjustments.find(a => a.type === "Glass" && a.provider === provider)
    return adj ? Number(adj.percentage) : 0
  }

  const filteredMaterials = useMemo(() => {
    return groupedMaterials.filter(m => 
      (m.baseName || "").toLowerCase().includes(search.toLowerCase())
    )
  }, [search, groupedMaterials])

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Sincronizando Banco de Dados...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <Card className="shadow-sm border-primary/10">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Consulta de Preços - Vidros</CardTitle>
              <CardDescription>Consulte e gerencie valores por fornecedor</CardDescription>
            </div>
            <Badge variant="outline" className="font-bold">
              {filteredMaterials.length} Modelos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por modelo ou espessura..." 
              className="pl-10 h-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Itens de Vidro</CardTitle>
            <Boxes className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMaterials.length} Tipos</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Preço Médio m²</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 158,40</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Última Sincro</CardTitle>
            <RefreshCw className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Recentemente</div>
          </CardContent>
        </Card>
      </div>

      {/* Global Adjustments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {["Tempermax", "Divinal", "Blindex"].map(provider => (
          <Card key={provider} className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader className="py-3 px-6 flex flex-row items-center justify-between border-b bg-white/50">
              <CardTitle className="text-xs font-black uppercase tracking-widest">{provider}</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {getAdjustment(provider)}% acumulado
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 px-6 pb-4">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-9 pr-8 font-bold"
                    value={inputAdjustments[provider] || ""}
                    onChange={e => setInputAdjustments(prev => ({ ...prev, [provider]: Number(e.target.value) }))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                </div>
                <Button 
                  size="sm" 
                  className="font-bold gap-2" 
                  onClick={() => handleBulkAdjustment(provider)}
                  disabled={saving === provider || inputAdjustments[provider] === 0}
                >
                  {saving === provider ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table */}
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Tabela de Preços Base</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-10 border-r py-4 font-bold uppercase text-[10px] tracking-wider">Descrição do Material</TableHead>
                  <TableHead className="text-center border-r font-bold uppercase text-[10px] tracking-wider">Esp.</TableHead>
                  <TableHead className="text-right border-r font-bold uppercase text-[10px] tracking-wider px-6">Tempermax (m²)</TableHead>
                  <TableHead className="text-right border-r font-bold uppercase text-[10px] tracking-wider px-6">Divinal (m²)</TableHead>
                  <TableHead className="text-right pr-10 font-bold uppercase text-[10px] tracking-wider px-6">Blindex (m²)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((group) => (
                  <TableRow 
                    key={group.name} 
                    className="hover:bg-muted/50 transition-colors border-b cursor-pointer group"
                    onClick={() => {
                      setSelectedDetailMaterial(group)
                      setIsModalOpen(true)
                    }}
                  >
                    <TableCell className="font-medium text-sm pl-10 border-r">{group.name}</TableCell>
                    <TableCell className="text-center border-r"><Badge variant="outline" className="font-bold">{group.thickness}mm</Badge></TableCell>
                    <TableCell className="text-right border-r px-6 font-mono text-xs">
                       {group.providers.Tempermax ? formatCurrency(group.providers.Tempermax.price) : "---"}
                    </TableCell>
                    <TableCell className="text-right border-r px-6 font-mono text-xs">
                       {group.providers.Divinal ? formatCurrency(group.providers.Divinal.price) : "---"}
                    </TableCell>
                    <TableCell className="text-right pr-10 px-6 font-mono text-xs">
                       {group.providers.Blindex ? formatCurrency(group.providers.Blindex.price) : "---"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Material Detail Modal */}
      {isModalOpen && selectedDetailMaterial && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl shadow-xl overflow-hidden">
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b-0 pb-0">
              <div>
                <CardTitle className="text-xl font-bold">
                  {selectedDetailMaterial.name}
                </CardTitle>
                <CardDescription>Detalhes do material e precificação por fornecedor</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Fechar</Button>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual */}
                <div className="space-y-4">
                  <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center border border-dashed">
                    <Layers3 className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-xs font-bold uppercase text-muted-foreground">Descrição Técnica</h4>
                     <p className="text-sm">
                        Vidro temperado padrão residencial/comercial. Espessura {selectedDetailMaterial.thickness}mm.
                     </p>
                  </div>
                  <div className="pt-4">
                     <Button variant="outline" size="sm" className="w-full">Adicionar Novo Fornecedor</Button>
                  </div>
                </div>

                {/* Prices per Provider */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground border-b pb-2">Preços m²</h4>
                  <div className="space-y-3">
                    {["Tempermax", "Divinal", "Blindex"].map(provider => {
                      const mat = selectedDetailMaterial.providers[provider]
                      return (
                        <div key={provider} className="p-4 border rounded-lg flex items-center justify-between bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">{provider}</span>
                            <div className="text-lg font-bold">
                              {editingProvider === provider ? (
                                <div className="flex gap-2 mt-2">
                                  <Input 
                                    className="h-8 w-24" 
                                    type="number" 
                                    step="0.01" 
                                    value={newPrice} 
                                    onChange={e => setNewPrice(e.target.value)}
                                  />
                                  <Button size="sm" onClick={() => handleUpdateSinglePrice(mat.id, provider)} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar"}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingProvider(null)}>
                                     X
                                  </Button>
                                </div>
                              ) : (
                                mat ? formatCurrency(mat.price) : "---"
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {mat && editingProvider !== provider && (
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                  setEditingProvider(provider)
                                  setNewPrice(mat.price.toString())
                                }}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                             )}
                             {!mat && (
                               <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold">Ativar</Button>
                             )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
