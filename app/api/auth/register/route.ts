import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { name, username, password, role } = await request.json()

        if (!name || !username || !password) {
            return NextResponse.json(
                { error: "Nome, usuário e senha são obrigatórios" },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Este usuário já existe" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                password: hashedPassword,
                role: role || "vendedor",
            },
        })

        return NextResponse.json({
            message: "Usuário criado com sucesso",
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
            }
        }, { status: 201 })

    } catch (error) {
        console.error("Erro no registro:", error)
        return NextResponse.json(
            { error: "Erro interno no servidor" },
            { status: 500 }
        )
    }
}
