"use client"

import { useMemo, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Save, TrendingUp, Search, Ruler } from "lucide-react"

type Material = {
  id: string
  name: string
  baseName: string | null
  type: string
  category: string | null
  price: number
}

type Adjustment = {
  type: string
  provider: string | null
  percentage: string
}

export function ProfilesTable() {
  const [search, setSearch] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputAdjustment, setInputAdjustment] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newPrice, setNewPrice] = useState("")

  useEffect(() => {
    if (selectedMaterial) {
      setNewPrice(selectedMaterial.price.toString())
    }
  }, [selectedMaterial])

  const handleUpdateSinglePrice = async () => {
    if (!selectedMaterial || !newPrice) return
    setIsUpdating(true)
    try {
      const response = await fetch("/api/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMaterial.id, price: Number(newPrice) })
      })
      if (response.ok) {
        await fetchMaterials()
        setIsModalOpen(false)
      } else {
        console.error("Failed to update price")
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
      const response = await fetch("/api/materials?type=Aluminum")
      const data = await response.json()
      if (data && data.materials && Array.isArray(data.materials)) {
        setMaterials(data.materials)
        setAdjustments(data.adjustments || [])
      } else {
        console.warn("Materials data format unexpected:", data)
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

  const filteredMaterials = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return materials.filter(m =>
      m.name.toLowerCase().includes(normalized) ||
      (m.baseName && m.baseName.toLowerCase().includes(normalized))
    )
  }, [search, materials])

  const currentAdjustment = useMemo(() => {
    const adj = adjustments.find(a => a.type === "Aluminum")
    return adj ? Number(adj.percentage) : 0
  }, [adjustments])

  const handleApplyIncrease = async () => {
    if (inputAdjustment === 0) return
    setIsUpdating(true)
    try {
      const response = await fetch("/api/materials", {
        method: "PATCH",
        body: JSON.stringify({
          type: "Aluminum",
          increment: inputAdjustment
        })
      })
      if (response.ok) {
        await fetchMaterials()
        setInputAdjustment(0)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-primary">Sincronizando Alumínios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Perfis de Alumínio</CardTitle>
              <CardDescription>Busca e consulta de preços por metro linear</CardDescription>
            </div>
            <Badge variant="outline" className="font-bold">
              {filteredMaterials.length} Itens
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por descrição ou código do perfil..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Reajuste Global Alumínio (%)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={inputAdjustment || ""} 
                    onChange={e => setInputAdjustment(Number(e.target.value))}
                    className="h-12 font-bold pr-8"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">%</span>
                </div>
              </div>
              <Button 
                onClick={handleApplyIncrease} 
                className="h-12 font-bold gap-2"
                disabled={isUpdating || inputAdjustment === 0}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                Aplicar
              </Button>
            </div>
          </div>
          {currentAdjustment !== 0 && (
            <div className="mt-4 p-2 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-between">
              <span className="text-xs font-bold text-primary italic">Este tipo de material já possui um reajuste acumulado de {currentAdjustment}%</span>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-bold" onClick={() => { setInputAdjustment(-currentAdjustment); }}>Zerar</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-4 px-6 flex flex-row items-center justify-between">
           <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Tabela de Materiais</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-8 py-4 font-bold uppercase text-[10px] tracking-wider">Descrição do Perfil</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-wider">Categoria</TableHead>
                <TableHead className="text-right pr-8 font-bold uppercase text-[10px] tracking-wider">Preço (m)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((m) => (
                <TableRow 
                  key={m.id} 
                  className="hover:bg-muted/50 transition-colors border-b cursor-pointer"
                  onClick={() => {
                    setSelectedMaterial(m)
                    setIsModalOpen(true)
                  }}
                >
                  <TableCell className="pl-8 py-4">
                    <span className="font-medium text-sm">
                      {m.baseName || m.name.replace("ALUM-", "")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {m.category || "Perfil"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold pr-8">
                    {formatCurrency(Number(m.price))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Material Detail Modal */}
      {isModalOpen && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b-0 pb-0">
              <div>
                <CardTitle className="text-xl font-bold">
                   {selectedMaterial.name}
                </CardTitle>
                <CardDescription>Detalhes e precificação técnica</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Fechar</Button>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual */}
                <div className="space-y-4">
                  <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center border border-dashed">
                    <Ruler className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-xs font-bold uppercase text-muted-foreground">Especificações</h4>
                     <p className="text-sm">
                        Perfil de alumínio extrudado. Categoria: {selectedMaterial.category || "Não definida"}.
                     </p>
                  </div>
                </div>

                {/* Price Management */}
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-muted/20">
                     <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Preço Atual</span>
                     <span className="text-2xl font-bold text-primary">
                        {formatCurrency(selectedMaterial.price)}
                     </span>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase text-muted-foreground">Atualizar Preço (unitário/m)</Label>
                     <div className="flex gap-2">
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="Ex: 12.50"
                          className="h-10"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                        <Button 
                          size="sm"
                          onClick={handleUpdateSinglePrice}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                        </Button>
                     </div>
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

