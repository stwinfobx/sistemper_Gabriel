import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "sistemper_secure_key_2025"

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: "Usuário e senha são obrigatórios" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário ou senha incorretos" },
                { status: 401 }
            )
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Usuário ou senha incorretos" },
                { status: 401 }
            )
        }

        // Criar o token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "24h" }
        )

        // Retorna os dados no formato esperado pelo localStorage atual para evitar quebra no frontend
        return NextResponse.json({
            token,
            user: {
                username: user.username,
                role: user.role,
                isBanned: user.isBanned,
                expiresAt: user.expiresAt,
                loginTime: new Date().toISOString(),
            }
        })
    } catch (error) {
        console.error("Erro no login:", error)
        return NextResponse.json(
            { error: "Erro interno no servidor" },
            { status: 500 }
        )
    }
}
