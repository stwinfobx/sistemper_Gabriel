"use client"

export type QuoteStatus = "Em edição" | "Salvo"

export interface QuoteClientData {
  nome: string
  telefone1: string
  telefone2: string
  endereco: string
  bairro: string
  cidade: string
  documento: string
  email: string
}

export interface QuoteDraft {
  numero: string
  dataAbertura: string
  status: QuoteStatus
  cliente: QuoteClientData
  vendedorId: string
  vendedorNome: string
  vendedorTelefone: string
}

export interface QuoteRecord extends QuoteDraft {
  updatedAt: string
}

const STORAGE_KEY = "sistemper_quotes_v1"

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const safeParse = (value: string | null): QuoteRecord[] => {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as QuoteRecord[]
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (error) {
    console.warn("Erro ao carregar orçamentos do armazenamento local:", error)
  }

  return []
}

const persist = (quotes: QuoteRecord[]) => {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes))
  } catch (error) {
    console.warn("Não foi possível salvar orçamentos no armazenamento local:", error)
  }
}

export const quoteStorage = {
  // Local (Legacy/Draft) methods
  getAllLocal(): QuoteRecord[] {
    if (!isBrowser()) return []
    return safeParse(window.localStorage.getItem(STORAGE_KEY))
  },
  
  // API (New) methods
  async getAll(): Promise<any[]> {
    try {
      const response = await fetch("/api/budgets")
      return await response.json()
    } catch (error) {
      console.error("Error fetching budgets:", error)
      return []
    }
  },

  async findByNumber(numero: string): Promise<any | undefined> {
    try {
      const response = await fetch(`/api/budgets?number=${numero}`)
      return await response.json()
    } catch (error) {
      return undefined
    }
  },

  async upsert(quote: QuoteDraft): Promise<any> {
    try {
      // Convert QuoteDraft to the format expected by our API
      const body = {
        number: quote.numero,
        items: [], // Items are added separately via calculation forms usually
        totalValue: 0,
        client: {
          name: quote.cliente.nome,
          document: quote.cliente.documento,
          email: quote.cliente.email,
          phone: quote.cliente.telefone1,
          address: `${quote.cliente.endereco}, ${quote.cliente.bairro}, ${quote.cliente.cidade}`
        }
      }

      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      return await response.json()
    } catch (error) {
      console.error("Error upserting budget:", error)
      throw error
    }
  },

  remove(numero: string) {
    // For now, keep local removal if needed, but we should add API DELETE
    const quotes = this.getAllLocal().filter((quote) => quote.numero !== numero)
    persist(quotes)
    return quotes
  },
}

export const generateQuoteNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const suffix = String(date.getHours() * 60 + date.getMinutes()).padStart(4, "0")
  return `${year}${month}${day}-${suffix}`
}

export const formatQuoteDate = (date = new Date()) =>
  date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })

export const quoteRecordToDraft = (record: QuoteRecord): QuoteDraft => {
  const { updatedAt: _updatedAt, ...draft } = record
  return draft
}

