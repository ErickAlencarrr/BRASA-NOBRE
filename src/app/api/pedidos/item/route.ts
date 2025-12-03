// src/app/api/pedidos/item/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ATENÇÃO: O nome da função DEVE ser POST (em maiúsculo)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, productId, quantidade, observacao } = body;

    // 1. Busca o produto
    const produto = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!produto) return NextResponse.json({ error: 'Produto não existe' }, { status: 400 });

    const item = await prisma.orderItem.create({
      data: {
        orderId: parseInt(orderId),
        productId: parseInt(productId),
        quantidade: parseInt(quantidade),
        preco: produto.preco,
        observacao: observacao || ''
      }
    });

    // 3. Atualiza o Total
    const totalItem = produto.preco * parseInt(quantidade);
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        total: { increment: totalItem }
      }
    });

    return NextResponse.json(item);

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}