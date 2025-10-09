"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type KitCategory = "box" | "sacada" | "portas" | "corrimao"

type KitRow = {
  id: string
  code: string
  name: string
  category: KitCategory
  basePrice: number
  markup: number
  description: string
}

const kits: KitRow[] = [
  {
    id: "k1",
    code: "KBX-100",
    name: "Kit Box Frontal 1.00",
    category: "box",
    basePrice: 181.71,
    markup: 12,
    description: "Box frontal padrão 100x100 com perfis anodizados.",
  },
  {
    id: "k2",
    code: "KBX-120",
    name: "Kit Box Frontal 1.20",
    category: "box",
    basePrice: 226.95,
    markup: 12,
    description: "Kit box frontal 120x120 com roldanas embutidas.",
  },
  {
    id: "k3",
    code: "KBC-080",
    name: "Kit Box Canto 0.80",
    category: "box",
    basePrice: 417.67,
    markup: 14,
    description: "Kit box de canto com fechamento magnético e perfil cromado.",
  },
  {
    id: "k4",
    code: "KSC-180",
    name: "Kit Sacada Light 1.80",
    category: "sacada",
    basePrice: 512.5,
    markup: 18,
    description: "Sacada leve com escovinhas superiores e inferiores.",
  },
  {
    id: "k5",
    code: "KSC-300",
    name: "Kit Sacada Plus 3.00",
    category: "sacada",
    basePrice: 887.27,
    markup: 20,
    description: "Linha reforçada para vãos grandes com perfis Stanley.",
  },
  {
    id: "k6",
    code: "KPT-180",
    name: "Kit Porta Pivotante 1F",
    category: "portas",
    basePrice: 327.84,
    markup: 15,
    description: "Kit porta pivotante completa com fecho superior.",
  },
  {
    id: "k7",
    code: "KPT-240",
    name: "Kit Porta Pivotante Dupla",
    category: "portas",
    basePrice: 601.13,
    markup: 15,
    description: "Porta pivotante dupla com regulagem e puxadores inclusos.",
  },
  {
    id: "k8",
    code: "KCR-050",
    name: "Kit Corrimão Superior 50cm",
    category: "corrimao",
    basePrice: 135.0,
    markup: 8,
    description: "Corrimão em alumínio com acabamento acetinado.",
  },
  {
    id: "k9",
    code: "KCR-100",
    name: "Kit Corrimão Superior 1m",
    category: "corrimao",
    basePrice: 210.0,
    markup: 8,
    description: "Corrimão superior completo com suportes universais.",
  },
]

const categoryLabels: Record<KitCategory, string> = {
  box: "Boxes e banheiros",
  sacada: "Sacadas e varandas",
  portas: "Portas especiais",
  corrimao: "Corrimãos e apoios",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)

export function AluminumKitsTable() {
  const [filter, setFilter] = useState("")

  const filtered = useMemo(() => {
    if (!filter) return kits
    const normalized = filter.trim().toLowerCase()
    return kits.filter(
      (kit) =>
        kit.name.toLowerCase().includes(normalized) ||
        kit.code.toLowerCase().includes(normalized) ||
        categoryLabels[kit.category].toLowerCase().includes(normalized),
    )
  }, [filter])

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Kits em alumínio</CardTitle>
          <CardDescription>Selecione um kit para aplicar reajuste percentual conforme tabela de fornecedores.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="busca-kits">Pesquisar por código, categoria ou nome</Label>
          <Input
            id="busca-kits"
            placeholder="Ex.: KBX-100, sacada, pivotante"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="overflow-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Código</TableHead>
              <TableHead>Kit</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Tabela base</TableHead>
              <TableHead className="text-right">Markup (%)</TableHead>
              <TableHead className="text-right">Preço sugerido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((kit) => {
              const suggested = kit.basePrice * (1 + kit.markup / 100)
              return (
                <TableRow key={kit.id}>
                  <TableCell className="font-semibold">{kit.code}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{kit.name}</span>
                      <span className="text-xs text-muted-foreground">{kit.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[kit.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(kit.basePrice)}</TableCell>
                  <TableCell className="text-right text-primary">{kit.markup.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(suggested)}</TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                  Nenhum kit encontrado com esse filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

