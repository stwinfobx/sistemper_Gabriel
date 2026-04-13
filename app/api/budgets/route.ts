import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const number = searchParams.get("number")

    if (number) {
      const budget = await prisma.budget.findUnique({
        where: { number },
        include: {
          client: true,
          items: true
        }
      })
      return NextResponse.json(budget)
    }

    const budgets = await prisma.budget.findMany({
      include: {
        client: true,
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Erro ao buscar orçamentos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { items = [], clientId, client, totalValue, number } = data

    // Use provided number or generate a new one
    let budgetNumber = number
    if (!budgetNumber) {
      const count = await prisma.budget.count()
      budgetNumber = `ORC-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`
    }

    // Prepare client data
    let finalClientId = clientId
    if (!finalClientId && client && client.name) {
      const newClient = await prisma.client.create({
        data: {
          name: client.name,
          document: client.document,
          email: client.email,
          phone: client.phone,
          address: client.address
        }
      })
      finalClientId = newClient.id
    }

    const budget = await prisma.budget.upsert({
      where: { number: budgetNumber },
      update: {
        status: data.status || "Em edição",
        totalValue: totalValue || 0,
        clientId: finalClientId || null,
        items: {
          deleteMany: {}, // Clear existing items for update
          create: items.map((item: any) => ({
            tipologyId: item.tipologyId,
            name: item.name,
            width: item.width,
            height: item.height,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            details: item.details || {}
          }))
        }
      },
      create: {
        number: budgetNumber,
        status: data.status || "Pendente",
        totalValue: totalValue || 0,
        clientId: finalClientId || null,
        items: {
          create: items.map((item: any) => ({
            tipologyId: item.tipologyId,
            name: item.name,
            width: item.width,
            height: item.height,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            details: item.details || {}
          }))
        }
      },
      include: {
        items: true,
        client: true
      }
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error saving budget:", error)
    return NextResponse.json({ error: "Erro ao salvar orçamento" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { number, item } = data

    if (!number || !item) {
      return NextResponse.json({ error: "Número do orçamento e item são obrigatórios" }, { status: 400 })
    }

    const budget = await prisma.budget.findUnique({
      where: { number },
      include: { items: true }
    })

    if (!budget) {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 })
    }

    // Add the new item
    const newItem = await prisma.budgetItem.create({
      data: {
        budgetId: budget.id,
        tipologyId: item.tipologyId || null,
        name: item.name,
        width: Number(item.width),
        height: Number(item.height),
        quantity: Number(item.quantity) || 1,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        details: item.details || {}
      }
    })

    // Update budget total value
    const newTotalValue = Number(budget.totalValue) + Number(item.totalPrice)
    await prisma.budget.update({
      where: { id: budget.id },
      data: { totalValue: newTotalValue }
    })

    return NextResponse.json(newItem)
  } catch (error) {
    console.error("Error appending item to budget:", error)
    return NextResponse.json({ error: "Erro ao adicionar item ao orçamento" }, { status: 500 })
  }
}
