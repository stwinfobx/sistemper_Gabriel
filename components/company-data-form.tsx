"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building2, Save, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Percent, Package, Disc, Component, Loader2 } from "lucide-react"

interface CompanyData {
  nome: string
  endereco: string
  telefone: string
  email: string
  cnpj: string
  instagram: string
}

export function CompanyDataForm() {
  const [formData, setFormData] = useState<CompanyData>({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
    cnpj: "",
    instagram: "",
  })

  const fetchAdjustments = async () => {
    try {
      const res = await fetch('/api/materials')
      const data = await res.json()
      if (data && data.adjustments) {
        setAdjustments(data.adjustments)
      }
    } catch (err) {
      console.error("Failed to fetch adjustments:", err)
    }
  }

  useState(() => {
    fetchAdjustments()
  })

  const [errors, setErrors] = useState<Partial<CompanyData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [hasChanges, setHasChanges] = useState(false)
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [inputAdjustments, setInputAdjustments] = useState<Record<string, number>>({})
  const [isUpdatingAdjustments, setIsUpdatingAdjustments] = useState<string | null>(null)

  // Format phone number (DD) 9XXXX-XXXX
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    return value
  }

  // Format CNPJ XX.XXX.XXX/XXXX-XX
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return value
  }

  // Validate CNPJ (basic validation)
  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, "")
    return numbers.length === 14
  }

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone
  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    return numbers.length === 11
  }

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    let formattedValue = value

    // Apply formatting
    if (field === "telefone") {
      formattedValue = formatPhone(value)
    } else if (field === "cnpj") {
      formattedValue = formatCNPJ(value)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
    setHasChanges(true)
    setSaveStatus("idle")

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<CompanyData> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome da empresa é obrigatório"
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = "Endereço é obrigatório"
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório"
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = "Telefone inválido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "E-mail inválido"
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório"
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = "CNPJ inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSaveStatus("idle")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Here would be the actual API call
      // const response = await fetch('/api/empresa', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      setSaveStatus("success")
      setHasChanges(false)
    } catch (error) {
      setSaveStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAdjustment = async (type: string, provider?: string) => {
    const key = provider ? `${type}-${provider}` : type
    const increment = inputAdjustments[key] || 0
    if (increment === 0) return

    setIsUpdatingAdjustments(key)
    try {
      const res = await fetch('/api/materials', {
        method: 'PATCH',
        body: JSON.stringify({ type, provider, increment })
      })
      if (res.ok) {
        await fetchAdjustments()
        setInputAdjustments(prev => ({ ...prev, [key]: 0 }))
      }
    } catch (err) {
      console.error("Failed to update adjustment:", err)
    } finally {
      setIsUpdatingAdjustments(null)
    }
  }

  const getAdjustment = (type: string, provider?: string) => {
    const adj = adjustments.find(a => a.type === type && (provider ? a.provider === provider : true))
    return adj ? Number(adj.percentage) : 0
  }

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
                <h1 className="text-xl font-semibold text-foreground">Dados da Empresa</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {hasChanges && <span className="text-sm text-warning">Alterações não salvas</span>}
              <Button onClick={handleSave} disabled={!hasChanges || isLoading} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>{isLoading ? "Salvando..." : "Salvar"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Status Messages */}
        {saveStatus === "success" && (
          <Alert className="mb-6 border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">Dados da empresa salvos com sucesso.</AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="mb-6 border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">Falha ao salvar os dados. Tente novamente.</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informações Institucionais</CardTitle>
            <CardDescription>
              Configure os dados da sua empresa que aparecerão nos orçamentos e documentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome da Empresa */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Ex: Sistemper Sistemas"
                className={errors.nome ? "border-destructive" : ""}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                placeholder="Ex: Rua Nossa Senhora nº 750 – Centro – São Paulo"
                className={`min-h-[80px] ${errors.endereco ? "border-destructive" : ""}`}
              />
              {errors.endereco && <p className="text-sm text-destructive">{errors.endereco}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                placeholder="(12) 99155-7804"
                maxLength={15}
                className={errors.telefone ? "border-destructive" : ""}
              />
              {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="suavidracaria@gmail.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange("cnpj", e.target.value)}
                placeholder="00.000.000/0001-94"
                maxLength={18}
                className={errors.cnpj ? "border-destructive" : ""}
              />
              {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj}</p>}
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (opcional)</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                placeholder="@suavidracaria ou https://instagram.com/suavidracaria"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                * Campos obrigatórios. Estes dados serão utilizados na geração de orçamentos e documentos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Global Adjustments section */}
        <Card className="mt-8 border-primary/20 bg-primary/[0.02] overflow-hidden rounded-3xl">
          <CardHeader className="bg-primary/5 border-b border-primary/10 py-8 px-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-primary/20 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
               </div>
               <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">Reajustes Globais de Tabela</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Aplique aumentos percentuais em massa por categoria</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-12">
            
            {/* Glass Category */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <Disc className="h-5 w-5 text-primary" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Categoria: Vidros (Temperas)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Tempermax", "Divinal", "Blindex"].map(vendor => {
                  const key = `Glass-${vendor}`
                  return (
                    <div key={vendor} className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase text-primary/80 tracking-tighter">{vendor}</span>
                        <Badge className="bg-primary/20 text-primary border-0 font-black text-[10px]">+{getAdjustment("Glass", vendor)}%</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Aumento %" 
                          className="h-10 bg-white/5 border-white/5 font-bold text-center"
                          value={inputAdjustments[key] || ""}
                          onChange={(e) => setInputAdjustments(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        />
                        <Button 
                          size="sm" 
                          className="h-10 font-black uppercase text-[9px] px-4"
                          disabled={isUpdatingAdjustments === key || !inputAdjustments[key]}
                          onClick={() => handleUpdateAdjustment("Glass", vendor)}
                        >
                          {isUpdatingAdjustments === key ? <Loader2 className="h-4 w-4 animate-spin" /> : "OK"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Aluminum Category */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <Package className="h-5 w-5 text-blue-400" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Categoria: Alumínios (Perfis)</h3>
              </div>
              <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-blue-400/60 tracking-[0.2em] mb-2">Reajuste Unificado</p>
                    <p className="text-xs font-bold text-white/40 leading-relaxed uppercase">Aplique um aumento percentual em todos os perfis e componentes de alumínio de uma só vez.</p>
                 </div>
                 <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="text-right pr-4 border-r border-white/10">
                       <p className="text-[9px] font-black uppercase opacity-40">Ajuste Atual</p>
                       <p className="text-xl font-black text-blue-400">+{getAdjustment("Aluminum")}%</p>
                    </div>
                    <div className="flex gap-2 min-w-[150px]">
                      <Input 
                        type="number" 
                        placeholder="0.0%" 
                        className="h-12 bg-white/5 border-blue-500/20 font-black text-center text-blue-400 text-lg"
                        value={inputAdjustments["Aluminum"] || ""}
                        onChange={(e) => setInputAdjustments(prev => ({ ...prev, Aluminum: Number(e.target.value) }))}
                      />
                      <Button 
                        className="h-12 w-12 bg-blue-500 hover:bg-blue-600 text-black p-0"
                        disabled={isUpdatingAdjustments === "Aluminum" || !inputAdjustments["Aluminum"]}
                        onClick={() => handleUpdateAdjustment("Aluminum")}
                      >
                         {isUpdatingAdjustments === "Aluminum" ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                      </Button>
                    </div>
                 </div>
              </div>
            </div>

            {/* Accessories Category */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <Component className="h-5 w-5 text-orange-400" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Categoria: Acessórios e Ferragens</h3>
              </div>
              <div className="p-8 rounded-3xl bg-orange-500/5 border border-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-orange-400/60 tracking-[0.2em] mb-2">Margem de Acessórios</p>
                    <p className="text-xs font-bold text-white/40 leading-relaxed uppercase">Controle o mark-up global aplicado sobre kits e ferragens diversas.</p>
                 </div>
                 <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="text-right pr-4 border-r border-white/10">
                       <p className="text-[9px] font-black uppercase opacity-40">Ajuste Atual</p>
                       <p className="text-xl font-black text-orange-400">+{getAdjustment("Accessory")}%</p>
                    </div>
                    <div className="flex gap-2 min-w-[150px]">
                      <Input 
                        type="number" 
                        placeholder="0.0%" 
                        className="h-12 bg-white/5 border-orange-500/20 font-black text-center text-orange-400 text-lg"
                        value={inputAdjustments["Accessory"] || ""}
                        onChange={(e) => setInputAdjustments(prev => ({ ...prev, Accessory: Number(e.target.value) }))}
                      />
                      <Button 
                        className="h-12 w-12 bg-orange-500 hover:bg-orange-600 text-black p-0"
                        disabled={isUpdatingAdjustments === "Accessory" || !inputAdjustments["Accessory"]}
                        onClick={() => handleUpdateAdjustment("Accessory")}
                      >
                         {isUpdatingAdjustments === "Accessory" ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                      </Button>
                    </div>
                 </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  )
}
