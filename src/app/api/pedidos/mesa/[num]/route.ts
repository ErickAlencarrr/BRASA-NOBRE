import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ num: string }> }
) {
    const { num } = await params;
    const numMesa = parseInt(num);

    if (isNaN(numMesa)) {
        return NextResponse.json({ error: 'Número da mesa inválido' }, { status: 400 });
    }
    try {
        const pedido = await prisma.order.findFirst({
        where: {
            numMesa: numMesa,
            status: 'ABERTO'
        },
        include: {
            items: {
            include: {
                product: true
            }
            }
        }
        });
        if (!pedido) {
        return NextResponse.json({ error: 'Mesa não encontrada ou fechada' }, { status: 404 });
        }
        return NextResponse.json(pedido);
    } catch (error) {
        console.error("Erro ao buscar mesa:", error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
    }