import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
        return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 });
        }

        const pedidoAtualizado = await prisma.order.update({
        where: {
            id: parseInt(orderId)
        },
        data: {
            status: 'FECHADO'
        }
        });

        return NextResponse.json(pedidoAtualizado);

    } catch (error) {
        console.error("Erro ao fechar conta:", error);
        return NextResponse.json({ error: 'Erro ao fechar conta' }, { status: 500 });
    }
    }