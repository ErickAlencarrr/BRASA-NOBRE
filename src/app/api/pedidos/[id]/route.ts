import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// DELETE: Cancelar um pedido inteiro (usado para mesas vazias)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verifica se o pedido tem itens antes de deletar (segurança extra)
    const pedido = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });

    if (!pedido) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });

    // Se tiver itens, precisamos devolver ao estoque antes de deletar o pedido pai
    // (Caso você decida permitir cancelar mesa com itens no futuro)
    if (pedido.items.length > 0) {
      // Logica simples: devolve estoque
      for (const item of pedido.items) {
         // Busca produto para saber se controla estoque
         const prod = await prisma.product.findUnique({ where: { id: item.productId }});
         if (prod && prod.controlarEstoque) {
            await prisma.product.update({
               where: { id: item.productId },
               data: { estoque: { increment: item.quantidade }}
            });
         }
      }
      // Apaga os itens
      await prisma.orderItem.deleteMany({
        where: { orderId: parseInt(id) }
      });
    }

    // Apaga o pedido (Mesa fica livre)
    await prisma.order.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cancelar pedido' }, { status: 500 });
  }
}