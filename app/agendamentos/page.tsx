import { SchedulingBoard } from "@/components/scheduling-board"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function AgendamentosPage() {
  return (
    <div className="container mx-auto space-y-6 px-6 py-8 lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central de Agendamentos</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Painel inspirado nos fluxos da planilha para organizar visitas, medições e instalações com salvamento em
            localStorage.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-4 text-sm text-muted-foreground">
          As informações ficam apenas neste navegador. Para compartilhar com a equipe, exporte ou replique manualmente
          quando necessário.
        </CardContent>
      </Card>

      <SchedulingBoard />
    </div>
  )
}

