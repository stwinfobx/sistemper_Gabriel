import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Boxes, Layers3, Ruler } from "lucide-react"

const tableCards = [
  {
    href: "/tabelas/vidros",
    title: "Tabela de Vidros",
    description: "Três colunas com Tempermax, Divinal e Blindex com reajuste percentual.",
    image: "/placeholder.jpg",
    icon: Layers3,
  },
  {
    href: "/tabelas/perfis",
    title: "Tabela de Perfis",
    description: "Visual de perfis, pesquisa por código e listas rápidas de puxadores e braços.",
    image: "/placeholder.jpg",
    icon: Ruler,
  },
  {
    href: "/tabelas/precos",
    title: "Tabela de Kits & Preços",
    description: "Kits de alumínio, boxes, sacadas e corrimãos com markup previsto.",
    image: "/placeholder.jpg",
    icon: Boxes,
  },
  {
    href: "/tabelas/jatos-peliculas",
    title: "Jatos e Películas",
    description: "Gestão de jatos, películas e complementos com margem editable.",
    image: "/placeholder.jpg",
    icon: Layers3,
  },
]

export default function TabelasPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Início
                </Button>
              </Link>
              <Badge variant="outline">Painel de tabelas</Badge>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Central de tabelas</h1>
              <p className="text-sm text-muted-foreground">
                Acesse rapidamente as tabelas que substituem as planilhas antigas e concentram ajustes percentuais para
                vidros, perfis, kits e acessórios.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="uppercase tracking-wider">Versão piloto</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tableCards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.href} href={card.href}>
                <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="relative h-14 w-20 overflow-hidden rounded-md border">
                      <Image src={card.image} alt={card.title} fill className="object-cover" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-4 w-4 text-primary" />
                        {card.title}
                      </CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm">
                      Abrir tabela
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
