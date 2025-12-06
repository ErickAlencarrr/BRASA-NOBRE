import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PUT: Editar Produto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const produtoAtualizado = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        nome: body.nome,
        preco: parseFloat(body.preco),
        precoCusto: parseFloat(body.precoCusto),
        estoque: parseInt(body.estoque),
        controlarEstoque: body.controlarEstoque, // <--- ATUALIZAÇÃO AQUI
        categoria: body.categoria,
        fornecedor: body.fornecedor,
        ativo: body.ativo
      }
    });

    return NextResponse.json(produtoAtualizado);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

// DELETE: Apagar Produto (Definitivo)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}