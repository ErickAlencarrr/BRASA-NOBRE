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
        status: 'FECHADO',
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

    // Helper para converter UTC para Brasília (UTC-3)
    // O servidor Vercel roda em UTC. Precisamos subtrair 3 horas.
    const toBrasilia = (date: Date) => {
      return new Date(date.getTime() - 3 * 60 * 60 * 1000);
    };

    // Initialize buckets and aggregation strategy
    let formatKey: (date: Date) => string;
    
    if (diffDays <= 1) {
        // Hourly (00-23)
        for (let i = 0; i < 24; i++) {
            labels.push(`${i.toString().padStart(2, '0')}:00`);
        }
        formatKey = (d) => {
            const brt = toBrasilia(d);
            return `${brt.getUTCHours().toString().padStart(2, '0')}:00`;
        };
    } else if (diffDays <= 35) {
        // Daily
        const current = new Date(inicio);
        while (current <= fim) {
            const brtCurrent = toBrasilia(current);
            const day = brtCurrent.getUTCDate().toString().padStart(2, '0');
            const month = (brtCurrent.getUTCMonth() + 1).toString().padStart(2, '0');
            labels.push(`${day}/${month}`);
            current.setDate(current.getDate() + 1);
        }
        // Remove duplicates if any (due to timezone shift logic on loop)
        // actually simpler: just trust the aggregation to fill keys, but we want empty days too.
        // Let's stick to generating keys from the orders if the loop is complex?
        // No, user wants consistent x-axis.
        // Let's simplify: just labels from data + gap filling?
        // Re-implement Daily loop simpler: just loop 7 days back from today or based on range?
        // Let's stick to the previous loop but use UTC methods on the shifted date.
        // We need to re-generate labels correctly for the range.
        // Actually, 'inicio' and 'fim' are UTC from the client (or constructed server side).
        // If we want labels to be BRT days, we should iterate in BRT.
        // Let's simplified: Labels will be dynamic based on data + filling gaps is nice but hard to match exact range.
        // Let's KEEP the previous label generation logic but use BRT in formatKey.
        
        // RE-GENERATING LABELS correctly for the loop is tricky without a library.
        // Let's fallback to "labels from range" but strictly.
        // Actually, simply iterating dates is fine.
        // We will clear labels array and rebuild it inside the if block properly.
        
        // Reset labels from previous block attempts
        labels.length = 0; 
        const iter = new Date(inicio);
        while (iter <= fim) {
             const day = iter.getDate().toString().padStart(2, '0'); // Local time of server (UTC) which effectively aligns with range start
             const month = (iter.getMonth() + 1).toString().padStart(2, '0');
             const lbl = `${day}/${month}`;
             if (!labels.includes(lbl)) labels.push(lbl);
             iter.setDate(iter.getDate() + 1);
        }

        formatKey = (d) => {
            const brt = toBrasilia(d);
            const day = brt.getUTCDate().toString().padStart(2, '0');
            const month = (brt.getUTCMonth() + 1).toString().padStart(2, '0');
            return `${day}/${month}`;
        };
    } else {
        // Monthly
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 0; i < 12; i++) {
            labels.push(meses[i]);
        }
        formatKey = (d) => {
            const brt = toBrasilia(d);
            return meses[brt.getUTCMonth()];
        };
    }

    // Initialize map
    labels.forEach(l => vendasAgrupadas[l] = 0);

    // Aggregate
    pedidos.forEach(pedido => {
      const dataObj = new Date(pedido.createdAt);
      const chave = formatKey(dataObj);
      // Only add if key exists (within range) or add it?
      // Better to check if exists to avoid pollution
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
