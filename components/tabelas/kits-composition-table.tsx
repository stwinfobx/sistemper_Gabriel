"use client"

import { useMemo, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Boxes, Component } from "lucide-react"

type Material = {
  id: string
  name: string
  price: number
}

type KitComponent = {
  id: string
  material: Material
  quantityFormula: string | null
}

type Tipology = {
  name: string
  category: string
}

type Kit = {
  id: string
  name: string
  description: string | null
  tipology: Tipology | null
  components: KitComponent[]
}

export function KitsCompositionTable() {
  const [filter, setFilter] = useState("")
  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchKits = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/kits")
      const data = await response.json()
      if (Array.isArray(data)) {
        setKits(data)
      } else {
        console.error("Kits data format unexpected:", data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKits()
  }, [])

  const filtered = useMemo(() => {
    const normalized = filter.trim().toLowerCase()
    return kits.filter(k =>
      k.name.toLowerCase().includes(normalized) ||
      (k.tipology && k.tipology.name.toLowerCase().includes(normalized))
    )
  }, [filter, kits])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  const getKitTotal = (kit: Kit) => {
    return kit.components.reduce((acc, comp) => {
      const price = Number(comp.material?.price || 0)
      const qty = parseFloat(comp.quantityFormula || "1") || 1
      return acc + (price * qty)
    }, 0)
  }

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-primary">Carregando Composições...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Composição de Kits (Portões, Boxes, etc)</CardTitle>
              <CardDescription>Consulta de componentes que formam cada kit</CardDescription>
            </div>
            <Badge variant="outline" className="font-bold">
              {filtered.length} Kits
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome do kit ou tipologia..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md overflow-hidden">
        <CardHeader className="border-b bg-muted/20 py-4 px-6">
           <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Catálogo de Kits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-8 py-4 font-bold uppercase text-[10px] tracking-wider">Nome do Kit / Tipologia</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-wider">Qtd. Componentes</TableHead>
                <TableHead className="text-right pr-8 font-bold uppercase text-[10px] tracking-wider">Custo de Tabela</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((k) => (
                <TableRow 
                  key={k.id} 
                  className="hover:bg-muted/50 transition-colors border-b cursor-pointer"
                  onClick={() => {
                    setSelectedKit(k)
                    setIsModalOpen(true)
                  }}
                >
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-3">
                       <Boxes className="h-4 w-4 text-muted-foreground opacity-40" />
                       <div className="flex flex-col">
                         <span className="font-medium text-sm">{k.name}</span>
                         {k.tipology && (
                           <span className="text-[10px] uppercase text-muted-foreground font-bold">
                             {k.tipology.name} ({k.tipology.category})
                           </span>
                         )}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {k.components.length} Itens
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold pr-8">
                    {formatCurrency(getKitTotal(k))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kit Details Modal */}
      {isModalOpen && selectedKit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b pb-4 shrink-0 bg-card">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <Boxes className="h-5 w-5 text-primary" />
                   {selectedKit.name}
                </CardTitle>
                <CardDescription>
                  Componentes e custos tabelados para {selectedKit.tipology?.name || "este kit"}.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm border-b">
                  <TableRow>
                    <TableHead className="pl-6 uppercase text-[10px] font-bold">Composição (Materiais/Acessórios)</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold">Quantidade</TableHead>
                    <TableHead className="text-right pr-6 uppercase text-[10px] font-bold">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedKit.components.map((c) => {
                    const price = Number(c.material?.price || 0)
                    const qty = parseFloat(c.quantityFormula || "1") || 1
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="pl-6 py-3">
                          <div className="flex items-center gap-2">
                             <Component className="h-4 w-4 text-muted-foreground opacity-50" />
                             <span className="text-sm font-medium">{c.material?.name || "Desconhecido"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-md">
                            {qty} un
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6 font-bold text-sm">
                          {formatCurrency(price * qty)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {selectedKit.components.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Nenhum componente vinculado a este kit na base de dados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <div className="shrink-0 p-4 border-t bg-muted/20 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Custo Total de Tabela</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(getKitTotal(selectedKit))}
                </span>
              </div>
              <Button onClick={() => setIsModalOpen(false)}>Fechar Detalhamento</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
