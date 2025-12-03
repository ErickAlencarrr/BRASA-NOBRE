import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Busca todos os pedidos FECHADOS
    const pedidosFechados = await prisma.order.findMany({
      where: { status: 'FECHADO' },
      include: { items: { include: { product: true } } },
      orderBy: { updatedAt: 'desc' } // Os mais recentes primeiro
    });

    // 2. Busca produtos com estoque baixo (menos de 5 unidades)
    const estoqueBaixo = await prisma.product.findMany({
      where: { estoque: { lte: 5 } }
    });

    // 3. CÁLCULOS MATEMÁTICOS (Processamento de Dados)
    
    // Total em dinheiro vendido
    const totalFaturamento = pedidosFechados.reduce((acc, pedido) => acc + pedido.total, 0);

    // Produto mais vendido (Lógica simples)
    const contagemProdutos: Record<string, number> = {};
    
    pedidosFechados.forEach(pedido => {
      pedido.items.forEach(item => {
        const nome = item.product.nome;
        contagemProdutos[nome] = (contagemProdutos[nome] || 0) + item.quantidade;
      });
    });

    // Transforma o objeto em lista ordenada
    const rankingProdutos = Object.entries(contagemProdutos)
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5); // Pega só o Top 5

    // Monta o objeto final para o Frontend
    const dadosDashboard = {
      faturamento: totalFaturamento,
      totalPedidos: pedidosFechados.length,
      ticketMedio: pedidosFechados.length > 0 ? totalFaturamento / pedidosFechados.length : 0,
      ranking: rankingProdutos,
      estoqueBaixo: estoqueBaixo,
      ultimosPedidos: pedidosFechados.slice(0, 10) // Mostra só os 10 últimos na lista
    };

    return NextResponse.json(dadosDashboard);

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}