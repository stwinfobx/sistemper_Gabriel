"use client"

import { useEffect, useMemo, useState } from "react"
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
  Phone,
  CreditCard,
  User,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuoteRecord, quoteStorage } from "@/lib/quotes-storage"

type SortField = "numero" | "cliente" | "atualizado"
type SortDirection = "asc" | "desc"

type SearchFilters = {
  numero: string
  nome: string
  documento: string
  status: "Todos" | "Em edição" | "Salvo"
}

const defaultFilters: SearchFilters = {
  numero: "",
  nome: "",
  documento: "",
  status: "Todos",
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

const digitsOnly = (value: string) => value.replace(/\D/g, "")

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export function QuoteSearchForm() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [quotes, setQuotes] = useState<QuoteRecord[]>([])
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecord | null>(null)
  const [sortField, setSortField] = useState<SortField>("atualizado")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  useEffect(() => {
    setQuotes(quoteStorage.getAll())
  }, [])

  const filteredQuotes = useMemo(() => {
    const currentQuotes = [...quotes]
    const normalizedName = normalize(filters.nome)
    const normalizedDoc = digitsOnly(filters.documento)
    const normalizedNumero = filters.numero.trim().toLowerCase()

    let result = currentQuotes.filter((quote) => {
      const matchesNumero = !normalizedNumero || quote.numero.toLowerCase().includes(normalizedNumero)
      const matchesName =
        !normalizedName || normalize(quote.cliente.nome).includes(normalizedName) || normalize(quote.vendedorNome).includes(normalizedName)
      const matchesDocument =
        !normalizedDoc || digitsOnly(quote.cliente.documento).includes(normalizedDoc) || digitsOnly(quote.numero).includes(normalizedDoc)
      const matchesStatus = filters.status === "Todos" || quote.status === filters.status
      return matchesNumero && matchesName && matchesDocument && matchesStatus
    })

    result = result.sort((a, b) => {
      let compareValue = 0
      switch (sortField) {
        case "numero":
          compareValue = a.numero.localeCompare(b.numero)
          break
        case "cliente":
          compareValue = a.cliente.nome.localeCompare(b.cliente.nome)
          break
        default:
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }
      return sortDirection === "asc" ? compareValue : -compareValue
    })

    return result
  }, [filters, quotes, sortDirection, sortField])

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSearch = () => {
    if (!filters.numero && !filters.nome && !filters.documento && filters.status === "Todos") {
      setMessage({ type: "info", text: "Informe ao menos um filtro para refinar os resultados." })
      return
    }

    if (filteredQuotes.length === 0) {
      setMessage({ type: "error", text: "Nenhum orçamento encontrado com os filtros informados." })
    } else {
      setMessage({ type: "success", text: `${filteredQuotes.length} orçamento(s) encontrado(s).` })
    }
  }

  const handleSelectQuote = (quote: QuoteRecord) => {
    setSelectedQuote(quote)
    setMessage(null)
  }

  const handleOpenQuote = () => {
    if (!selectedQuote) {
      setMessage({ type: "error", text: "Selecione um orçamento para abrir no formulário." })
      return
    }
    window.location.href = `/orcamentos/novo?numero=${selectedQuote.numero}`
  }

  const handleDeleteQuote = (quote: QuoteRecord) => {
    if (!window.confirm(`Deseja excluir o orçamento ${quote.numero}?`)) return
    const updated = quoteStorage.remove(quote.numero)
    setQuotes(updated)
    if (selectedQuote?.numero === quote.numero) {
      setSelectedQuote(null)
    }
    setMessage({ type: "info", text: `Orçamento ${quote.numero} removido do armazenamento local.` })
  }

  const handleRefresh = () => {
    setQuotes(quoteStorage.getAll())
    setMessage({ type: "info", text: "Orçamentos recarregados do armazenamento local." })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Início
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Buscar Orçamentos</h1>
            </div>
          </div>
          <Badge variant="secondary">{quotes.length} salvo(s) no navegador</Badge>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtros de busca</CardTitle>
            <CardDescription>Utilize o número do pedido ou dados do cliente para localizar o orçamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="numero">Nº do orçamento</Label>
                <Input
                  id="numero"
                  placeholder="20250130-0123"
                  value={filters.numero}
                  onChange={(event) => handleFilterChange("numero", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome ou vendedor</Label>
                <Input
                  id="nome"
                  placeholder="Ex.: Maria, Gabriel"
                  value={filters.nome}
                  onChange={(event) => handleFilterChange("nome", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="documento">Documento</Label>
                <Input
                  id="documento"
                  placeholder="CPF ou CNPJ"
                  value={filters.documento}
                  onChange={(event) => handleFilterChange("documento", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Em edição">Em edição</SelectItem>
                    <SelectItem value="Salvo">Salvo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
              <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Recarregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Resultados ({filteredQuotes.length})</CardTitle>
              <CardDescription>Selecione um orçamento para visualizar detalhes rápidos ou abrir no formulário.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenQuote} className="flex items-center gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Abrir no formulário
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead className="cursor-pointer" onClick={() => handleSort("numero")}>
                    Nº do orçamento {sortField === "numero" && (sortDirection === "asc" ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("cliente")}>
                    Cliente {sortField === "cliente" && (sortDirection === "asc" ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                  </TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("atualizado")}>
                    Atualizado {sortField === "atualizado" && (sortDirection === "asc" ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                      Sem orçamentos com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
                {filteredQuotes.map((quote) => (
                  <TableRow
                    key={quote.numero}
                    data-state={selectedQuote?.numero === quote.numero ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => handleSelectQuote(quote)}
                  >
                    <TableCell className="font-semibold">{quote.numero}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{quote.cliente.nome || "Sem nome"}</span>
                        <span className="text-xs text-muted-foreground">Vendedor: {quote.vendedorNome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {quote.cliente.telefone1 || "-"}
                        </span>
                        {quote.cliente.documento && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> {quote.cliente.documento}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={quote.status === "Salvo" ? "default" : "secondary"}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(quote.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="bg-transparent" onClick={(event) => {
                          event.stopPropagation()
                          handleSelectQuote(quote)
                          handleOpenQuote()
                        }}>
                          Abrir
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteQuote(quote)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedQuote && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Resumo do orçamento {selectedQuote.numero}
              </CardTitle>
              <CardDescription>Dados do cliente e vendedor selecionados.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase text-muted-foreground">Cliente</p>
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="font-semibold">{selectedQuote.cliente.nome || "Sem nome informado"}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuote.cliente.documento || "Documento não informado"}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuote.cliente.telefone1 || "-"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase text-muted-foreground">Vendedor</p>
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="font-semibold">{selectedQuote.vendedorNome}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuote.vendedorTelefone}</p>
                  <p className="text-sm text-muted-foreground">Status: {selectedQuote.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
