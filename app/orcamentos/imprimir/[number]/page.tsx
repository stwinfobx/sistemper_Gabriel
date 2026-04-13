"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Printer, Download, Mail, ArrowLeft, FileText, Calendar, User, Phone, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function PrintQuotePage() {
  const params = useParams()
  const [budget, setBudget] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBudget() {
      try {
        const response = await fetch(`/api/budgets?number=${params.number}`)
        const data = await response.json()
        setBudget(data)
      } catch (error) {
        console.error("Error fetching budget:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBudget()
  }, [params.number])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Orçamento não encontrado</h1>
        <p className="text-muted-foreground mb-6">O orçamento {params.number} não existe ou foi removido.</p>
        <Link href="/orcamentos/buscar">
          <Button>Voltar para busca</Button>
        </Link>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12 print:bg-white print:pb-0">
      {/* Action Bar - Hidden on Print */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border py-4 px-6 mb-8 print:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/orcamentos/buscar">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
               <Badge className="bg-primary/10 text-primary border-primary/20">{budget.number}</Badge>
               <span className="text-sm font-medium text-muted-foreground">Visualização de Impressão</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} className="gap-2 shadow-lg shadow-primary/20">
              <Printer className="h-4 w-4" />
              Imprimir / PDF
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Mail className="h-4 w-4" />
              Enviar por E-mail
            </Button>
          </div>
        </div>
      </div>

      {/* Quote Document */}
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Document Header */}
          <div className="bg-slate-900 text-white p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                   <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Sistemper <span className="text-primary text-5xl">.</span></h1>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Vidros Temperados e Esquadrias de Alumínio</p>
                </div>
                <div className="text-right">
                   <div className="inline-block px-4 py-2 border-2 border-primary rounded-xl mb-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Orçamento</p>
                      <p className="text-2xl font-black">{budget.number}</p>
                   </div>
                   <div className="flex items-center justify-end gap-2 text-slate-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(budget.createdAt)}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-12 space-y-12">
             {/* Client & Company Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Destinatário</h3>
                   <div className="space-y-2">
                      <p className="text-xl font-black text-slate-900">{budget.client?.name || "Cliente Final"}</p>
                      {budget.client?.document && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                           <CreditCard className="h-4 w-4" />
                           <span>CPF/CNPJ: {budget.client.document}</span>
                        </div>
                      )}
                      {budget.client?.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                           <Phone className="h-4 w-4" />
                           <span>{budget.client.phone}</span>
                        </div>
                      )}
                      {budget.client?.address && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                           <MapPin className="h-4 w-4" />
                           <span>{budget.client.address}</span>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Emitente</h3>
                   <div className="space-y-2 text-sm text-slate-500">
                      <p className="font-black text-slate-900 uppercase">SISTEMPER IND. E COM. DE VIDROS</p>
                      <p>Rua Exemplo, 123 - Distrito Industrial</p>
                      <p>São Paulo, SP - CEP 01234-567</p>
                      <p>CNPJ: 00.000.000/0001-00</p>
                      <p className="flex items-center gap-2 font-bold text-primary">
                        <Phone className="h-4 w-4" /> (11) 4002-8922
                      </p>
                   </div>
                </div>
             </div>

             {/* Items Table */}
             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Itens Solicitados</h3>
                <div className="overflow-hidden border border-slate-100 rounded-2xl">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="px-6 py-4">Item #</th>
                            <th className="px-6 py-4">Descrição do Produto</th>
                            <th className="px-6 py-4 text-center">Dimensões</th>
                            <th className="px-6 py-4 text-center">Qtd</th>
                            <th className="px-6 py-4 text-right">Unitário</th>
                            <th className="px-6 py-4 text-right">Total</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {budget.items?.map((item: any, idx: number) => (
                           <tr key={item.id} className="text-sm">
                              <td className="px-6 py-4 text-slate-400 font-mono">{(idx + 1).toString().padStart(2, '0')}</td>
                              <td className="px-6 py-4">
                                 <p className="font-black text-slate-900">{item.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase">
                                    {item.details?.corVidro} • {item.details?.temperado} • {item.details?.ambiente || "Ambiente Geral"}
                                 </p>
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-600">
                                 {item.width} x {item.height} mm
                              </td>
                              <td className="px-6 py-4 text-center font-black">
                                 {item.quantity}
                              </td>
                              <td className="px-6 py-4 text-right text-slate-500">
                                 {formatCurrency(Number(item.unitPrice))}
                              </td>
                              <td className="px-6 py-4 text-right font-black text-slate-900">
                                 {formatCurrency(Number(item.totalPrice))}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* Totals & Footer */}
             <div className="flex flex-col md:flex-row justify-between items-end gap-12 pt-8">
                <div className="max-w-md text-xs text-slate-400 leading-relaxed italic border-l-4 border-primary/20 pl-6">
                   <p className="font-bold uppercase text-slate-500 mb-2 underline tracking-widest">Observações:</p>
                   <p>1. Este orçamento tem validade de 5 dias úteis a partir da data de emissão.</p>
                   <p>2. O prazo de entrega é de 10 a 15 dias após a confirmação das medidas no local.</p>
                   <p>3. Condições de pagamento: 50% entrada e saldo na conclusão da instalação.</p>
                </div>

                <div className="w-full md:w-80 space-y-3">
                   <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
                      <span>Subtotal</span>
                      <span>{formatCurrency(Number(budget.totalValue))}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-4">
                      <span>Descontos</span>
                      <span className="text-green-600">R$ 0,00</span>
                   </div>
                   <div className="flex justify-between items-center p-6 bg-primary rounded-2xl text-white shadow-2xl shadow-primary/30">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Geral</span>
                      <span className="text-2xl font-black">{formatCurrency(Number(budget.totalValue))}</span>
                   </div>
                </div>
             </div>

             <div className="pt-24 flex flex-col items-center">
                <div className="w-64 h-px bg-slate-200 mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assinatura de Aceite do Cliente</p>
             </div>
          </div>
          
          <div className="bg-slate-50 p-8 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Gerado automaticamente pelo Sistema Sistemper 2025</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  )
}
