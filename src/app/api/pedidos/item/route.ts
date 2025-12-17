import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, productId, quantidade, observacao } = body;

    const resultado = await prisma.$transaction(async (tx) => {
      const produto = await tx.product.findUnique({
        where: { id: parseInt(productId) }
      });

      if (!produto) throw new Error('Produto não encontrado');

      const item = await tx.orderItem.create({
        data: {
          orderId: parseInt(orderId),
          productId: parseInt(productId),
          quantidade: parseInt(quantidade),
          preco: produto.preco,
          observacao: observacao || ''
        }
      });

      const totalItem = produto.preco * parseInt(quantidade);
      await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { total: { increment: totalItem } }
      });

      if (produto.controlarEstoque) {
        await tx.product.update({
          where: { id: parseInt(productId) },
          data: { estoque: { decrement: parseInt(quantidade) } }
        });
      }
      return item;
    });

    return NextResponse.json(resultado);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}