"use client"

import { useState, useEffect } from "react"
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
  RefreshCw,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TypologySelector } from "./typology-selector"

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
  temperado: string
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
  const [selectedTipology, setSelectedTipology] = useState<any>(null)

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

  const [groupedMaterials, setGroupedMaterials] = useState<any[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [calculationResult, setCalculationResult] = useState<any>(null)

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await fetch("/api/materials?type=Glass&grouped=true")
        const data = await response.json()
        setGroupedMaterials(data.grouped || [])
      } catch (error) {
        console.error("Error fetching materials:", error)
      } finally {
        setLoadingMaterials(false)
      }
    }
    fetchMaterials()
  }, [])

  const availableGlassColors = groupedMaterials.map(m => m.baseName)

  const profileColors = ["Branco", "Preto", "Bronze Anod", "Bronze Pint", "Brilhante", "Champanhe", "Natural Cromado"]

  const handleInputChange = (field: keyof CalculationData, value: string | number) => {
    setCalculationData((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const calculateValues = async () => {
    if (!calculationData.item || !calculationData.largura || !calculationData.altura || !calculationData.temperado || !calculationData.corVidro) {
      return
    }

    setIsCalculating(true)

    try {
      // 1. Get the kit for this tipology (first kit for now)
      const tipologyRes = await fetch(`/api/tipologies/${calculationData.item}`)
      const tipology = await tipologyRes.json()
      const kitId = tipology.Kits?.[0]?.id

      if (!kitId) {
        console.error("No kit found for this tipology")
        return
      }

      // 2. Call the calculation engine API
      const calcRes = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitId,
          width: calculationData.largura,
          height: calculationData.altura,
          quantity: calculationData.quantidade,
          flags: { social: false } // placeholder
        })
      })

      const engineResult = await calcRes.json()

      // 3. Add glass area cost manually (since calculateKit calculates components only)
      const selectedGroup = groupedMaterials.find(m => m.baseName === calculationData.corVidro)
      const providerInfo = selectedGroup?.providers[calculationData.temperado]
      const glassUnitPrice = providerInfo?.price || 0
      
      const areaM2 = (calculationData.largura * calculationData.altura) / 1000000
      const glassTotalCost = areaM2 * glassUnitPrice * calculationData.quantidade
      
      const totalCostWithGlass = (engineResult.totalCost || 0) + glassTotalCost
      const marginMultiplier = 1 + (calculationData.margem / 100)
      
      setCalculationResult({
        ...engineResult,
        glassCost: glassTotalCost,
        totalCost: totalCostWithGlass * marginMultiplier
      })

      setCalculationData(prev => ({
        ...prev,
        valorUnitario: (totalCostWithGlass / calculationData.quantidade) * marginMultiplier,
        valorTotal: totalCostWithGlass * marginMultiplier
      }))

    } catch (error) {
      console.error("Calculation failed:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  useEffect(() => {
    if (groupedMaterials.length > 0) {
      calculateValues()
    }
  }, [calculationData.largura, calculationData.altura, calculationData.quantidade, calculationData.margem, calculationData.item, calculationData.temperado, calculationData.corVidro, groupedMaterials])

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

  const handleLaunch = async () => {
    if (!calculationData.item || !calculationData.valorTotal) {
      setMessage({ type: "error", text: "Realize o cálculo antes de lançar." })
      return
    }

    setIsCalculating(true)
    try {
      // 1. Get or create a draft budget number from localStorage
      let budgetNumber = localStorage.getItem("currentBudgetNumber")
      
      if (!budgetNumber) {
        // Create a new draft budget
        const startRes = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Em edição", items: [] })
        })
        const newBudget = await startRes.json()
        budgetNumber = newBudget.number
        if (budgetNumber) localStorage.setItem("currentBudgetNumber", budgetNumber)
      }

      // 2. Add the item to this budget
      const selectedGroup = groupedMaterials.find(m => m.baseName === calculationData.corVidro)
      const res = await fetch("/api/budgets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: budgetNumber,
          item: {
            tipologyId: calculationData.item,
            name: `${selectedTipology?.name || "Vidro"} - ${calculationData.corVidro} (${calculationData.temperado})`,
            width: calculationData.largura,
            height: calculationData.altura,
            quantity: calculationData.quantidade,
            unitPrice: calculationData.valorUnitario,
            totalPrice: calculationData.valorTotal,
            details: {
              corVidro: calculationData.corVidro,
              provider: calculationData.temperado,
              components: calculationResult?.components || []
            }
          }
        })
      })

      if (res.ok) {
        setMessage({ type: "success", text: `Item lançado no orçamento ${budgetNumber}!` })
      } else {
        setMessage({ type: "error", text: "Erro ao salvar item no orçamento." })
      }
    } catch (error) {
      console.error("Launch error:", error)
      setMessage({ type: "error", text: "Falha na comunicação com o servidor." })
    } finally {
      setIsCalculating(false)
    }
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
      <main className="container mx-auto px-6 py-8 max-w-6xl space-y-6">
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

        {/* 1. Catalog Section (Full Width) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Catálogo de Tipologias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TypologySelector
              category="Vidro"
              onSelect={(t) => {
                handleInputChange("item", t.id)
                setSelectedTipology(t)
              }}
            />
          </CardContent>
        </Card>

        {/* 2. Side-by-Side Configuration & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Configuration (2/3 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Dimensões (mm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="largura">Largura (mm) *</Label>
                    <Input
                      id="largura"
                      type="number"
                      min="1"
                      value={calculationData.largura || ""}
                      onChange={(e) => handleInputChange("largura", Number.parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="altura">Altura (mm) *</Label>
                    <Input
                      id="altura"
                      type="number"
                      min="1"
                      value={calculationData.altura || ""}
                      onChange={(e) => handleInputChange("altura", Number.parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
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

            {/* Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Especificações do Vidro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Cor / Desenho do Vidro</Label>
                    <Select
                      value={calculationData.corVidro}
                      onValueChange={(value) => handleInputChange("corVidro", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGlassColors.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Marca / Fornecedor</Label>
                    {!calculationData.corVidro ? (
                      <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border border-dashed">
                        Selecione o modelo do vidro primeiro
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        {Object.keys(groupedMaterials.find(m => m.baseName === calculationData.corVidro)?.providers || {}).map(brand => {
                          const price = groupedMaterials.find(m => m.baseName === calculationData.corVidro)?.providers[brand]?.price || 0
                          
                          return (
                            <div 
                              key={brand} 
                              className="group relative flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border transition-all flex-1" 
                              onClick={() => handleInputChange("temperado", brand)}
                            >
                               <input 
                                 type="radio" 
                                 name="brand" 
                                 checked={calculationData.temperado === brand} 
                                 className="h-4 w-4 text-primary"
                                 readOnly 
                               />
                               <div className="flex flex-col">
                                 <span className="text-xs font-semibold truncate max-w-[80px]">{brand}</span>
                                 <span className="text-[10px] text-muted-foreground">{price > 0 ? formatCurrency(price) : "Indisponível"}</span>
                               </div>
                            </div>
                          )
                        })}
                        {Object.keys(groupedMaterials.find(m => m.baseName === calculationData.corVidro)?.providers || {}).length === 0 && (
                          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border border-dashed w-full">
                            Sem fornecedores cadastrados para este vidro
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="corPerfil">Cor do Kit / Perfil</Label>
                    <Select
                      value={calculationData.corPerfil}
                      onValueChange={(value) => handleInputChange("corPerfil", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profileColors.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ambiente">Local da Obra (Ambiente)</Label>
                    <Input
                      id="ambiente"
                      value={calculationData.ambiente}
                      onChange={(e) => handleInputChange("ambiente", e.target.value)}
                      placeholder="Ex: Sala, Cozinha..."
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Results & Actions (1/3 columns) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                   <DollarSign className="h-5 w-5" /> Resumo de Valor
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">Preço Unitário:</span>
                    <span className="font-semibold text-lg">
                      {isCalculating ? "..." : formatCurrency(calculationData.valorUnitario)}
                    </span>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <span className="text-xs text-muted-foreground block mb-1">Total Geral Proposto</span>
                    <span className="font-bold text-3xl text-primary">
                      {isCalculating ? "..." : formatCurrency(calculationData.valorTotal)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowMarginModal(true)} className="w-full justify-between">
                      <span className="flex items-center gap-2"><Percent className="h-4 w-4" /> Margem de Lucro</span>
                      <span className="font-bold">{calculationData.margem}%</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCostModal(true)} className="w-full justify-between">
                      <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Composição de Custos</span>
                      <span className="text-[10px] uppercase font-bold text-primary">Ver</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                   <div className="flex gap-2">
                      <Button onClick={calculateValues} disabled={isCalculating} variant="outline" className="flex-1">
                         <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} /> Atualizar
                      </Button>
                      <Button onClick={handleClear} variant="outline" className="flex-1">
                         Limpar
                      </Button>
                   </div>

                   <Button 
                     onClick={handleLaunch} 
                     disabled={isCalculating} 
                     className="w-full py-6 font-bold uppercase tracking-wider"
                   >
                     <FileText className="h-5 w-5 mr-2" /> 
                     Lançar no Orçamento
                   </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Margin Modal */}
      {showMarginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Aplicar Margem</CardTitle>
              <CardDescription>Defina a porcentagem de lucro sobre o custo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Margem Atual: {calculationData.margem}%</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleInputChange("margem", Math.max(0, calculationData.margem - 5))}>-5%</Button>
                    <Button variant="outline" size="sm" onClick={() => handleInputChange("margem", calculationData.margem + 5)}>+5%</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                   <Label htmlFor="input-margem">Definir Valor:</Label>
                   <Input
                    id="input-margem"
                    type="number"
                    value={calculationData.margem}
                    onChange={(e) => handleInputChange("margem", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setShowMarginModal(false)} className="flex-1">Confirmar</Button>
                <Button variant="outline" onClick={() => setShowMarginModal(false)} className="flex-1">Fechar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cost Modal */}
      {showCostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-bold">Composição de Custos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground border-b pb-2">
                  <span>Item</span>
                  <span>Subtotal</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-muted/50">
                   <div className="flex flex-col">
                      <span className="text-sm font-medium">{calculationData.corVidro} ({calculationData.temperado})</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Área: {((calculationData.largura * calculationData.altura) / 1000000).toFixed(2)} m²</span>
                   </div>
                   <span className="font-semibold text-sm">
                      {formatCurrency(calculationResult?.glassCost || 0)}
                   </span>
                </div>

                {calculationResult?.components?.map((comp: any, idx: number) => (
                   <div key={idx} className="flex justify-between items-center py-2 border-b border-muted/50">
                      <div className="flex flex-col">
                         <span className="text-sm font-medium">{comp.materialName || "Componente Kit"}</span>
                         <span className="text-[10px] text-muted-foreground uppercase">Qtd: {comp.calculatedQuantity.toFixed(2)}</span>
                      </div>
                      <span className="font-semibold text-sm">
                         {formatCurrency(comp.totalCost || 0)}
                      </span>
                   </div>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                 <span className="text-xs font-bold">Custo Base Total:</span>
                 <span className="text-xl font-bold">
                    {formatCurrency(calculationData.valorUnitario / (1 + calculationData.margem / 100))}
                 </span>
              </div>

              <Button onClick={() => setShowCostModal(false)} className="w-full">Fechar Detalhamento</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
