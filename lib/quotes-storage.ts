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
  getAll(): QuoteRecord[] {
    if (!isBrowser()) return []
    return safeParse(window.localStorage.getItem(STORAGE_KEY))
  },
  findByNumber(numero: string): QuoteRecord | undefined {
    return this.getAll().find((quote) => quote.numero === numero)
  },
  upsert(quote: QuoteDraft): QuoteRecord {
    const record: QuoteRecord = {
      ...quote,
      updatedAt: new Date().toISOString(),
    }
    const quotes = this.getAll()
    const index = quotes.findIndex((item) => item.numero === record.numero)
    if (index >= 0) {
      quotes[index] = record
    } else {
      quotes.push(record)
    }
    persist(quotes)
    return record
  },
  remove(numero: string): QuoteRecord[] {
    const quotes = this.getAll().filter((quote) => quote.numero !== numero)
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

