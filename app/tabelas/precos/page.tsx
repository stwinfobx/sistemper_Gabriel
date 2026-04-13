import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AluminumKitsTable } from "@/components/tabelas/aluminum-kits-table"
import { KitsCompositionTable } from "@/components/tabelas/kits-composition-table"

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
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Kits e Acessórios</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tabela de Kits e Acessórios</h1>
              <p className="text-sm text-muted-foreground">
                Consulte a composição completa dos kits (Portões, Boxes, Sacadas) ou veja o preço unitário de cada ferragem.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-6 py-8">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Como usar</CardTitle>
            <CardDescription>Navegue entre as abas para consultar composições fechadas ou componentes individuais.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A aba "Composição de Kits" mostra quais itens formam o pacote (ex: Box Frontal). A aba "Acessórios Avulsos" permite consultar e editar preços unitários de ferragens e acessórios avulsos.
          </CardContent>
        </Card>

        <Tabs defaultValue="kits" className="space-y-6">
          <TabsList className="bg-muted w-full md:w-auto grid grid-cols-2 md:inline-grid">
            <TabsTrigger value="kits">Composição de Kits (Portões/Boxes)</TabsTrigger>
            <TabsTrigger value="acessorios">Acessórios Avulsos (Ferragens)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kits" className="mt-0">
            <KitsCompositionTable />
          </TabsContent>
          
          <TabsContent value="acessorios" className="mt-0">
            <AluminumKitsTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}


