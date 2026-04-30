import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

function generateKey() {
  const segment = () => crypto.randomBytes(2).toString("hex").toUpperCase()
  return `${segment()}-${segment()}-${segment()}-${segment()}`
}

export async function GET() {
  try {
    const keys = await prisma.licenseKey.findMany({
      include: {
        usedBy: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(keys)
  } catch (error) {
    console.error("Erro ao listar keys:", error)
    return NextResponse.json({ error: "Erro ao listar chaves" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { daysValid, quantity = 1 } = await request.json()

    if (!daysValid || daysValid <= 0) {
      return NextResponse.json({ error: "A quantidade de dias deve ser maior que 0" }, { status: 400 })
    }

    const createdKeys = []
    for (let i = 0; i < quantity; i++) {
      const keyStr = generateKey()
      const newKey = await prisma.licenseKey.create({
        data: {
          key: keyStr,
          daysValid: parseInt(daysValid)
        }
      })
      createdKeys.push(newKey)
    }

    return NextResponse.json(createdKeys)
  } catch (error) {
    console.error("Erro ao gerar keys:", error)
    return NextResponse.json({ error: "Erro interno ao gerar chave" }, { status: 500 })
  }
}
