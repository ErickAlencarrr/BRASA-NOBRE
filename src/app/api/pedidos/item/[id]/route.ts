import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Busca o item para saber a quantidade e o produto
      const item = await tx.orderItem.findUnique({
        where: { id: parseInt(id) }
      });

      if (!item) throw new Error('Item não encontrado');

      // 2. Remove o valor do total da comanda
      const valorItem = item.preco * item.quantidade;
      await tx.order.update({
        where: { id: item.orderId },
        data: { total: { decrement: valorItem } }
      });

      const produtoOriginal = await tx.product.findUnique({
        where: { id: item.productId }
      })
      if (produtoOriginal && produtoOriginal.controlarEstoque) {
        await tx.product.update({
          where: { id: item.productId },
          data: { estoque: { increment: item.quantidade } }
        });
      }

      // 4. Apaga o item do pedido
      await tx.orderItem.delete({
        where: { id: parseInt(id) }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao apagar' }, { status: 500 });
  }
}