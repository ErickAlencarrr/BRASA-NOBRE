import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Busca itens que NÃO estão entregues e que são de cozinha (Categoria Jantinha/Prato ou flag cozinha)
    // Como ainda nao populamos a flag 'cozinha' em todos, vamos usar categorias por enquanto ou assumir tudo que nao eh Bebida?
    // Melhor: vamos pegar tudo que NAO eh 'ENTREGUE' e ordenar por data.
    // O filtro de categoria pode ser feito no front ou aqui.
    // Vamos filtrar categorias especificas: "Jantinha", "Prato", "Porção", "Espetinho" (se for o caso).
    
    const items = await prisma.orderItem.findMany({
      where: {
        status: { not: 'ENTREGUE' },
        product: {
          // Exemplo de categorias de cozinha. Ajuste conforme seu cadastro.
          categoria: { in: ['Jantinha', 'Prato', 'Porção', 'Caldo', 'Espetinho', 'Acompanhamento'] } 
        }
      },
      include: {
        product: true,
        order: {
          select: { numMesa: true, nomeCliente: true, createdAt: true }
        }
      },
      orderBy: { id: 'asc' } // Mais antigos primeiro
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
  }
}
