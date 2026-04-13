import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  try {
    const tipologies = await prisma.tipology.findMany({
      where: category ? { category: { equals: category, mode: 'insensitive' } } : {},
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tipologies);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tipologies" }, { status: 500 });
  }
}
