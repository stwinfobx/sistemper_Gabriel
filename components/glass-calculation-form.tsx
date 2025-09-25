"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calculator,
  RotateCcw,
  Eye,
  Percent,
  Plus,
  DollarSign,
  TrendingUp,
  Fish,
  RefreshCw,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GlassItem {
  id: string
  nome: string
  categoria: string
}

interface CalculationData {
  item: string
  largura: number
  altura: number
  largura2?: number
  quantidade: number
  temperado: "Tempermax" | "Divinal" | "Blindex" | ""
  corVidro: string
  corPerfil: string
  ambiente: string
  margem: number
  valorUnitario: number
  valorTotal: number
}

export function GlassCalculationForm() {
  const [calculationData, setCalculationData] = useState<CalculationData>({
    item: "",
    largura: 0,
    altura: 0,
    largura2: undefined,
    quantidade: 1,
    temperado: "",
    corVidro: "",
    corPerfil: "",
    ambiente: "",
    margem: 0,
    valorUnitario: 0,
    valorTotal: 0,
  })

  const [showMarginModal, setShowMarginModal] = useState(false)
  const [showCostModal, setShowCostModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Mock data
  const glassItems: GlassItem[] = [
    { id: "1", nome: "Janela 4 Folhas", categoria: "Janela" },
    { id: "2", nome: "Porta de Correr", categoria: "Porta" },
    { id: "3", nome: "Box Frontal", categoria: "Box" },
    { id: "4", nome: "Box de Canto", categoria: "Box" },
    { id: "5", nome: "Janela 2 Folhas", categoria: "Janela" },
    { id: "6", nome: "Porta Pivotante", categoria: "Porta" },
  ]

  const glassColors = [
    "Incolor 6mm",
    "Incolor 8mm",
    "Incolor 10mm",
    "Fumê 6mm",
    "Fumê 8mm",
    "Verde 6mm",
    "Verde 8mm",
    "Bronze 6mm",
    "Bronze 8mm",
  ]

  const profileColors = ["Branco", "Preto", "Bronze Anod", "Bronze Pint", "Brilhante", "Champanhe", "Natural Cromado"]

  const handleInputChange = (field: keyof CalculationData, value: string | number) => {
    setCalculationData((prev) => ({ ...prev, [field]: value }))
    setMessage(null)

    // Auto-calculate when relevant fields change
    if (["largura", "altura", "quantidade", "margem"].includes(field)) {
      setTimeout(() => calculateValues(), 100)
    }
  }

  const calculateValues = () => {
    if (!calculationData.item || !calculationData.largura || !calculationData.altura) {
      return
    }

    setIsCalculating(true)

    // Mock calculation logic
    setTimeout(() => {
      const area = (calculationData.largura * calculationData.altura) / 1000000 // Convert mm² to m²
      const baseCost = area * 150 // R$ 150 per m² base cost
      const marginMultiplier = 1 + calculationData.margem / 100
      const unitPrice = baseCost * marginMultiplier
      const totalPrice = unitPrice * calculationData.quantidade

      setCalculationData((prev) => ({
        ...prev,
        valorUnitario: unitPrice,
        valorTotal: totalPrice,
      }))

      setIsCalculating(false)
    }, 500)
  }

  const handleClear = () => {
    setCalculationData({
      item: "",
      largura: 0,
      altura: 0,
      largura2: undefined,
      quantidade: 1,
      temperado: "",
      corVidro: "",
      corPerfil: "",
      ambiente: "",
      margem: 0,
      valorUnitario: 0,
      valorTotal: 0,
    })
    setMessage(null)
  }

  const handleLaunch = () => {
    if (!calculationData.item) {
      setMessage({ type: "error", text: "Selecione um item." })
      return
    }

    if (!calculationData.largura || !calculationData.altura) {
      setMessage({ type: "error", text: "Dimensões inválidas." })
      return
    }

    // Simulate adding to quote sheet
    setMessage({ type: "success", text: "Item lançado na folha." })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const selectedItem = glassItems.find((item) => item.id === calculationData.item)
  const needsSecondWidth = selectedItem?.nome.includes("Canto")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Calculator className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Cálculo Rápido de Vidros</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                <Eye className="h-4 w-4" />
                <span>Ver Folha</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Status Messages */}
        {message && (
          <Alert
            className={`mb-6 ${
              message.type === "success"
                ? "border-green-500/20 bg-green-500/5"
                : "border-destructive/20 bg-destructive/5"
            }`}
          >
            <AlertDescription className={message.type === "success" ? "text-green-700" : "text-destructive"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Seleção do Item</CardTitle>
                <CardDescription>Escolha o tipo de produto para orçamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="item">Procure o item</Label>
                  <Select value={calculationData.item} onValueChange={(value) => handleInputChange("item", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {glassItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nome} ({item.categoria})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensões</CardTitle>
                <CardDescription>Medidas em milímetros (mm)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="largura">Largura (mm) *</Label>
                    <Input
                      id="largura"
                      type="number"
                      min="1"
                      value={calculationData.largura || ""}
                      onChange={(e) => handleInputChange("largura", Number.parseInt(e.target.value) || 0)}
                      placeholder="Ex: 1200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altura">Altura (mm) *</Label>
                    <Input
                      id="altura"
                      type="number"
                      min="1"
                      value={calculationData.altura || ""}
                      onChange={(e) => handleInputChange("altura", Number.parseInt(e.target.value) || 0)}
                      placeholder="Ex: 1500"
                    />
                  </div>
                  {needsSecondWidth && (
                    <div>
                      <Label htmlFor="largura2">Largura 2 (Canto) (mm)</Label>
                      <Input
                        id="largura2"
                        type="number"
                        min="1"
                        value={calculationData.largura2 || ""}
                        onChange={(e) => handleInputChange("largura2", Number.parseInt(e.target.value) || 0)}
                        placeholder="Ex: 800"
                      />
                    </div>
                  )}
                </div>
                <div className="w-full md:w-32">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={calculationData.quantidade}
                    onChange={(e) => handleInputChange("quantidade", Number.parseInt(e.target.value) || 1)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle>Características do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Temperado</Label>
                  <div className="flex space-x-4 mt-2">
                    {["Tempermax", "Divinal", "Blindex"].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="temperado"
                          value={option}
                          checked={calculationData.temperado === option}
                          onChange={(e) => handleInputChange("temperado", e.target.value)}
                          className="text-primary"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="corVidro">Cor do Vidro / espessura (mm)</Label>
                    <Select
                      value={calculationData.corVidro}
                      onValueChange={(value) => handleInputChange("corVidro", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {glassColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="corPerfil">Cor do Perfil</Label>
                    <Select
                      value={calculationData.corPerfil}
                      onValueChange={(value) => handleInputChange("corPerfil", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profileColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <Input
                    id="ambiente"
                    value={calculationData.ambiente}
                    onChange={(e) => handleInputChange("ambiente", e.target.value)}
                    placeholder="Ex: Sala, Cozinha, Banheiro"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results and Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Valores</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">R$ Unitário:</span>
                    <span className="font-semibold text-lg">
                      {isCalculating ? "..." : formatCurrency(calculationData.valorUnitario)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">R$ Total:</span>
                    <span className="font-bold text-xl text-primary">
                      {isCalculating ? "..." : formatCurrency(calculationData.valorTotal)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMarginModal(true)}
                    className="w-full flex items-center space-x-2 bg-transparent"
                  >
                    <Percent className="h-4 w-4" />
                    <span>Margem ({calculationData.margem}%)</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCostModal(true)}
                    className="w-full flex items-center space-x-2 bg-transparent"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Custos</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompareModal(true)}
                    className="w-full flex items-center space-x-2 bg-transparent"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Temperar + Barata</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/itens-adicionais">
                  <Button variant="outline" className="w-full flex items-center space-x-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    <span>Adicionais</span>
                  </Button>
                </Link>

                <Link href="/calculo/aquario">
                  <Button variant="outline" className="w-full flex items-center space-x-2 bg-transparent">
                    <Fish className="h-4 w-4" />
                    <span>Aquário</span>
                  </Button>
                </Link>

                <Button
                  onClick={calculateValues}
                  disabled={isCalculating}
                  className="w-full flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isCalculating ? "animate-spin" : ""}`} />
                  <span>Atualizar</span>
                </Button>

                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="w-full flex items-center space-x-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Limpar</span>
                </Button>

                <Button onClick={handleLaunch} className="w-full flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Lançar</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Margin Modal */}
        {showMarginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Aplicar Margem</CardTitle>
                <CardDescription>Defina a margem de lucro sobre o custo base</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="margem">Margem (%)</Label>
                  <Input
                    id="margem"
                    type="number"
                    min="0"
                    max="1000"
                    value={calculationData.margem}
                    onChange={(e) => handleInputChange("margem", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowMarginModal(false)} className="flex-1">
                    Aplicar
                  </Button>
                  <Button variant="outline" onClick={() => setShowMarginModal(false)} className="flex-1 bg-transparent">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
