import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, productId, quantidade, observacao } = body;

    // Usamos $transaction para garantir que TUDO acontece ou NADA acontece
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Busca produto e verifica estoque
      const produto = await tx.product.findUnique({
        where: { id: parseInt(productId) }
      });

      if (!produto) throw new Error('Produto não encontrado');
      
      // Opcional: Impedir venda se estoque for insuficiente (remova o if se quiser permitir estoque negativo)
      // if (produto.estoque < parseInt(quantidade)) throw new Error('Estoque insuficiente');

      // 2. Cria o item
      const item = await tx.orderItem.create({
        data: {
          orderId: parseInt(orderId),
          productId: parseInt(productId),
          quantidade: parseInt(quantidade),
          preco: produto.preco,
          observacao: observacao || ''
        }
      });

      // 3. Atualiza total do pedido
      const totalItem = produto.preco * parseInt(quantidade);
      await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { total: { increment: totalItem } }
      });

      // 4. BAIXA O ESTOQUE (Decrement)
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