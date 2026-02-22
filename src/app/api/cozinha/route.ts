import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.orderItem.findMany({
      where: {
        status: { not: 'ENTREGUE' },
        product: {
          OR: [
            { cozinha: true }, // Explicit flag
            { controlarEstoque: false }, // Not tracking stock -> Production
            { categoria: { in: ['Jantinha', 'Prato', 'Porção', 'Caldo', 'Espetinho', 'Acompanhamento'] } } // Categories
          ]
        }
      },
      include: {
        product: true,
        order: {
          select: { numMesa: true, nomeCliente: true, createdAt: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
  }
}
