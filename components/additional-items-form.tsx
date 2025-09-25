"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Minus, Save, X, Palette, Shield, Wrench } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdditionalItem {
  id: string
  descricao: string
  categoria: "Jato" | "Película" | "Complementar"
  valorUnitario: number
  quantidade: number
  subtotal: number
}

interface ManualItem {
  descricao: string
  valor: number
}

export function AdditionalItemsForm() {
  const [selectedItems, setSelectedItems] = useState<AdditionalItem[]>([])
  const [manualItem, setManualItem] = useState<ManualItem>({ descricao: "", valor: 0 })
  const [showManualInput, setShowManualInput] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "info"; text: string } | null>(null)

  // Pre-registered items from documentation
  const availableItems: Omit<AdditionalItem, "quantidade" | "subtotal">[] = [
    // Jatos & Pinturas
    { id: "1", descricao: "Sem Jato", categoria: "Jato", valorUnitario: 0 },
    { id: "2", descricao: "Jato Total", categoria: "Jato", valorUnitario: 45 },
    { id: "3", descricao: "Jato Artístico", categoria: "Jato", valorUnitario: 80 },
    { id: "4", descricao: "Jato Listras", categoria: "Jato", valorUnitario: 55 },
    { id: "5", descricao: "Pintura Premium", categoria: "Jato", valorUnitario: 210 },
    { id: "6", descricao: "Pintura Nova", categoria: "Jato", valorUnitario: 450 },

    // Películas
    { id: "7", descricao: "Película 25%", categoria: "Película", valorUnitario: 90 },
    { id: "8", descricao: "Película 35%", categoria: "Película", valorUnitario: 120 },
    { id: "9", descricao: "Película 50%", categoria: "Película", valorUnitario: 160 },
    { id: "10", descricao: "Película 65%", categoria: "Película", valorUnitario: 210 },

    // Complementares
    { id: "11", descricao: "Haste de Max-Ar", categoria: "Complementar", valorUnitario: 35 },
    { id: "12", descricao: "Kit Box Frontal", categoria: "Complementar", valorUnitario: 180 },
    { id: "13", descricao: "Kit Box Canto", categoria: "Complementar", valorUnitario: 220 },
    { id: "14", descricao: "Espelho Bizotê", categoria: "Complementar", valorUnitario: 150 },
    { id: "15", descricao: "Slide Door", categoria: "Complementar", valorUnitario: 320 },
    { id: "16", descricao: "Smart Glass", categoria: "Complementar", valorUnitario: 800 },
    { id: "17", descricao: "Versatik", categoria: "Complementar", valorUnitario: 95 },
    { id: "18", descricao: "Kit Pia Básico", categoria: "Complementar", valorUnitario: 120 },
    { id: "19", descricao: "Kit Pia Premium", categoria: "Complementar", valorUnitario: 280 },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleItemSelect = (item: Omit<AdditionalItem, "quantidade" | "subtotal">) => {
    const existingItem = selectedItems.find((selected) => selected.id === item.id)

    if (existingItem) {
      // Increase quantity
      setSelectedItems((prev) =>
        prev.map((selected) =>
          selected.id === item.id
            ? {
                ...selected,
                quantidade: selected.quantidade + 1,
                subtotal: (selected.quantidade + 1) * selected.valorUnitario,
              }
            : selected,
        ),
      )
    } else {
      // Add new item
      const newItem: AdditionalItem = {
        ...item,
        quantidade: 1,
        subtotal: item.valorUnitario,
      }
      setSelectedItems((prev) => [...prev, newItem])
    }
    setMessage(null)
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
    } else {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantidade: newQuantity,
                subtotal: newQuantity * item.valorUnitario,
              }
            : item,
        ),
      )
    }
  }

  const handleAddManualItem = () => {
    if (!manualItem.descricao.trim() || manualItem.valor <= 0) {
      return
    }

    const newItem: AdditionalItem = {
      id: `manual-${Date.now()}`,
      descricao: manualItem.descricao,
      categoria: "Complementar",
      valorUnitario: manualItem.valor,
      quantidade: 1,
      subtotal: manualItem.valor,
    }

    setSelectedItems((prev) => [...prev, newItem])
    setManualItem({ descricao: "", valor: 0 })
    setShowManualInput(false)
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const totalAdicionais = selectedItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSave = () => {
    if (selectedItems.length === 0) {
      setMessage({ type: "info", text: "Nenhum adicional selecionado." })
      return
    }

    // Simulate saving and returning to previous screen
    setMessage({ type: "success", text: "Adicionais aplicados." })

    // In a real app, this would navigate back and pass the selected items
    setTimeout(() => {
      window.history.back()
    }, 1500)
  }

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "Jato":
        return <Palette className="h-4 w-4" />
      case "Película":
        return <Shield className="h-4 w-4" />
      case "Complementar":
        return <Wrench className="h-4 w-4" />
      default:
        return <Plus className="h-4 w-4" />
    }
  }

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "Jato":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "Película":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "Complementar":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const groupedItems = availableItems.reduce(
    (acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = []
      }
      acc[item.categoria].push(item)
      return acc
    },
    {} as Record<string, typeof availableItems>,
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-3">
                <Plus className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Itens Adicionais</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Total: {formatCurrency(totalAdicionais)}</span>
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
              message.type === "success" ? "border-green-500/20 bg-green-500/5" : "border-blue-500/20 bg-blue-500/5"
            }`}
          >
            <AlertDescription className={message.type === "success" ? "text-green-700" : "text-blue-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([categoria, items]) => (
              <Card key={categoria}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(categoria)}
                    <span>
                      {categoria === "Jato"
                        ? "Jatos & Pinturas"
                        : categoria === "Película"
                          ? "Películas"
                          : "Complementares"}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {categoria === "Jato" && "Tratamentos e acabamentos para vidros"}
                    {categoria === "Película" && "Películas de proteção solar"}
                    {categoria === "Complementar" && "Acessórios e componentes extras"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item) => {
                      const selectedItem = selectedItems.find((selected) => selected.id === item.id)
                      return (
                        <div
                          key={item.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedItem ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleItemSelect(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.descricao}</h4>
                              <p className="text-primary font-semibold">{formatCurrency(item.valorUnitario)}</p>
                            </div>
                            {selectedItem && (
                              <div className="flex items-center space-x-2 ml-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuantityChange(item.id, selectedItem.quantidade - 1)
                                  }}
                                  className="h-6 w-6 p-0 bg-transparent"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center">{selectedItem.quantidade}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuantityChange(item.id, selectedItem.quantidade + 1)
                                  }}
                                  className="h-6 w-6 p-0 bg-transparent"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Manual Item Input */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Valor Manual</CardTitle>
                <CardDescription>Para itens não cadastrados ou valores especiais</CardDescription>
              </CardHeader>
              <CardContent>
                {!showManualInput ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowManualInput(true)}
                    className="w-full flex items-center space-x-2 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Item Manual</span>
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        value={manualItem.descricao}
                        onChange={(e) => setManualItem((prev) => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Ex: Serviço especial"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor">Valor (R$)</Label>
                      <Input
                        id="valor"
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualItem.valor || ""}
                        onChange={(e) =>
                          setManualItem((prev) => ({ ...prev, valor: Number.parseFloat(e.target.value) || 0 }))
                        }
                        placeholder="0,00"
                        className="currency-input"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddManualItem} className="flex-1">
                        Adicionar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowManualInput(false)
                          setManualItem({ descricao: "", valor: 0 })
                        }}
                        className="flex-1 bg-transparent"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Items Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Itens Selecionados</CardTitle>
                <CardDescription>Adicionais que serão aplicados ao item atual</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum adicional selecionado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getCategoryColor(item.categoria).split(" ")[0]}`} />
                            <h4 className="font-medium text-sm">{item.descricao}</h4>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {item.quantidade}x {formatCurrency(item.valorUnitario)}
                            </span>
                            <span className="text-sm font-semibold text-primary">{formatCurrency(item.subtotal)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total Adicionais:</span>
                      <span className="text-primary">{formatCurrency(totalAdicionais)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleSave} className="w-full flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Salvar Adicionais</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full flex items-center space-x-2 bg-transparent"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
