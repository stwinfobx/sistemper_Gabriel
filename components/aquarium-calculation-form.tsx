"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Fish, RotateCcw, RefreshCw, FileText, Droplets, Ruler } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AquariumData {
  largura: number
  altura: number
  profundidade: number
  espessura: number
  fornecedor: "Tempermax" | "Divinal" | "Blindex" | ""
  maoDeObra: number
  volumeLitros: number
  custoVidro: number
  custoMaoDeObra: number
  custoTotal: number
}

export function AquariumCalculationForm() {
  const [aquariumData, setAquariumData] = useState<AquariumData>({
    largura: 0,
    altura: 0,
    profundidade: 0,
    espessura: 6,
    fornecedor: "",
    maoDeObra: 1.5, // Coeficiente padrão
    volumeLitros: 0,
    custoVidro: 0,
    custoMaoDeObra: 0,
    custoTotal: 0,
  })

  const [isCalculating, setIsCalculating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const espessuraOptions = [6, 8, 10, 12, 15, 19]

  // Price per m² by thickness and supplier (mock data)
  const priceTable = {
    Tempermax: { 6: 180, 8: 220, 10: 280, 12: 350, 15: 450, 19: 580 },
    Divinal: { 6: 175, 8: 215, 10: 275, 12: 340, 15: 440, 19: 570 },
    Blindex: { 6: 185, 8: 225, 10: 285, 12: 360, 15: 460, 19: 590 },
  }

  const handleInputChange = (field: keyof AquariumData, value: string | number) => {
    setAquariumData((prev) => ({ ...prev, [field]: value }))
    setMessage(null)

    // Auto-calculate when relevant fields change
    if (["largura", "altura", "profundidade", "espessura", "fornecedor", "maoDeObra"].includes(field as string)) {
      setTimeout(() => calculateValues(), 100)
    }
  }

  const calculateValues = () => {
    if (!aquariumData.largura || !aquariumData.altura || !aquariumData.profundidade || !aquariumData.fornecedor) {
      return
    }

    setIsCalculating(true)

    setTimeout(() => {
      // Convert mm to meters for area calculation
      const larguraM = aquariumData.largura / 1000
      const alturaM = aquariumData.altura / 1000
      const profundidadeM = aquariumData.profundidade / 1000

      // Calculate volume in liters
      const volumeLitros = (aquariumData.largura * aquariumData.altura * aquariumData.profundidade) / 1000000

      // Calculate glass area (5 faces: bottom + 4 sides)
      const areaFundo = larguraM * profundidadeM
      const areaFrente = larguraM * alturaM
      const areaTras = larguraM * alturaM
      const areaLateral1 = profundidadeM * alturaM
      const areaLateral2 = profundidadeM * alturaM

      const areaTotal = areaFundo + areaFrente + areaTras + areaLateral1 + areaLateral2

      // Get price per m² based on thickness and supplier
      const pricePerM2 =
        priceTable[aquariumData.fornecedor][aquariumData.espessura as keyof typeof priceTable.Tempermax]
      const custoVidro = areaTotal * pricePerM2

      // Calculate labor cost (coefficient × area)
      const custoMaoDeObra = areaTotal * aquariumData.maoDeObra * 100 // R$ 100 base per m²

      const custoTotal = custoVidro + custoMaoDeObra

      setAquariumData((prev) => ({
        ...prev,
        volumeLitros,
        custoVidro,
        custoMaoDeObra,
        custoTotal,
      }))

      setIsCalculating(false)
    }, 500)
  }

  const handleClear = () => {
    setAquariumData({
      largura: 0,
      altura: 0,
      profundidade: 0,
      espessura: 6,
      fornecedor: "",
      maoDeObra: 1.5,
      volumeLitros: 0,
      custoVidro: 0,
      custoMaoDeObra: 0,
      custoTotal: 0,
    })
    setMessage(null)
  }

  const handleLaunch = () => {
    if (!aquariumData.largura || !aquariumData.altura || !aquariumData.profundidade) {
      setMessage({ type: "error", text: "Preencha todas as dimensões." })
      return
    }

    if (!aquariumData.fornecedor) {
      setMessage({ type: "error", text: "Selecione um fornecedor." })
      return
    }

    // Simulate adding to quote sheet
    setMessage({ type: "success", text: "Aquário lançado na folha." })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatVolume = (liters: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(liters)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/calculo/vidros">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Fish className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Aquário (Vidro Temperado)</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
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
            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ruler className="h-5 w-5" />
                  <span>Dimensões do Aquário</span>
                </CardTitle>
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
                      value={aquariumData.largura || ""}
                      onChange={(e) => handleInputChange("largura", Number.parseInt(e.target.value) || 0)}
                      placeholder="Ex: 1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altura">Altura (mm) *</Label>
                    <Input
                      id="altura"
                      type="number"
                      min="1"
                      value={aquariumData.altura || ""}
                      onChange={(e) => handleInputChange("altura", Number.parseInt(e.target.value) || 0)}
                      placeholder="Ex: 500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profundidade">Profundidade (mm) *</Label>
                    <Input
                      id="profundidade"
                      type="number"
                      min="1"
                      value={aquariumData.profundidade || ""}
                      onChange={(e) => handleInputChange("profundidade", Number.parseInt(e.target.value) || 0)}
                      placeholder="Ex: 400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Glass Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Especificações do Vidro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="espessura">Espessura do Vidro (mm)</Label>
                    <Select
                      value={aquariumData.espessura.toString()}
                      onValueChange={(value) => handleInputChange("espessura", Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {espessuraOptions.map((thickness) => (
                          <SelectItem key={thickness} value={thickness.toString()}>
                            {thickness}mm
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Select
                      value={aquariumData.fornecedor}
                      onValueChange={(value) => handleInputChange("fornecedor", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tempermax">Tempermax</SelectItem>
                        <SelectItem value="Divinal">Divinal</SelectItem>
                        <SelectItem value="Blindex">Blindex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maoDeObra">Coeficiente Mão de Obra</Label>
                  <Input
                    id="maoDeObra"
                    type="number"
                    min="0"
                    step="0.1"
                    value={aquariumData.maoDeObra}
                    onChange={(e) => handleInputChange("maoDeObra", Number.parseFloat(e.target.value) || 0)}
                    placeholder="1.5"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Multiplicador para cálculo da mão de obra (padrão: 1.5)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Volume Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5" />
                  <span>Volume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {isCalculating ? "..." : formatVolume(aquariumData.volumeLitros)}
                  </div>
                  <div className="text-sm text-muted-foreground">Litros</div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Custos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Custo do Vidro:</span>
                    <span className="font-medium">
                      {isCalculating ? "..." : formatCurrency(aquariumData.custoVidro)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mão de Obra:</span>
                    <span className="font-medium">
                      {isCalculating ? "..." : formatCurrency(aquariumData.custoMaoDeObra)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Custo Total:</span>
                    <span className="font-bold text-xl text-primary">
                      {isCalculating ? "..." : formatCurrency(aquariumData.custoTotal)}
                    </span>
                  </div>
                </div>

                {aquariumData.fornecedor && aquariumData.espessura && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Preço {aquariumData.fornecedor}:{" "}
                      {formatCurrency(
                        priceTable[aquariumData.fornecedor][
                          aquariumData.espessura as keyof typeof priceTable.Tempermax
                        ],
                      )}
                      /m²
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
      </main>
    </div>
  )
}
