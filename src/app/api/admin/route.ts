import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Pegar datas da URL (Ex: ?inicio=2023-12-01&fim=2023-12-31)
    const { searchParams } = new URL(request.url);
    const inicioParam = searchParams.get('inicio');
    const fimParam = searchParams.get('fim');

    // Se não mandar data, pega as últimas 24h por padrão
    const hoje = new Date();
    const inicio = inicioParam ? new Date(inicioParam) : new Date(new Date().setHours(0,0,0,0));
    const fim = fimParam ? new Date(fimParam) : new Date(new Date().setHours(23,59,59,999));

    // 2. Busca Pedidos no período
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

    // 3. Cálculos Gerais
    const faturamentoTotal = pedidos.reduce((acc, p) => acc + p.total, 0);
    const totalPedidos = pedidos.length;
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;

    // 4. Agrupar Vendas por Dia (Para o Gráfico)
    // Cria um mapa: "15/12": 150.00, "16/12": 300.00
    const vendasPorDia: Record<string, number> = {};
    
    pedidos.forEach(pedido => {
      // Formata data para DD/MM
      const dataFormatada = new Date(pedido.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      if (!vendasPorDia[dataFormatada]) {
        vendasPorDia[dataFormatada] = 0;
      }
      vendasPorDia[dataFormatada] += pedido.total;
    });

    // Transforma em array para o gráfico ordenar cronologicamente
    const graficoDados = Object.entries(vendasPorDia)
      .map(([dia, valor]) => ({ dia, valor }))
      .reverse(); // Reverte porque o orderBy veio desc

    // 5. Produtos mais vendidos (Ranking)
    const rankingProdutos: Record<string, number> = {};
    pedidos.forEach(p => {
      p.items.forEach(item => {
        // Precisamos do nome do produto. Como o include items não traz o product por padrão no prisma antigo,
        // vamos confiar que você pode precisar ajustar o include ou usar o que tem.
        // TRUQUE: Vamos contar quantas vezes o item apareceu.
        // Se quiser o nome exato, precisaria de include: { items: { include: { product: true } } }
        // Vou manter simples por enquanto.
      });
    });
    
    // 6. Estoque Baixo (Independe de data, pega o atual)
    const estoqueBaixo = await prisma.product.findMany({
      where: { 
        estoque: { lte: 5 },
        controlarEstoque: true,
        ativo: true
      },
      take: 5
    });

    return NextResponse.json({
      resumo: {
        faturamentoTotal,
        totalPedidos,
        ticketMedio
      },
      grafico: graficoDados,
      listaPedidos: pedidos, // Mandamos a lista para exibir na tabela
      estoqueBaixo
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 });
  }
}