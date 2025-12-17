import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const pedido = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });

    if (!pedido) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });

    if (pedido.items.length > 0) {
      for (const item of pedido.items) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId }});
      if (prod && prod.controlarEstoque) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { estoque: { increment: item.quantidade }}
            });
        }
      }
      await prisma.orderItem.deleteMany({
        where: { orderId: parseInt(id) }
      });
    }

    await prisma.order.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cancelar pedido' }, { status: 500 });
  }
}