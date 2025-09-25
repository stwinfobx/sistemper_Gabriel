"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Building2,
  RotateCcw,
  Eye,
  Percent,
  Plus,
  DollarSign,
  TrendingUp,
  RefreshCw,
  FileText,
  Scissors,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AluminumItem {
  id: string
  nome: string
  categoria: string
  linha: string
}

interface CalculationData {
  item: string
  largura: number
  altura: number
  quantidade: number
  corVidro: string
  corPerfil: string
  ambiente: string
  aproveitamento: boolean
  margem: number
  valorUnitario: number
  valorTotal: number
}

export function AluminumCalculationForm() {
  const [calculationData, setCalculationData] = useState<CalculationData>({
    item: "",
    largura: 0,
    altura: 0,
    quantidade: 1,
    corVidro: "",
    corPerfil: "",
    ambiente: "",
    aproveitamento: false,
    margem: 0,
    valorUnitario: 0,
    valorTotal: 0,
  })

  const [showMarginModal, setShowMarginModal] = useState(false)
  const [showCostModal, setShowCostModal] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Mock data for aluminum items
  const aluminumItems: AluminumItem[] = [
    { id: "1", nome: "Janela 2 Folhas (Opção 1) GOLD", categoria: "Janela", linha: "GOLD" },
    { id: "2", nome: "Janela 4 Folhas GOLD", categoria: "Janela", linha: "GOLD" },
    { id: "3", nome: "Porta 2 Folhas PREMIUM", categoria: "Porta", linha: "PREMIUM" },
    { id: "4", nome: "Porta de Correr 3 Folhas GOLD", categoria: "Porta", linha: "GOLD" },
    { id: "5", nome: "Janela Maxim-Ar STANDARD", categoria: "Janela", linha: "STANDARD" },
    { id: "6", nome: "Porta Pivotante PREMIUM", categoria: "Porta", linha: "PREMIUM" },
  ]

  const glassColors = [
    "Incolor 6mm",
    "Incolor 8mm",
    "Fumê 6mm",
    "Fumê 8mm",
    "Verde 6mm",
    "Verde 8mm",
    "Bronze 6mm",
    "Bronze 8mm",
  ]

  const profileColors = [
    "Branco",
    "Preto",
    "Bronze Anod",
    "Bronze Pint",
    "Brilhante",
    "Champanhe",
    "Natural Cromado",
    "Branco Brilhante",
    "Amadeirado",
  ]

  const handleInputChange = (field: keyof CalculationData, value: string | number | boolean) => {
    setCalculationData((prev) => ({ ...prev, [field]: value }))
    setMessage(null)

    // Auto-calculate when relevant fields change
    if (["largura", "altura", "quantidade", "margem", "aproveitamento"].includes(field as string)) {
      setTimeout(() => calculateValues(), 100)
    }
  }

  const calculateValues = () => {
    if (!calculationData.item || !calculationData.largura || !calculationData.altura) {
      return
    }

    setIsCalculating(true)

    // Mock calculation logic for aluminum
    setTimeout(() => {
      const area = (calculationData.largura * calculationData.altura) / 1000000 // Convert mm² to m²
      const perimeter = ((calculationData.largura + calculationData.altura) * 2) / 1000 // Convert mm to m

      // Base costs
      let glassCost = area * 120 // R$ 120 per m² for glass
      let aluminumCost = perimeter * 80 // R$ 80 per linear meter for aluminum
      const hardwareCost = 150 // Fixed hardware cost
      const laborCost = area * 50 // R$ 50 per m² for labor

      // Apply optimization factor if aproveitamento is enabled
      if (calculationData.aproveitamento) {
        aluminumCost *= 0.93 // 7% reduction for material optimization
        glassCost *= 0.95 // 5% reduction for glass optimization
      }

      const baseCost = glassCost + aluminumCost + hardwareCost + laborCost
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
      quantidade: 1,
      corVidro: "",
      corPerfil: "",
      ambiente: "",
      aproveitamento: false,
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

  const selectedItem = aluminumItems.find((item) => item.id === calculationData.item)

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
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Cálculo Rápido de Esquadrias</h1>
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
                <CardDescription>Escolha o modelo de esquadria de alumínio</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="item">Procure o item</Label>
                  <Select value={calculationData.item} onValueChange={(value) => handleInputChange("item", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aluminumItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedItem && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Linha: {selectedItem.linha} | Categoria: {selectedItem.categoria}
                    </p>
                  )}
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
                  <div>
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={calculationData.quantidade}
                      onChange={(e) => handleInputChange("quantidade", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle>Características do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="corVidro">Cor de Vidro</Label>
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
                    <Label htmlFor="corPerfil">Cor de Perfil</Label>
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
                    placeholder="Ex: Sala, Cozinha, Quarto"
                  />
                </div>

                {/* Aproveitamento Switch */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="aproveitamento" className="font-medium">
                        Aproveitamento
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Otimização de corte para reduzir desperdício de material
                    </p>
                  </div>
                  <Switch
                    id="aproveitamento"
                    checked={calculationData.aproveitamento}
                    onCheckedChange={(checked) => handleInputChange("aproveitamento", checked)}
                  />
                </div>

                {calculationData.aproveitamento && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      Aproveitamento ativado: redução de ~7% no custo de material por otimização de corte.
                    </p>
                  </div>
                )}
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

        {/* Cost Modal */}
        {showCostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg mx-4">
              <CardHeader>
                <CardTitle>Detalhamento de Custos</CardTitle>
                <CardDescription>Breakdown dos custos do item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Custo do Vidro:</span>
                    <span>{formatCurrency(120 * ((calculationData.largura * calculationData.altura) / 1000000))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo do Alumínio:</span>
                    <span>
                      {formatCurrency(
                        80 *
                          (((calculationData.largura + calculationData.altura) * 2) / 1000) *
                          (calculationData.aproveitamento ? 0.93 : 1),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ferragens:</span>
                    <span>{formatCurrency(150)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mão de Obra:</span>
                    <span>{formatCurrency(50 * ((calculationData.largura * calculationData.altura) / 1000000))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Custo Total:</span>
                    <span>{formatCurrency(calculationData.valorUnitario / (1 + calculationData.margem / 100))}</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold">
                    <span>Preço Final:</span>
                    <span>{formatCurrency(calculationData.valorUnitario)}</span>
                  </div>
                </div>
                <Button onClick={() => setShowCostModal(false)} className="w-full">
                  Fechar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
