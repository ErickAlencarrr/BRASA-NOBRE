import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inicioParam = searchParams.get('inicio');
    const fimParam = searchParams.get('fim');
    const agora = new Date();
    const inicio = inicioParam ? new Date(inicioParam) : new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
    const fim = fimParam ? new Date(fimParam) : new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
    const pedidos = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: inicio,
          lte: fim
        }
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    const faturamentoTotal = pedidos.reduce((acc, p) => acc + p.total, 0);
    const totalPedidos = pedidos.length;
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;
    const vendasPorDia: Record<string, number> = {};
    
    pedidos.forEach(pedido => {
      const dataObj = new Date(pedido.createdAt);
      const dia = dataObj.getDate().toString().padStart(2, '0');
      const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
      const chaveData = `${dia}/${mes}`;
      
      if (!vendasPorDia[chaveData]) {
        vendasPorDia[chaveData] = 0;
      }
      vendasPorDia[chaveData] += pedido.total;
    });

    if (Object.keys(vendasPorDia).length === 0) {
        const diaHoje = agora.getDate().toString().padStart(2, '0');
        const mesHoje = (agora.getMonth() + 1).toString().padStart(2, '0');
        vendasPorDia[`${diaHoje}/${mesHoje}`] = 0;
    }

    const graficoDados = Object.entries(vendasPorDia)
      .map(([dia, valor]) => ({ dia, valor }))
      .reverse();

    const estoqueBaixo = await prisma.product.findMany({
      where: {
        estoque: { lte: 5 },
        controlarEstoque: true,
        ativo: true
      },
      take: 5
    });

    return NextResponse.json({
      resumo: { faturamentoTotal, totalPedidos, ticketMedio },
      grafico: graficoDados,
      listaPedidos: pedidos,
      estoqueBaixo
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}