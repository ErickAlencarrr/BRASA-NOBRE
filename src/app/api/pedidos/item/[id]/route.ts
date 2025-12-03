import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Atualizado para Next.js 15
) {
  const { id } = await params;

  try {
    // 1. Busca o item para saber o valor dele antes de apagar
    const item = await prisma.orderItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });

    // 2. Subtrai o valor do total da comanda
    const valorItem = item.preco * item.quantidade;
    await prisma.order.update({
      where: { id: item.orderId },
      data: {
        total: { decrement: valorItem }
      }
    });

    // 3. Apaga o item
    await prisma.orderItem.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao apagar' }, { status: 500 });
  }
}