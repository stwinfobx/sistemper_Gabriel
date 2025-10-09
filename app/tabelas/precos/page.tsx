import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AluminumKitsTable } from "@/components/tabelas/aluminum-kits-table"

export default function PrecosPage() {
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
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Kits de alumínio</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tabela de kits e preços</h1>
              <p className="text-sm text-muted-foreground">
                Mostra boxes, sacadas, portas pivotantes e corrimãos com base de fábrica e markup recomendado.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-6 py-8">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Como usar</CardTitle>
            <CardDescription>Filtre pelo código ou categoria para localizar o kit desejado.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A coluna de preço sugerido aplica automaticamente a porcentagem definida no markup. Caso negocie um valor
            diferente, atualize a base diretamente antes de gerar o orçamento definitivo.
          </CardContent>
        </Card>

        <AluminumKitsTable />
      </main>
    </div>
  )
}

