import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Se houver senha, precisa hashear
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...body,
      },
    })

    // Retornamos sem a senha por segurança
    const { password, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Erro ao editar usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await prisma.user.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
  }
}
