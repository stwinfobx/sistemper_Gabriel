"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type GlassRow = {
  id: string
  description: string
  thickness: string
  basePrice: number
  reference: number
}

type GlassVendor = {
  id: "tempermax" | "divinal" | "blindex"
  title: string
  subtitle: string
  accent: string
  rows: GlassRow[]
}

const STORAGE_KEY = "sistemper-glass-adjustments"

const glassVendors: GlassVendor[] = [
  {
    id: "tempermax",
    title: "Tempera 1 • Tempermax",
    subtitle: "Linha padrão utilizada na regra principal do sistema",
    accent: "border-blue-500/40 bg-blue-500/10",
    rows: [
      { id: "g1", description: "Incolor", thickness: "06 mm", basePrice: 105.2, reference: 2 },
      { id: "g2", description: "Incolor", thickness: "08 mm", basePrice: 148.76, reference: 3 },
      { id: "g3", description: "Incolor", thickness: "10 mm", basePrice: 191.8, reference: 3 },
      { id: "g4", description: "Fumé", thickness: "06 mm", basePrice: 140.65, reference: 2 },
      { id: "g5", description: "Fumé", thickness: "08 mm", basePrice: 198.93, reference: 3 },
      { id: "g6", description: "Verde", thickness: "06 mm", basePrice: 140.52, reference: 2 },
      { id: "g7", description: "Bronze", thickness: "08 mm", basePrice: 216.98, reference: 3 },
      { id: "g8", description: "Refletivo Fumê", thickness: "08 mm", basePrice: 217.2, reference: 3 },
      { id: "g9", description: "Jacobcel Branco", thickness: "08 mm", basePrice: 191.65, reference: 3 },
    ],
  },
  {
    id: "divinal",
    title: "Tempera 2 • Divinal",
    subtitle: "Referência alternativa para veículos especiais e boxes",
    accent: "border-orange-500/40 bg-orange-500/10",
    rows: [
      { id: "d1", description: "Incolor", thickness: "06 mm", basePrice: 119.01, reference: 2 },
      { id: "d2", description: "Incolor", thickness: "08 mm", basePrice: 176.12, reference: 3 },
      { id: "d3", description: "Incolor", thickness: "10 mm", basePrice: 241.9, reference: 3 },
      { id: "d4", description: "Fumé", thickness: "06 mm", basePrice: 125.61, reference: 2 },
      { id: "d5", description: "Fumé", thickness: "08 mm", basePrice: 205.55, reference: 3 },
      { id: "d6", description: "Verde", thickness: "06 mm", basePrice: 125.61, reference: 2 },
      { id: "d7", description: "Verde", thickness: "08 mm", basePrice: 205.55, reference: 3 },
      { id: "d8", description: "Bronze", thickness: "08 mm", basePrice: 216.97, reference: 3 },
      { id: "d9", description: "Box Incolor", thickness: "08 mm", basePrice: 102.78, reference: 3 },
    ],
  },
  {
    id: "blindex",
    title: "Tempera 3 • Blindex",
    subtitle: "Tabela premium para obras de alto padrão",
    accent: "border-cyan-500/40 bg-cyan-500/10",
    rows: [
      { id: "b1", description: "Incolor", thickness: "06 mm", basePrice: 107.8, reference: 2 },
      { id: "b2", description: "Incolor", thickness: "08 mm", basePrice: 137.2, reference: 3 },
      { id: "b3", description: "Incolor", thickness: "10 mm", basePrice: 191.8, reference: 3 },
      { id: "b4", description: "Fumé", thickness: "06 mm", basePrice: 90.55, reference: 2 },
      { id: "b5", description: "Verde", thickness: "08 mm", basePrice: 148.12, reference: 3 },
      { id: "b6", description: "Bronze", thickness: "08 mm", basePrice: 156.41, reference: 3 },
      { id: "b7", description: "Refletivo Verde", thickness: "08 mm", basePrice: 164.64, reference: 3 },
      { id: "b8", description: "Jacobcel Branco", thickness: "10 mm", basePrice: 139.94, reference: 3 },
      { id: "b9", description: "Box Fumé", thickness: "08 mm", basePrice: 78.2, reference: 3 },
    ],
  },
]

const defaultAdjustments: Record<GlassVendor["id"], number> = {
  tempermax: 8,
  divinal: 6,
  blindex: 5,
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value)

export function GlassTables() {
  const [adjustments, setAdjustments] = useState<Record<GlassVendor["id"], number>>(defaultAdjustments)

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (stored) {
        const parsed = JSON.parse(stored) as Record<GlassVendor["id"], number>
        setAdjustments((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore hydration issues
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adjustments))
    }
  }, [adjustments])

  const handleAdjustmentChange = (vendorId: GlassVendor["id"], value: string) => {
    const parsed = Number(value.replace(",", "."))
    if (Number.isNaN(parsed)) return
    setAdjustments((prev) => ({ ...prev, [vendorId]: parsed }))
  }

  const totals = useMemo(() => {
    return glassVendors.map((vendor) => {
      const total = vendor.rows.reduce((acc, row) => {
        const final = row.basePrice * (1 + (adjustments[vendor.id] ?? 0) / 100)
        return acc + final
      }, 0)
      return { id: vendor.id, total }
    })
  }, [adjustments])

  return (
    <div className="space-y-8">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Regra do sistema</CardTitle>
          <CardDescription>
            Não digitar onde há fundo colorido na planilha original. Para vidros com espessura igual ou menor que 8mm,
            utilizar o número <strong>2</strong> na coluna de referência. Para vidros a partir de 10mm utilizar o número{" "}
            <strong>3</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {glassVendors.map((vendor) => (
            <div key={vendor.id} className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{vendor.title}</Badge>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Ajuste atual: {adjustments[vendor.id] ?? 0}%
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <Label htmlFor={`ajuste-${vendor.id}`}>Aumento em %</Label>
                <Input
                  id={`ajuste-${vendor.id}`}
                  type="number"
                  step="0.1"
                  value={adjustments[vendor.id] ?? 0}
                  onChange={(event) => handleAdjustmentChange(vendor.id, event.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {glassVendors.map((vendor) => (
        <Card key={vendor.id} className={`shadow-lg border ${vendor.accent}`}>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">{vendor.title}</CardTitle>
                <CardDescription>{vendor.subtitle}</CardDescription>
              </div>
              <Badge variant="outline">
                Total previsto:{" "}
                {formatCurrency(
                  totals.find((item) => item.id === vendor.id)?.total ?? 0,
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Vidro</TableHead>
                    <TableHead>Espessura</TableHead>
                    <TableHead className="text-right">Tabela base</TableHead>
                    <TableHead className="text-right">Ajuste (%)</TableHead>
                    <TableHead className="text-right">Valor final</TableHead>
                    <TableHead className="text-center">Regra nº</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.rows.map((row) => {
                    const increase = adjustments[vendor.id] ?? 0
                    const finalPrice = row.basePrice * (1 + increase / 100)
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-semibold">{row.description}</TableCell>
                        <TableCell>{row.thickness}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.basePrice)}</TableCell>
                        <TableCell className="text-right text-primary">{increase.toFixed(2)}%</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(finalPrice)}</TableCell>
                        <TableCell className="text-center font-medium">{row.reference}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

