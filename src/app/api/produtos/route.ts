import { prisma } from '@/lib/prisma';
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const produtos = await prisma.product.findMany({
            orderBy: {
                nome:'asc'
            }
        });
        return NextResponse.json(produtos);
    } catch (error){
        return NextResponse.json({ error:'Erro ao buscar produtos'},{status:500});
    }
}

export async function POST(request: Request){
    try {
        const dados = await request.json();

        const novoProduto = await prisma.product.create({
            data:{
                nome:dados.nome,
                preco: parseFloat(dados.preco),
                estoque:parseInt(dados.estoque),
                categoria: dados.categoria
            }
        });
        return NextResponse.json(novoProduto,{status:201});
    } catch (error){
        console.error(error);
        return NextResponse.json({eroor: 'Erro ao criar produto'}, {status:500});
    }
}