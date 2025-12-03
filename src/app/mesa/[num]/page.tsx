'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

interface Produto {
  id: number
  nome: string
  preco: number
  categoria: string
}

interface ItemPedido {
  id: number
  quantidade: number
  preco: number
  observacao?: string
  product: { nome: string }
}

interface Pedido {
  id: number
  nomeCliente: string
  total: number
  items: ItemPedido[]
}

export default function DetalhesMesa({ params }: { params: Promise<{ num: string }> }) {
  const { num } = use(params)
  const router = useRouter()
  
  // Estados de Dados
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  
  // Estados de Interface
  const [loading, setLoading] = useState(true)
  const [termoBusca, setTermoBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  
  // Estados do Modal
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [qtdModal, setQtdModal] = useState(1)
  const [obsModal, setObsModal] = useState('')

  useEffect(() => {
    if (num) carregarDados(num)
  }, [num])

  async function carregarDados(numeroMesa: string) {
    try {
      const resProd = await fetch('/api/produtos')
      const dadosProd = await resProd.json()
      setProdutos(dadosProd)

      const resMesa = await fetch(`/api/pedidos/mesa/${numeroMesa}`)
      if (resMesa.ok) {
        const dadosMesa = await resMesa.json()
        setPedido(dadosMesa)
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- LÓGICA DO MODAL ---
  function abrirModal(produto: Produto) {
    setProdutoSelecionado(produto)
    setQtdModal(1)
    setObsModal('')
  }

  function fecharModal() {
    setProdutoSelecionado(null)
  }

  async function confirmarAdicao() {
    if (!pedido || !produtoSelecionado) return;

    try {
      const res = await fetch('/api/pedidos/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pedido.id,
          productId: produtoSelecionado.id,
          quantidade: qtdModal,
          observacao: obsModal
        })
      })

      if (res.ok) {
        await carregarDados(num)
        fecharModal()
      } else {
        alert("Erro ao adicionar item")
      }
    } catch (error) {
      alert("Erro de conexão")
    }
  }

  // --- LÓGICA DE REMOVER ---
  async function removerItem(itemId: number) {
    if (!confirm("Tem certeza que deseja remover este item?")) return;

    try {
      const res = await fetch(`/api/pedidos/item/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        await carregarDados(num)
      }
    } catch (error) {
      alert("Erro ao remover")
    }
  }

  // --- LÓGICA DE FECHAR CONTA ---
  async function fecharConta() {
    if (!pedido) return;
    const confirmacao = confirm(`Fechar conta? Total: R$ ${pedido.total.toFixed(2)}`);
    if (!confirmacao) return;

    const res = await fetch('/api/pedidos/fechar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pedido.id })
    })

    if (res.ok) router.push('/');
  }

  // --- FILTROS ---
  const produtosFiltrados = produtos.filter(p => {
    const batemNome = p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    const bateCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
    return batemNome && bateCategoria
  })

  const categorias = ['todos', ...new Set(produtos.map(p => p.categoria))]

  if (loading) return <div className="p-8 font-bold text-slate-800">Carregando...</div>
  if (!pedido) return <div className="p-8 text-slate-800">Mesa não encontrada.</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 relative text-slate-800">
      
      {/* MODAL (JANELA DE CONFIRMAÇÃO) */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            
            {/* Título do Produto */}
            <h3 className="text-xl font-bold mb-2 text-slate-900">{produtoSelecionado.nome}</h3>
            <p className="text-green-600 font-bold mb-4">R$ {produtoSelecionado.preco.toFixed(2)}</p>
            
            {/* Quantidade */}
            <label className="block text-sm font-bold text-slate-900 mb-2">Quantidade</label>
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setQtdModal(Math.max(1, qtdModal - 1))} 
                className="bg-slate-200 text-slate-900 px-4 py-2 rounded text-xl font-bold hover:bg-slate-300"
              >
                -
              </button>
              <span className="mx-6 font-bold text-2xl text-slate-900">{qtdModal}</span>
              <button 
                onClick={() => setQtdModal(qtdModal + 1)} 
                className="bg-slate-200 text-slate-900 px-4 py-2 rounded text-xl font-bold hover:bg-slate-300"
              >
                +
              </button>
            </div>

            {/* Observação */}
            <label className="block text-sm font-bold text-slate-900 mb-2">Observação (Opcional)</label>
            <textarea 
              className="w-full border border-slate-300 p-3 rounded mb-6 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 outline-none" 
              placeholder="Ex: Sem cebola, Com gelo..."
              rows={3}
              value={obsModal}
              onChange={e => setObsModal(e.target.value)}
            />

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <button 
                onClick={fecharModal} 
                className="flex-1 bg-slate-200 py-3 rounded hover:bg-slate-300 font-bold text-slate-800"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarAdicao} 
                className="flex-1 bg-green-600 py-3 rounded hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200"
              >
                Adicionar ao Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded shadow border-l-4 border-blue-500">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mesa {num}</h1>
          <p className="text-slate-500 font-medium">{pedido.nomeCliente}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 uppercase">Total</p>
          <p className="text-4xl font-bold text-green-600">R$ {pedido.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-160px)]">
        
        {/* COLUNA ESQUERDA: CARDÁPIO */}
        <div className="lg:col-span-2 bg-white p-4 rounded shadow flex flex-col h-full">
          
          {/* BARRA DE PESQUISA E FILTROS */}
          <div className="mb-4 space-y-3">
            <input 
              type="text"
              placeholder="🔍 Buscar item..."
              className="w-full border border-slate-300 p-2 rounded text-slate-900 placeholder:text-slate-400"
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-4 py-1 rounded-full text-sm font-bold capitalize whitespace-nowrap transition
                    ${categoriaFiltro === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE PRODUTOS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto content-start flex-1">
            {produtosFiltrados.map(prod => (
              <button
                key={prod.id}
                onClick={() => abrirModal(prod)}
                className="border border-slate-200 p-3 rounded hover:bg-blue-50 hover:border-blue-400 transition text-left group shadow-sm bg-slate-50 flex flex-col justify-between"
              >
                <p className="font-bold text-slate-800 group-hover:text-blue-700 text-sm leading-tight mb-2">{prod.nome}</p>
                <p className="text-green-600 font-bold text-sm">R$ {prod.preco.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: EXTRATO */}
        <div className="bg-white p-4 rounded shadow flex flex-col border-2 border-slate-100 h-full">
          <h2 className="font-bold mb-4 text-lg text-slate-800 flex items-center">
            📄 Extrato
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {pedido.items.map((item) => (
              <div key={item.id} className="border-b border-slate-100 pb-2 mb-2 last:border-0 hover:bg-slate-50 p-2 rounded group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-bold text-slate-800 bg-slate-200 w-6 h-6 flex items-center justify-center rounded-full text-xs mr-2">
                        {item.quantidade}
                      </span>
                      <span className="text-slate-800 font-medium">{item.product.nome}</span>
                    </div>
                    {item.observacao && (
                      <p className="text-xs text-orange-600 mt-1 ml-8 italic font-medium">Nota: {item.observacao}</p>
                    )}
                  </div>
                  
                  <div className="text-right ml-2">
                    <div className="text-slate-900 font-mono font-bold">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => removerItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 mt-1 underline font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pedido.items.length === 0 && <p className="text-center text-slate-400 mt-10">Mesa vazia.</p>}
          </div>

          <div className="mt-auto pt-4 border-t space-y-2">
             <Link href="/" className="block text-center w-full bg-slate-500 text-white py-3 rounded hover:bg-slate-600 font-bold shadow">
                Voltar
             </Link>
             <button onClick={fecharConta} className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 font-bold shadow-lg shadow-red-200">
                Fechar Conta
             </button>
          </div>
        </div>

      </div>
    </div>
  )
}