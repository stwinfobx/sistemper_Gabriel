import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GlassTables } from "@/components/tabelas/glass-table"

export default function VidrosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Link href="/tabelas">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Tabelas
                </Button>
              </Link>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Vidros temperados</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tabela de vidros</h1>
              <p className="text-sm text-muted-foreground">
                Configure os percentuais de aumento por fornecedor e acompanhe a regra de referência (2 para até 8mm e 3
                para 10mm).
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Checklist rápido</CardTitle>
            <CardDescription>Resumo operacional para os ajustes mais frequentes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tempermax</p>
              <p className="text-lg font-bold">Ajuste padrão 8%</p>
              <p className="text-xs text-muted-foreground">Utilizado na maior parte dos orçamentos.</p>
            </div>
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Divinal</p>
              <p className="text-lg font-bold">Ajuste recomendado 6%</p>
              <p className="text-xs text-muted-foreground">Linha indicada para boxes especiais.</p>
            </div>
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Blindex</p>
              <p className="text-lg font-bold">Ajuste premium 5%</p>
              <p className="text-xs text-muted-foreground">Aplicar em obras com acabamento superior.</p>
            </div>
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Regra</p>
              <p className="text-lg font-bold">2 &amp; 3</p>
              <p className="text-xs text-muted-foreground">Número 2 para até 8mm, número 3 para 10mm para cima.</p>
            </div>
          </CardContent>
        </Card>

        <GlassTables />
      </main>
    </div>
  )
}

