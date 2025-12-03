import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const pedidosAbertos = await prisma.order.findMany({
        where: {
            status: 'ABERTO'},
        include: {
            items: true}});
        return NextResponse.json(pedidosAbertos);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const mesaOcupada = await prisma.order.findFirst({
        where: {
            numMesa: parseInt(body.numMesa),
            status: 'ABERTO'
        }
        });

        if (mesaOcupada) {
        return NextResponse.json({ error: 'Esta mesa já está ocupada!' }, { status: 400 });
        }

        // Cria o pedido
        const novoPedido = await prisma.order.create({
        data: {
            numMesa: parseInt(body.numMesa),
            nomeCliente: body.nomeCliente || 'Cliente',
            status: 'ABERTO'
        }
        });

        return NextResponse.json(novoPedido, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao abrir mesa' }, { status: 500 });
    }
}