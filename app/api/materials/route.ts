import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const grouped = searchParams.get('grouped') === 'true';

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;

    const materials = await prisma.material.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const adjustments = await prisma.materialAdjustment.findMany();

    if (grouped && materials.length > 0) {
      const groups: Record<string, any> = {};
      materials.forEach((m: any) => {
        const key = m.baseName || m.name;
        if (!groups[key]) {
          groups[key] = {
            baseName: key,
            type: m.type,
            category: m.category,
            thickness: m.thickness,
            color: m.color,
            providers: {}
          };
        }
        if (m.provider) {
          groups[key].providers[m.provider] = {
            id: m.id,
            price: Number(m.price)
          };
        }
      });
      return NextResponse.json({
        grouped: Object.values(groups),
        adjustments: adjustments.map((a: any) => ({ ...a, percentage: Number(a.percentage) }))
      });
    }

    return NextResponse.json({ 
      materials: materials.map((m: any) => ({ ...m, price: Number(m.price) })), 
      adjustments: adjustments.map((a: any) => ({ ...a, percentage: Number(a.percentage) }))
    });
  } catch (error) {
    console.error("Failed to fetch materials error:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, price, provider, type, increment, reset } = await request.json();

    if (id) {
      // Update single material
      const material = await prisma.material.update({
        where: { id },
        data: { price: Number(price) },
      });
      return NextResponse.json(material);
    } else if (type && increment !== undefined) {
      // Bulk update by type and optionally provider
      const where: any = { type };
      if (provider) {
        where.provider = { contains: provider, mode: 'insensitive' };
      }

      await prisma.$transaction([
        (prisma as any).material.updateMany({
          where,
          data: {
            price: {
              multiply: 1 + (Number(increment) / 100)
            }
          }
        }),
        (prisma as any).materialAdjustment.upsert({
          where: { type_provider: { type, provider: provider || "" } },
          update: { 
            percentage: {
              increment: Number(increment)
            }
          },
          create: {
            type,
            provider: provider || "",
            percentage: Number(increment)
          }
        })
      ]);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update material:", error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}
