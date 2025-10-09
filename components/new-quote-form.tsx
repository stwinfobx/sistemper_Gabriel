"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  FileText,
  Save,
  Calculator,
  Building2,
  User,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import {
  QuoteClientData,
  QuoteDraft,
  generateQuoteNumber,
  quoteRecordToDraft,
  quoteStorage,
  formatQuoteDate,
} from "@/lib/quotes-storage"

const createInitialQuote = (): QuoteDraft => ({
  numero: generateQuoteNumber(),
  dataAbertura: formatQuoteDate(),
  status: "Em edição",
  cliente: {
    nome: "",
    telefone1: "",
    telefone2: "",
    endereco: "",
    bairro: "",
    cidade: "",
    documento: "",
    email: "",
  },
  vendedorId: "1",
  vendedorNome: "Gabriel Batista",
  vendedorTelefone: "(11) 99999-9999",
})

export function NewQuoteForm() {
  const [quoteData, setQuoteData] = useState<QuoteDraft>(createInitialQuote)

  const [errors, setErrors] = useState<Partial<QuoteClientData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showNewSellerModal, setShowNewSellerModal] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null)

  // Available sellers (mock data)
  const sellers = [
    { id: "1", nome: "Gabriel Batista", telefone: "(11) 99999-9999" },
    { id: "2", nome: "Maria Silva", telefone: "(11) 88888-8888" },
    { id: "3", nome: "João Santos", telefone: "(11) 77777-7777" },
]

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const numeroFromQuery = params.get("numero")

    if (numeroFromQuery) {
      const stored = quoteStorage.findByNumber(numeroFromQuery)
      if (stored) {
        setQuoteData(quoteRecordToDraft(stored))
        setFeedback({ type: "info", text: `Orçamento ${numeroFromQuery} carregado do histórico.` })
        return
      }
    }

    setQuoteData((prev) => ({
      ...prev,
      cliente: {
        ...prev.cliente,
        nome: params.get("nome") || prev.cliente.nome,
        telefone1: params.get("telefone1") || prev.cliente.telefone1,
        telefone2: params.get("telefone2") || prev.cliente.telefone2,
        documento: params.get("documento") || prev.cliente.documento,
      },
    }))
  }, [])

  // Format phone number
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    return value
  }

  // Format CPF/CNPJ
  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      // CPF format
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else if (numbers.length <= 14) {
      // CNPJ format
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return value
  }

  // Validate document (CPF or CNPJ)
  const validateDocument = (doc: string) => {
    const numbers = doc.replace(/\D/g, "")
    return numbers.length === 11 || numbers.length === 14
  }

  // Validate phone
  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    return numbers.length === 11
  }

  // Validate email
  const validateEmail = (email: string) => {
    if (!email) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleClientChange = (field: keyof QuoteClientData, value: string) => {
    let formattedValue = value

    // Apply formatting
    if (field === "telefone1" || field === "telefone2") {
      formattedValue = formatPhone(value)
    } else if (field === "documento") {
      formattedValue = formatDocument(value)
    }

    setQuoteData((prev) => ({
      ...prev,
      cliente: { ...prev.cliente, [field]: formattedValue },
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (feedback) {
      setFeedback(null)
    }
  }

  const handleSellerChange = (sellerId: string) => {
    if (feedback) {
      setFeedback(null)
    }
    const seller = sellers.find((s) => s.id === sellerId)
    if (seller) {
      setQuoteData((prev) => ({
        ...prev,
        vendedorId: sellerId,
        vendedorNome: seller.nome,
        vendedorTelefone: seller.telefone,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<QuoteClientData> = {}

    if (!quoteData.cliente.nome.trim()) {
      newErrors.nome = "Nome do cliente é obrigatório"
    }

    if (!quoteData.cliente.telefone1.trim()) {
      newErrors.telefone1 = "Telefone principal é obrigatório"
    } else if (!validatePhone(quoteData.cliente.telefone1)) {
      newErrors.telefone1 = "Telefone inválido"
    }

    if (quoteData.cliente.telefone2 && !validatePhone(quoteData.cliente.telefone2)) {
      newErrors.telefone2 = "Telefone inválido"
    }

    if (quoteData.cliente.documento && !validateDocument(quoteData.cliente.documento)) {
      newErrors.documento = "CPF/CNPJ inválido"
    }

    if (quoteData.cliente.email && !validateEmail(quoteData.cliente.email)) {
      newErrors.email = "E-mail inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setFeedback(null)

    try {
      const draftToPersist: QuoteDraft = {
        ...quoteData,
        status: "Salvo",
      }
      quoteStorage.upsert(draftToPersist)
      setQuoteData(draftToPersist)
      setFeedback({ type: "success", text: `Orçamento ${draftToPersist.numero} salvo no navegador.` })
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error)
      setFeedback({ type: "error", text: "Não foi possível salvar este orçamento no navegador." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    const hasChanges = quoteData.cliente.nome || quoteData.cliente.telefone1
    if (hasChanges) {
      const confirmed = window.confirm("Existem alterações não salvas. Deseja descartar?")
      if (!confirmed) return
    }
    // Navigate back
    window.history.back()
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
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Cadastrar Novo Orçamento</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant={quoteData.status === "Salvo" ? "default" : "secondary"}>{quoteData.status}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {feedback && (
          <Alert variant={feedback.type === "error" ? "destructive" : "default"} className="mb-6">
            <AlertDescription>{feedback.text}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quote Header */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Cabeçalho do Orçamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Nº Orçamento</Label>
                  <Input value={quoteData.numero} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Data/Hora de Abertura</Label>
                  <Input value={quoteData.dataAbertura} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input value={quoteData.status} disabled className="bg-muted" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Data */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Dados do Cliente</span>
                </CardTitle>
                <CardDescription>Informações básicas do cliente para o orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <div>
                  <Label htmlFor="nome">Nome do Cliente *</Label>
                  <Input
                    id="nome"
                    value={quoteData.cliente.nome}
                    onChange={(e) => handleClientChange("nome", e.target.value)}
                    placeholder="Nome completo do cliente"
                    className={errors.nome ? "border-destructive" : ""}
                  />
                  {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
                </div>

                {/* Telefones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone1" className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>Telefone (1) *</span>
                    </Label>
                    <Input
                      id="telefone1"
                      value={quoteData.cliente.telefone1}
                      onChange={(e) => handleClientChange("telefone1", e.target.value)}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className={errors.telefone1 ? "border-destructive" : ""}
                    />
                    {errors.telefone1 && <p className="text-sm text-destructive mt-1">{errors.telefone1}</p>}
                  </div>
                  <div>
                    <Label htmlFor="telefone2" className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>Telefone (2)</span>
                    </Label>
                    <Input
                      id="telefone2"
                      value={quoteData.cliente.telefone2}
                      onChange={(e) => handleClientChange("telefone2", e.target.value)}
                      placeholder="(11) 88888-8888"
                      maxLength={15}
                      className={errors.telefone2 ? "border-destructive" : ""}
                    />
                    {errors.telefone2 && <p className="text-sm text-destructive mt-1">{errors.telefone2}</p>}
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Endereço</span>
                  </h4>
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={quoteData.cliente.endereco}
                      onChange={(e) => handleClientChange("endereco", e.target.value)}
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={quoteData.cliente.bairro}
                        onChange={(e) => handleClientChange("bairro", e.target.value)}
                        placeholder="Bairro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={quoteData.cliente.cidade}
                        onChange={(e) => handleClientChange("cidade", e.target.value)}
                        placeholder="Cidade"
                      />
                    </div>
                  </div>
                </div>

                {/* Identificação */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Identificação</span>
                  </h4>
                  <div>
                    <Label htmlFor="documento">CPF/CNPJ</Label>
                    <Input
                      id="documento"
                      value={quoteData.cliente.documento}
                      onChange={(e) => handleClientChange("documento", e.target.value)}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      maxLength={18}
                      className={errors.documento ? "border-destructive" : ""}
                    />
                    {errors.documento && <p className="text-sm text-destructive mt-1">{errors.documento}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>E-mail</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={quoteData.cliente.email}
                      onChange={(e) => handleClientChange("email", e.target.value)}
                      placeholder="cliente@email.com"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller Data */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Vendedor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vendedor">Vendedor</Label>
                  <Select value={quoteData.vendedorId} onValueChange={handleSellerChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Telefone do Vendedor</Label>
                  <Input value={quoteData.vendedorTelefone} disabled className="bg-muted" />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewSellerModal(true)}
                  className="w-full flex items-center space-x-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Novo Vendedor</span>
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleSave} disabled={isLoading} className="w-full flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? "Salvando..." : "Salvar Orçamento"}</span>
                </Button>

                <Link href="/calculo/vidros" className="block">
                  <Button variant="outline" className="w-full flex items-center space-x-2 bg-transparent">
                    <Calculator className="h-4 w-4" />
                    <span>Ir para Cálculo (Vidros)</span>
                  </Button>
                </Link>

                <Link href="/calculo/esquadrias" className="block">
                  <Button variant="outline" className="w-full flex items-center space-x-2 bg-transparent">
                    <Building2 className="h-4 w-4" />
                    <span>Ir para Cálculo (Esquadrias)</span>
                  </Button>
                </Link>

                <Button variant="ghost" onClick={handleCancel} className="w-full bg-transparent">
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
