import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const kits = await prisma.kit.findMany({
      include: {
        tipology: true,
        components: {
          include: {
            material: true
          }
        }
      },
      orderBy: { name: "asc" }
    })
    return NextResponse.json(kits)
  } catch (error) {
    console.error("Error fetching kits:", error)
    return NextResponse.json(
      { error: "Failed to fetch kits" },
      { status: 500 }
    )
  }
}
