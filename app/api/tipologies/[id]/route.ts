import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tipology = await prisma.tipology.findUnique({
      where: { id: params.id },
      include: {
        Kits: {
          include: {
            components: {
              include: {
                material: true
              }
            }
          }
        }
      }
    });

    if (!tipology) {
      return NextResponse.json({ error: "Tipology not found" }, { status: 404 });
    }

    return NextResponse.json(tipology);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tipology details" }, { status: 500 });
  }
}
