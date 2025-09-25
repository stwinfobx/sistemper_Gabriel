"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Search,
  FileText,
  Trash2,
  ChevronUp,
  ChevronDown,
  User,
  Phone,
  CreditCard,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Client {
  id: string
  nome: string
  telefone: string
  telefone2?: string
  status: "Ativo" | "Inativo"
  documento: string
}

interface SearchFilters {
  nome: string
  documento: string
  status: string
}

export function QuoteSearchForm() {
  const [filters, setFilters] = useState<SearchFilters>({
    nome: "",
    documento: "",
    status: "Todos", // Updated default value to "Todos"
  })

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<"nome" | "id">("nome")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // Mock data for demonstration
  const mockClients: Client[] = [
    {
      id: "001",
      nome: "João Silva Santos",
      telefone: "(11) 99999-9999",
      telefone2: "(11) 88888-8888",
      status: "Ativo",
      documento: "123.456.789-00",
    },
    {
      id: "002",
      nome: "Maria Oliveira",
      telefone: "(11) 77777-7777",
      status: "Ativo",
      documento: "12.345.678/0001-90",
    },
    {
      id: "003",
      nome: "Pedro Costa",
      telefone: "(11) 66666-6666",
      telefone2: "(11) 55555-5555",
      status: "Inativo",
      documento: "987.654.321-00",
    },
    {
      id: "004",
      nome: "Ana Souza",
      telefone: "(11) 44444-4444",
      status: "Ativo",
      documento: "98.765.432/0001-10",
    },
  ]

  // Format document for search
  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return value
  }

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    let formattedValue = value
    if (field === "documento") {
      formattedValue = formatDocument(value)
    }

    setFilters((prev) => ({ ...prev, [field]: formattedValue }))
    setMessage(null)
  }

  const handleSearch = async () => {
    if (!filters.nome.trim() && !filters.documento.trim()) {
      setMessage({ type: "error", text: "Informe nome ou documento para buscar." })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Filter mock data based on search criteria
      const filteredClients = mockClients.filter((client) => {
        const matchesName = !filters.nome || client.nome.toLowerCase().includes(filters.nome.toLowerCase())
        const matchesDocument = !filters.documento || client.documento.includes(filters.documento.replace(/\D/g, ""))
        const matchesStatus = !filters.status || client.status === filters.status

        return matchesName && matchesDocument && matchesStatus
      })

      // Sort results
      filteredClients.sort((a, b) => {
        const aValue = sortField === "nome" ? a.nome : a.id
        const bValue = sortField === "nome" ? b.nome : b.id
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === "asc" ? comparison : -comparison
      })

      setClients(filteredClients)
      setCurrentPage(1)
      setTotalPages(Math.ceil(filteredClients.length / 20))

      if (filteredClients.length === 0) {
        setMessage({ type: "info", text: "Nenhum cliente encontrado." })
      } else {
        setMessage({ type: "success", text: "Clientes carregados com sucesso." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao buscar clientes. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: "nome" | "id") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }

    // Re-sort current results
    const sortedClients = [...clients].sort((a, b) => {
      const aValue = field === "nome" ? a.nome : a.id
      const bValue = field === "nome" ? b.nome : b.id
      const comparison = aValue.localeCompare(bValue)
      return sortDirection === "asc" ? comparison : -comparison
    })

    setClients(sortedClients)
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setMessage(null)
  }

  const handleStartNewQuote = () => {
    if (!selectedClient) {
      setMessage({ type: "error", text: "Selecione um cliente antes de iniciar um orçamento." })
      return
    }

    // Navigate to new quote with pre-filled data
    const queryParams = new URLSearchParams({
      clientId: selectedClient.id,
      nome: selectedClient.nome,
      telefone1: selectedClient.telefone,
      telefone2: selectedClient.telefone2 || "",
      documento: selectedClient.documento,
    })

    window.location.href = `/orcamentos/novo?${queryParams.toString()}`
  }

  const handleClearQuoteSheet = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja limpar a folha de orçamento? Esta ação removerá todos os itens do orçamento em edição.",
    )

    if (!confirmed) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setMessage({ type: "success", text: "Folha de orçamento limpa." })
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao limpar folha de orçamento." })
    } finally {
      setIsLoading(false)
    }
  }

  const SortIcon = ({ field }: { field: "nome" | "id" }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
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
                <Search className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Buscar/Carregar Orçamentos</h1>
              </div>
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
                : message.type === "error"
                  ? "border-destructive/20 bg-destructive/5"
                  : "border-blue-500/20 bg-blue-500/5"
            }`}
          >
            <AlertTriangle
              className={`h-4 w-4 ${
                message.type === "success"
                  ? "text-green-500"
                  : message.type === "error"
                    ? "text-destructive"
                    : "text-blue-500"
              }`}
            />
            <AlertDescription
              className={
                message.type === "success"
                  ? "text-green-700"
                  : message.type === "error"
                    ? "text-destructive"
                    : "text-blue-700"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Filtros de Pesquisa</span>
                </CardTitle>
                <CardDescription>Localize clientes por nome ou documento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Nome do Cliente</span>
                  </Label>
                  <Input
                    id="nome"
                    value={filters.nome}
                    onChange={(e) => handleFilterChange("nome", e.target.value)}
                    placeholder="Digite o nome"
                  />
                </div>

                <div>
                  <Label htmlFor="documento" className="flex items-center space-x-1">
                    <CreditCard className="h-4 w-4" />
                    <span>Nº Documento</span>
                  </Label>
                  <Input
                    id="documento"
                    value={filters.documento}
                    onChange={(e) => handleFilterChange("documento", e.target.value)}
                    placeholder="CPF ou CNPJ"
                    maxLength={18}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status do Cliente</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem> {/* Updated value prop to "Todos" */}
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSearch} disabled={isLoading} className="w-full flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>{isLoading ? "Carregando..." : "Carregar Clientes"}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleStartNewQuote}
                  disabled={!selectedClient}
                  className="w-full flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Iniciar Novo Orçamento</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearQuoteSheet}
                  disabled={isLoading}
                  className="w-full flex items-center space-x-2 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Limpar Folha de Orçamento</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Resultados da Pesquisa</CardTitle>
                <CardDescription>
                  {clients.length > 0 ? `${clients.length} cliente(s) encontrado(s)` : "Nenhum resultado"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("id")}>
                              <div className="flex items-center space-x-1">
                                <span>Cód</span>
                                <SortIcon field="id" />
                              </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("nome")}>
                              <div className="flex items-center space-x-1">
                                <span>Nome</span>
                                <SortIcon field="nome" />
                              </div>
                            </TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Telefone 2</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Nº Documento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client) => (
                            <TableRow
                              key={client.id}
                              className={`cursor-pointer hover:bg-muted/50 ${
                                selectedClient?.id === client.id ? "bg-primary/10 border-primary/20" : ""
                              }`}
                              onClick={() => handleClientSelect(client)}
                            >
                              <TableCell className="font-medium">{client.id}</TableCell>
                              <TableCell>{client.nome}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{client.telefone}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {client.telefone2 && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span>{client.telefone2}</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={client.status === "Ativo" ? "default" : "secondary"}
                                  className={client.status === "Ativo" ? "status-active" : "status-inactive"}
                                >
                                  {client.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{client.documento}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Página {currentPage} de {totalPages}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="bg-transparent"
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="bg-transparent"
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Use os filtros acima para buscar clientes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
