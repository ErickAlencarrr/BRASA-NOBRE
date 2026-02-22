import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inicioParam = searchParams.get('inicio');
    const fimParam = searchParams.get('fim');
    
    const agora = new Date();
    // Default to Today if no params
    const inicio = inicioParam ? new Date(inicioParam) : new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
    const fim = fimParam ? new Date(fimParam) : new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);

    // Calculate diff in days
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pedidos = await prisma.order.findMany({
      where: {
        status: 'FECHADO', // Only closed orders
        createdAt: {
          gte: inicio,
          lte: fim
        }
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' }
    });

    const faturamentoTotal = pedidos.reduce((acc, p) => acc + p.total, 0);
    const totalPedidos = pedidos.length;
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;

    const vendasAgrupadas: Record<string, number> = {};
    const labels: string[] = [];

    // Initialize buckets and aggregation strategy
    let formatKey: (date: Date) => string;
    
    if (diffDays <= 1) {
        // Hourly (00-23)
        for (let i = 0; i < 24; i++) {
            labels.push(`${i.toString().padStart(2, '0')}:00`);
        }
        formatKey = (d) => `${d.getHours().toString().padStart(2, '0')}:00`;
    } else if (diffDays <= 35) {
        // Daily
        // Iterate from start to end day to fill zeros? 
        // For simplicity, we trust the query order or just map the found ones?
        // Better to fill gaps for a nice chart.
        const current = new Date(inicio);
        while (current <= fim) {
            const day = current.getDate().toString().padStart(2, '0');
            const month = (current.getMonth() + 1).toString().padStart(2, '0');
            labels.push(`${day}/${month}`);
            current.setDate(current.getDate() + 1);
        }
        formatKey = (d) => {
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            return `${day}/${month}`;
        };
    } else {
        // Monthly (Jan, Feb...)
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 0; i < 12; i++) {
            // Only add if within range? User wanted "todos os meses do ano" for Year view.
            // If the range is 1 year, we show all months.
            labels.push(meses[i]);
        }
        formatKey = (d) => meses[d.getMonth()];
    }

    // Initialize map with 0
    labels.forEach(l => vendasAgrupadas[l] = 0);

    // Aggregate
    pedidos.forEach(pedido => {
      const dataObj = new Date(pedido.createdAt);
      const chave = formatKey(dataObj);
      if (vendasAgrupadas[chave] !== undefined) {
        vendasAgrupadas[chave] += pedido.total;
      }
    });

    const graficoDados = labels.map(dia => ({
        dia,
        valor: vendasAgrupadas[dia] || 0
    }));

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
      listaPedidos: pedidos.reverse().slice(0, 50), // Show latest 50
      estoqueBaixo
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
