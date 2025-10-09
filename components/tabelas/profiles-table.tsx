"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ProfileRow = {
  id: string
  code: string
  name: string
  category: string
  adjustment: number
  basePrice: number
  image: string
}

const profiles: ProfileRow[] = [
  {
    id: "p1",
    code: "PRF-U08",
    name: "Perfil U 08mm",
    category: "Estrutural",
    adjustment: 6,
    basePrice: 41.2,
    image: "/placeholder.jpg",
  },
  {
    id: "p2",
    code: "PRF-T10",
    name: "Trilho Superior 10mm",
    category: "Trilhos",
    adjustment: 5,
    basePrice: 56.93,
    image: "/placeholder.jpg",
  },
  {
    id: "p3",
    code: "PRF-CLP",
    name: "Clip Junta",
    category: "Estrutural",
    adjustment: 4,
    basePrice: 9.9,
    image: "/placeholder.jpg",
  },
  {
    id: "p4",
    code: "PRF-ESQ",
    name: "Escovinha 3M",
    category: "Vedação",
    adjustment: 3,
    basePrice: 11.5,
    image: "/placeholder.jpg",
  },
  {
    id: "p5",
    code: "PRF-LTR",
    name: "Light Roller Inferior",
    category: "Rolos",
    adjustment: 8,
    basePrice: 95.0,
    image: "/placeholder.jpg",
  },
  {
    id: "p6",
    code: "PRF-CN8",
    name: "Cantoneira 8mm",
    category: "Estrutural",
    adjustment: 4,
    basePrice: 26.43,
    image: "/placeholder.jpg",
  },
  {
    id: "p7",
    code: "PRF-PIS",
    name: "Perfil de Piso 2\"",
    category: "Estrutural",
    adjustment: 6,
    basePrice: 65.9,
    image: "/placeholder.jpg",
  },
  {
    id: "p8",
    code: "PRF-STN",
    name: "Trilho Sup. Stanley",
    category: "Kit Box",
    adjustment: 7,
    basePrice: 117.87,
    image: "/placeholder.jpg",
  },
  {
    id: "p9",
    code: "PRF-SUP",
    name: "Suporte Mão Amiga",
    category: "Acessórios",
    adjustment: 5,
    basePrice: 18.55,
    image: "/placeholder.jpg",
  },
]

const puxadores = [
  { code: "PX-ONIX30", name: "Puxador Ônix 30cm", price: 268.0 },
  { code: "PX-SAF30", name: "Puxador Safira 30cm", price: 320.0 },
  { code: "PX-H40", name: "Puxador H 40cm", price: 90.0 },
  { code: "PX-MAD", name: "Puxador Bola Madeira", price: 35.0 },
]

const maxArArms = [
  { code: "MX-15", size: "15 cm", price: 34.36 },
  { code: "MX-25", size: "25 cm", price: 45.33 },
  { code: "MX-35", size: "35 cm", price: 79.02 },
  { code: "MX-45", size: "45 cm", price: 99.63 },
  { code: "MX-60", size: "60 cm", price: 113.37 },
  { code: "MX-100", size: "1 m", price: 171.78 },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)

export function ProfilesTable() {
  const [search, setSearch] = useState("")

  const filteredProfiles = useMemo(() => {
    if (!search) return profiles
    const normalized = search.trim().toLowerCase()
    return profiles.filter(
      (profile) =>
        profile.code.toLowerCase().includes(normalized) ||
        profile.name.toLowerCase().includes(normalized) ||
        profile.category.toLowerCase().includes(normalized),
    )
  }, [search])

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Tabela de perfis</CardTitle>
          <CardDescription>Confira ajustes de perfis estruturais, trilhos e acessórios ligados aos kits de alumínio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="busca-perfis">Pesquisar por código ou descrição</Label>
          <Input
            id="busca-perfis"
            placeholder="Ex.: PRF-U08, trilho, escovinha..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="overflow-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Imagem</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Tabela base</TableHead>
              <TableHead className="text-right">Aumento (%)</TableHead>
              <TableHead className="text-right">Preço reajustado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => {
              const finalPrice = profile.basePrice * (1 + profile.adjustment / 100)
              return (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="relative h-12 w-16 overflow-hidden rounded-md border bg-muted">
                      <Image src={profile.image} alt={profile.name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{profile.code}</TableCell>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(profile.basePrice)}</TableCell>
                  <TableCell className="text-right text-primary">{profile.adjustment.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(finalPrice)}</TableCell>
                </TableRow>
              )
            })}
            {filteredProfiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                  Nenhum perfil encontrado. Ajuste a busca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Listas rápidas</CardTitle>
          <CardDescription>Consulte os puxadores e braços de max-ar homologados para o catálogo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Lista de puxadores
            </Label>
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-3 space-y-3">
                {puxadores.map((item) => (
                  <div key={item.code} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.code}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Braços de max-ar
            </Label>
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-3 space-y-3">
                {maxArArms.map((item) => (
                  <div key={item.code} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.size}</span>
                      <span className="text-xs text-muted-foreground">{item.code}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground">
        Os valores apresentados são referências internas. Ajustes adicionais podem ser registrados no módulo de itens
        adicionais.
      </p>
    </div>
  )
}

