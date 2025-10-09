import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfilesTable } from "@/components/tabelas/profiles-table"

export default function PerfisPage() {
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
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Perfis e acessórios</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tabela de perfis</h1>
              <p className="text-sm text-muted-foreground">
                Consulte as imagens, códigos e percentuais de aumento para trilhos, perfis estruturais e acessórios.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-6 py-8">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Dicas rápidas</CardTitle>
            <CardDescription>Use a busca para filtrar por código (ex.: PRF-U08) ou categoria.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Casas de obra com kit exclusivo usam a referência de aumento padrão de cada grupo. Para itens fora desta
            lista use o módulo de Itens Adicionais para registrar valores personalizados.
          </CardContent>
        </Card>

        <ProfilesTable />
      </main>
    </div>
  )
}

