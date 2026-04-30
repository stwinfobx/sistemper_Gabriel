import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { key, username } = await request.json()

    if (!key || !username) {
      return NextResponse.json({ error: "Chave e usuário são obrigatórios." }, { status: 400 })
    }

    const licenseKey = await prisma.licenseKey.findUnique({
      where: { key }
    })

    if (!licenseKey) {
      return NextResponse.json({ error: "Chave inválida." }, { status: 404 })
    }

    if (licenseKey.isUsed) {
      return NextResponse.json({ error: "Esta chave já foi utilizada." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    }

    // Calcular nova data de expiração
    const now = new Date()
    let currentExpiresAt = user.expiresAt ? new Date(user.expiresAt) : now
    
    // Se a conta já estiver vencida, adicionar os dias a partir de HOJE.
    // Se não, somar os dias ao tempo que já restava.
    if (currentExpiresAt < now) {
      currentExpiresAt = now
    }

    currentExpiresAt.setDate(currentExpiresAt.getDate() + licenseKey.daysValid)

    // Atualizar o banco numa transação
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          expiresAt: currentExpiresAt
        }
      }),
      prisma.licenseKey.update({
        where: { id: licenseKey.id },
        data: {
          isUsed: true,
          usedById: user.id,
          usedAt: new Date()
        }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      message: "Chave ativada com sucesso!",
      newExpiresAt: currentExpiresAt 
    })

  } catch (error) {
    console.error("Erro na ativação:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
