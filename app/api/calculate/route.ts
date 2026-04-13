import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateKit } from '@/lib/engine/calculator';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kitId, width, height, quantity, optimizeCut, flags } = body;

    if (!kitId || !width || !height) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch the kit with all its components and material prices
    const kit = await prisma.kit.findUnique({
      where: { id: kitId },
      include: {
        components: {
          include: {
            material: true
          }
        }
      }
    });

    if (!kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    // 2. Perform the calculation using the engine
    // Need to cast to any because of Decimal vs number differences between Prisma and our types
    const result = calculateKit(kit as any, {
      width: Number(width),
      height: Number(height),
      quantity: Number(quantity) || 1,
      optimizeCut: !!optimizeCut,
      flags
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Calculation API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
