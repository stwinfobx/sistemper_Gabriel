"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft, Fence, RotateCcw, Eye, Percent, Plus, DollarSign,
  TrendingUp, RefreshCw, FileText, Loader2, Trash2, LayoutGrid, Settings2, Sparkles, CheckCircle2, UserPlus, ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { TypologySelector } from "./typology-selector"
import { Badge } from "@/components/ui/badge"

interface CalculationData {
  item: string
  largura: number
  altura: number
  quantidade: number
  corPerfil: string
  ambiente: string
  hasSocial: boolean
  hasMataCachorro: boolean
  margem: number
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function GateCalculationForm() {
  const [calculationData, setCalculationData] = useState<CalculationData>({
    item: "", largura: 0, altura: 0, quantidade: 1, corPerfil: "Branco",
    ambiente: "", hasSocial: false, hasMataCachorro: false, margem: 60,
  })

  const [isCalculating, setIsCalculating] = useState(false)
  const [showMarginModal, setShowMarginModal] = useState(false)
  const [showCostModal, setShowCostModal] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [quoteComponents, setQuoteComponents] = useState<any[]>([])

  const handleInputChange = (field: keyof CalculationData, value: string | number | boolean) => {
    setCalculationData(prev => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const generateCalculation = async () => {
    if (!calculationData.item || !calculationData.largura || !calculationData.altura) {
      setMessage({ type: "error", text: "Preencha a largura e altura antes de processar." })
      return
    }

    setIsCalculating(true)
    try {
      const tipologyRes = await fetch(`/api/tipologies/${calculationData.item}`)
      if (!tipologyRes.ok) throw new Error("Falha ao buscar tipologia")
      const tipology = await tipologyRes.json()
      const kitId = tipology.Kits?.[0]?.id

      if (!kitId) {
        setMessage({ type: "error", text: "Kit técnico não configurado para este portão." })
        return
      }

      const calcRes = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitId,
          width: calculationData.largura,
          height: calculationData.altura,
          quantity: calculationData.quantidade,
          flags: { 
            hasSocial: calculationData.hasSocial,
            hasMataCachorro: calculationData.hasMataCachorro 
          }
        })
      })

      const engineResult = await calcRes.json()
      setQuoteComponents(engineResult.components || [])
      setMessage(null)
    } catch (err) {
      setMessage({ type: "error", text: "Falha na comunicação com o motor de cálculo." })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleRemoveComponent = (idx: number) => {
    setQuoteComponents(prev => prev.filter((_, i) => i !== idx))
  }

  const baseCost = quoteComponents.reduce((acc, comp) => acc + (comp.totalCost || 0), 0)
  const marginMultiplier = 1 + (calculationData.margem / 100)
  const unitPrice = baseCost * marginMultiplier
  const totalPrice = unitPrice * calculationData.quantidade

  const handleClear = () => {
    setCalculationData({ item: "", largura: 0, altura: 0, quantidade: 1, corPerfil: "Branco", ambiente: "", hasSocial: false, hasMataCachorro: false, margem: 60 })
    setQuoteComponents([])
    setMessage(null)
  }

  const handleLaunch = async () => {
    if (!calculationData.item || quoteComponents.length === 0) {
      setMessage({ type: "error", text: "Processe o cálculo antes de lançar no orçamento." })
      return
    }

    setIsCalculating(true)
    try {
      let budgetNumber = localStorage.getItem("currentBudgetNumber")
      
      if (!budgetNumber) {
        const startRes = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Em edição", items: [] })
        })
        const newBudget = await startRes.json()
        budgetNumber = newBudget.number
        if (budgetNumber) localStorage.setItem("currentBudgetNumber", budgetNumber)
      }

      const res = await fetch("/api/budgets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: budgetNumber,
          item: {
            tipologyId: calculationData.item,
            name: `${calculationData.item} - ${calculationData.corPerfil}`,
            width: calculationData.largura,
            height: calculationData.altura,
            quantity: calculationData.quantidade,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            details: {
              corPerfil: calculationData.corPerfil,
              ambiente: calculationData.ambiente,
              flags: { 
                social: calculationData.hasSocial, 
                mataCachorro: calculationData.hasMataCachorro 
              },
              components: quoteComponents
            }
          }
        })
      })

      if (res.ok) {
        setMessage({ type: "success", text: `Portão adicionado com sucesso ao orçamento!` })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao persistir item no banco de dados." })
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,20,20,1)_0%,_rgba(0,0,0,1)_100%)] z-0" />
      <div className="fixed inset-0 opacity-20 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

      {/* Header Premium */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0">
        <div className="container mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/">
                <Button variant="ghost" className="hover:bg-white/5 text-white/40 hover:text-white gap-2 px-0 transition-all">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Painel</span>
                </Button>
              </Link>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/20">
                    <Fence className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-lg font-black uppercase tracking-tight leading-none">Módulo de Portões</h1>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1 italic">Industrial Heavy-Duty V2</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <Badge variant="outline" className="h-9 px-4 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-primary/80">
                  Totalizador Live: {formatCurrency(totalPrice)}
               </Badge>
               <Button variant="outline" className="border-white/10 hover:bg-white/5 gap-2 px-6 h-10">
                 <Eye className="h-4 w-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Orçamento</span>
               </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-8 py-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {message && (
          <div className={`mb-10 p-5 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${
            message.type === "success" ? "bg-primary/10 border-primary/20 text-primary" : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}>
             <CheckCircle2 className="h-5 w-5" />
             <span className="text-xs font-black uppercase tracking-wider">{message.text}</span>
          </div>
        )}

        {/* 1. Catálogo Full Width */}
        <section className="mb-12">
            <TypologySelector
              category="Portão"
              onSelect={(t) => {
                handleInputChange("item", t.id)
                setQuoteComponents([])
              }}
            />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Coluna da Esquerda: Inputs (2/3) */}
          <div className="lg:col-span-2 space-y-12">
            
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Configuração Estrutural</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pr-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="space-y-3 relative z-10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Largura do Vão (mm)</Label>
                    <Input 
                        type="number" 
                        value={calculationData.largura || ""} 
                        onChange={(e) => handleInputChange("largura", parseInt(e.target.value) || 0)}
                        className="h-16 bg-white/5 border-white/10 text-xl font-black text-primary focus:ring-primary/20 focus:border-primary/50 transition-all rounded-2xl pl-6"
                        placeholder="0000"
                    />
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Altura do Vão (mm)</Label>
                    <Input 
                        type="number" 
                        value={calculationData.altura || ""} 
                        onChange={(e) => handleInputChange("altura", parseInt(e.target.value) || 0)}
                        className="h-16 bg-white/5 border-white/10 text-xl font-black text-primary focus:ring-primary/20 focus:border-primary/50 transition-all rounded-2xl pl-6"
                        placeholder="0000"
                    />
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Qtd Módulos</Label>
                    <Input 
                        type="number" 
                        value={calculationData.quantidade} 
                        onChange={(e) => handleInputChange("quantidade", parseInt(e.target.value) || 1)}
                        className="h-16 bg-white/5 border-white/10 text-xl font-black text-white focus:ring-primary/20 focus:border-primary/50 transition-all rounded-2xl pl-6"
                    />
                  </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Opcionais & Acabamento</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-2xl">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Coloração Perfil</Label>
                        <Select value={calculationData.corPerfil} onValueChange={(v) => handleInputChange("corPerfil", v)}>
                            <SelectTrigger className="h-16 bg-white/5 border-white/10 text-sm font-bold rounded-2xl px-6 focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                {["Branco", "Preto", "Bronze", "Natural", "Amadeirado"].map(c => (
                                    <SelectItem key={c} value={c} className="focus:bg-primary/20 focus:text-primary transition-colors">{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Referência do Local</Label>
                        <Input 
                            value={calculationData.ambiente} 
                            onChange={(e) => handleInputChange("ambiente", e.target.value)}
                            className="h-16 bg-white/5 border-white/10 text-sm font-bold placeholder:text-white/10 rounded-2xl px-6 focus:ring-primary/20"
                            placeholder="Garagem, Entrada..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                     <div className={`p-8 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${calculationData.hasSocial ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100'}`} onClick={() => handleInputChange("hasSocial", !calculationData.hasSocial)}>
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${calculationData.hasSocial ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">Social Embutido</h4>
                                <p className="text-[9px] text-white/30 uppercase mt-1 font-bold">Fechaduras e Dobradiças Extras</p>
                            </div>
                        </div>
                        <Switch checked={calculationData.hasSocial} onCheckedChange={(v) => handleInputChange("hasSocial", v)} className="data-[state=checked]:bg-primary" />
                     </div>

                     <div className={`p-8 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${calculationData.hasMataCachorro ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100'}`} onClick={() => handleInputChange("hasMataCachorro", !calculationData.hasMataCachorro)}>
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${calculationData.hasMataCachorro ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">Mata-Cachorro</h4>
                                <p className="text-[9px] text-white/30 uppercase mt-1 font-bold">Lambris de Proteção na Base</p>
                            </div>
                        </div>
                        <Switch checked={calculationData.hasMataCachorro} onCheckedChange={(v) => handleInputChange("hasMataCachorro", v)} className="data-[state=checked]:bg-primary" />
                     </div>
                </div>
            </section>
          </div>

          {/* Coluna da Direita: Resumo (1/3) */}
          <div className="lg:col-span-1 space-y-8 sticky top-32">
            
            <Card className="rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border-white/10 shadow-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <DollarSign className="w-20 h-20 text-primary" />
              </div>
              
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Investimento Estimado</CardTitle>
              </CardHeader>
              
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Custo Industrial</span>
                    <span className="text-sm font-black text-white/80">{formatCurrency(baseCost)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Markup Lucro (%)</span>
                    <span className="text-sm font-black text-white/80">{calculationData.margem}%</span>
                  </div>
                  
                  <div className="pt-6">
                     <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2 italic">Preço Unitário</p>
                     <div className="text-4xl font-black text-white tracking-tighter">
                        {formatCurrency(unitPrice)}
                     </div>
                  </div>
                  
                  {calculationData.quantidade > 1 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[9px] font-bold text-white/30 uppercase block mb-1">Total do Lote ({calculationData.quantidade} itens)</span>
                        <span className="text-xl font-black text-white">{formatCurrency(totalPrice)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-6">
                   <Button variant="outline" className="h-12 rounded-xl bg-white/5 border-white/10 text-[9px] font-black uppercase gap-2" onClick={() => setShowMarginModal(true)}>
                     <Percent className="h-4 w-4" /> Margem
                   </Button>
                   <Button variant="outline" className={`h-12 rounded-xl bg-white/5 border-white/10 text-[9px] font-black uppercase gap-2 ${quoteComponents.length > 0 ? 'border-primary/40 text-primary' : ''}`} onClick={() => setShowCostModal(true)} disabled={quoteComponents.length === 0}>
                     <LayoutGrid className="h-4 w-4" /> Componentes
                   </Button>
                </div>
                
                <Separator className="bg-white/5" />

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={generateCalculation} 
                    disabled={isCalculating || !calculationData.item} 
                    className="w-full h-16 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-widest shadow-xl transition-all rounded-2xl group"
                  >
                    {isCalculating ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-700" />
                            <span>{quoteComponents.length > 0 ? "Atualizar Cálculo" : "Calcular Portão"}</span>
                        </div>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleLaunch} 
                    disabled={quoteComponents.length === 0}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 rounded-2xl"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Confirmar e Lançar
                  </Button>

                  <Button onClick={handleClear} variant="ghost" className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/60">
                    <RotateCcw className="h-4 w-4 mr-2" /> Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Personalização */}
        {showCostModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-8 animate-in fade-in duration-300">
            <Card className="w-full max-w-5xl bg-neutral-950 border-white/10 shadow-3xl flex flex-col max-h-[85vh] rounded-[3rem] overflow-hidden">
               <CardHeader className="p-12 pb-8 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">Composição Técnica do Kit</CardTitle>
                        <CardDescription className="text-white/30 text-xs uppercase font-bold tracking-widest mt-1">Detalhamento de perfis e acessórios para montagem industrial</CardDescription>
                    </div>
                    <Button variant="ghost" className="h-14 w-14 rounded-full border border-white/10 hover:bg-white/5" onClick={() => setShowCostModal(false)}>
                        <RotateCcw className="h-6 w-6 text-white/20" />
                    </Button>
                  </div>
               </CardHeader>
               
               <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-white/[0.01]">
                <Table>
                  <TableHeader className="bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-20">
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="py-6 pl-12 uppercase text-[10px] font-black tracking-widest text-white/40">Componente</TableHead>
                      <TableHead className="uppercase text-[10px] font-black tracking-widest text-white/40 text-center">Classe</TableHead>
                      <TableHead className="uppercase text-[10px] font-black tracking-widest text-white/40 text-center">Quantidade</TableHead>
                      <TableHead className="text-right uppercase text-[10px] font-black tracking-widest text-white/40 pr-12">Subtotal</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteComponents.map((comp, idx) => (
                      <TableRow key={idx} className="border-white/5 hover:bg-white/[0.02] group transition-colors">
                        <TableCell className="py-5 pl-12 font-black text-white/90 text-sm">
                            {comp.materialName}
                            <span className="block text-[10px] font-bold text-white/20 uppercase mt-1">Formula Técnica: {comp.formula}</span>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant="outline" className="text-[9px] font-black uppercase text-white/40 border-white/10">{comp.materialCategory}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-white/60 text-center">{comp.calculatedQuantity.toFixed(3)}</TableCell>
                        <TableCell className="text-right pr-12 font-black text-white">{formatCurrency(comp.totalCost)}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleRemoveComponent(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               </CardContent>

               <div className="p-12 border-t border-white/5 bg-black/40 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-8">
                     <Button variant="outline" className="h-12 border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest px-8 rounded-xl gap-2">
                        <Plus className="h-4 w-4 text-primary" /> Item Adicional
                     </Button>
                     <div className="h-10 w-px bg-white/10" />
                     <div>
                        <span className="text-[10px] font-black uppercase text-white/20 block mb-1">Total de Insumos</span>
                        <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(baseCost)}</span>
                     </div>
                  </div>
                  <Button onClick={() => setShowCostModal(false)} size="lg" className="h-16 px-12 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-neutral-200 shadow-2xl">
                    Finalizar Lista
                  </Button>
               </div>
            </Card>
          </div>
        )}

        {/* Modal de Margem */}
        {showMarginModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-[100] animate-in zoom-in-95 duration-300">
            <Card className="w-full max-w-md bg-neutral-900 border-white/10 p-10 rounded-[3rem] shadow-3xl">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Margem Industrial</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase mt-2">Defina o lucro bruto desejado sobre o custo base.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="relative">
                    <Percent className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input 
                        type="number" 
                        value={calculationData.margem} 
                        onChange={(e) => handleInputChange("margem", parseFloat(e.target.value) || 0)}
                        className="h-20 bg-black/40 border-white/10 text-3xl font-black text-center text-primary rounded-[2rem] focus:ring-primary/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                     {[30, 60, 100].map(m => (
                       <Button key={m} variant="outline" className="border-white/5 bg-white/5 text-[10px] font-black px-0 h-12 rounded-xl" onClick={() => handleInputChange("margem", m)}>
                         +{m}%
                       </Button>
                     ))}
                  </div>

                  <Button onClick={() => setShowMarginModal(false)} className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest rounded-2xl text-xs">
                    Confirmar Nível de Margem
                  </Button>
                </div>
            </Card>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.3);
          border-radius: 20px;
        }
      `}</style>
    </div>
  )
}
