'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// ... (Interfaces Produto, ItemPedido, Pedido IGUAIS) ...
interface Produto {
  id: number
  nome: string
  preco: number
  estoque: number
  controlarEstoque: boolean
  categoria: string
  ativo: boolean
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
  
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  
  const [termoBusca, setTermoBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  
  // --- ESTADOS DOS MODAIS ---
  // 1. Adicionar Item
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [qtdModal, setQtdModal] = useState(1)
  const [obsModal, setObsModal] = useState('')
  
  // 2. Resumo/Cupom
  const [mostrarResumo, setMostrarResumo] = useState(false)

  // 3. NOVO: Confirmação de Remoção de Item
  const [itemParaRemover, setItemParaRemover] = useState<number | null>(null)

  // 4. NOVO: Confirmação de Liberar Mesa Vazia
  const [confirmarLiberacao, setConfirmarLiberacao] = useState(false)

  useEffect(() => {
    if (num) carregarDados(num)
  }, [num])

  async function carregarDados(numeroMesa: string) {
    try {
      const resProd = await fetch('/api/produtos', { cache: 'no-store' }) 
      const dadosProd = await resProd.json()
      setProdutos(dadosProd)

      const resMesa = await fetch(`/api/pedidos/mesa/${numeroMesa}`, { cache: 'no-store' })
      if (resMesa.ok) {
        const dadosMesa = await resMesa.json()
        setPedido(dadosMesa)
      }
    } catch (error) {
      toast.error("Erro ao carregar dados.")
    } finally {
      setLoading(false)
    }
  }

  // --- ADICIONAR ITEM ---
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

    if (produtoSelecionado.controlarEstoque && produtoSelecionado.estoque < qtdModal) {
      toast.error(`Estoque insuficiente! Restam: ${produtoSelecionado.estoque}`)
    }

    const toastId = toast.loading('Adicionando...')
    try {
      await fetch('/api/pedidos/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pedido.id,
          productId: produtoSelecionado.id,
          quantidade: qtdModal,
          observacao: obsModal
        })
      })
      await carregarDados(num)
      fecharModal()
      toast.dismiss(toastId)
      toast.success("Item adicionado!")
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro de conexão")
    }
  }

  // --- REMOVER ITEM (Agora com Modal) ---
  function solicitarRemocao(itemId: number) {
    setItemParaRemover(itemId) // Isso abre o modal de confirmação
  }

  async function confirmarRemocao() {
    if (!itemParaRemover) return
    
    const toastId = toast.loading('Devolvendo ao estoque...')
    try {
      await fetch(`/api/pedidos/item/${itemParaRemover}`, { method: 'DELETE' })
      await carregarDados(num)
      toast.dismiss(toastId)
      toast.success("Item removido.")
      setItemParaRemover(null) // Fecha modal
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro ao remover")
    }
  }

  // --- FECHAMENTO E LIBERAÇÃO ---
  function solicitarFechamento() {
    if (!pedido) return;
    if (pedido.items.length === 0) {
      toast("Mesa vazia! Use o botão cinza.", { icon: 'ℹ️' });
      return;
    }
    setMostrarResumo(true);
  }

  // --- LIBERAR MESA VAZIA (Agora com Modal) ---
  function solicitarLiberacao() {
    setConfirmarLiberacao(true) // Abre o modal
  }

  async function confirmarLiberacaoMesa() {
    if (!pedido) return;
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Mesa liberada!")
        router.push('/');
      } else {
        toast.error("Erro ao liberar mesa");
      }
    } catch (error) {
      toast.error("Erro de conexão");
    }
  }

  function imprimirCupom() {
    window.print();
  }

  async function confirmarFechamentoReal() {
    if (!pedido) return;
    const toastId = toast.loading('Fechando conta...');
    try {
      const res = await fetch('/api/pedidos/fechar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pedido.id })
      })
      
      if (res.ok) {
        toast.dismiss(toastId)
        toast.success("Conta fechada!")
        router.push('/');
      } else {
        toast.dismiss(toastId)
        toast.error("Erro ao fechar.")
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro de conexão.");
    }
  }

  const produtosFiltrados = produtos.filter(p => {
    const batemNome = p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    const bateCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
    const bateStatus = p.ativo === true
    return batemNome && bateCategoria && bateStatus
  })
  const categorias = ['todos', ...new Set(produtos.map(p => p.categoria))]

  if (loading) return <div className="p-8 font-bold text-slate-800">Carregando...</div>
  if (!pedido) return <div className="p-8 text-slate-800">Mesa não encontrada.</div>

  return (
    <div className="min-h-screen bg-slate-100 p-4 relative text-slate-800">
      
      {/* 1. MODAL ADICIONAR (JÁ EXISTIA) */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-1 text-slate-900">{produtoSelecionado.nome}</h3>
            {/* ... Conteúdo igual ao anterior ... */}
            <div className="flex justify-between items-center mb-4">
               <p className="text-green-600 font-bold">R$ {produtoSelecionado.preco.toFixed(2)}</p>
               {produtoSelecionado.controlarEstoque ? (
                  <p className={`text-sm font-bold px-2 py-1 rounded ${produtoSelecionado.estoque < 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>Restam: {produtoSelecionado.estoque}</p>
               ) : <p className="text-sm font-bold px-2 py-1 rounded bg-blue-50 text-blue-600">Produção</p>}
            </div>
            
            <label className="block text-sm font-bold text-slate-900 mb-2">Quantidade</label>
            <div className="flex items-center mb-6">
              <button onClick={() => setQtdModal(Math.max(1, qtdModal - 1))} className="bg-slate-200 text-slate-900 px-4 py-2 rounded text-xl font-bold hover:bg-slate-300">-</button>
              <span className="mx-6 font-bold text-2xl text-slate-900">{qtdModal}</span>
              <button onClick={() => setQtdModal(qtdModal + 1)} className="bg-slate-200 text-slate-900 px-4 py-2 rounded text-xl font-bold hover:bg-slate-300">+</button>
            </div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Observação</label>
            <textarea className="w-full border border-slate-300 p-3 rounded mb-6 text-slate-900 outline-none focus:border-blue-500" placeholder="Ex: Sem cebola..." rows={3} value={obsModal} onChange={e => setObsModal(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={fecharModal} className="flex-1 bg-slate-200 py-3 rounded hover:bg-slate-300 font-bold text-slate-800">Cancelar</button>
              <button onClick={confirmarAdicao} className="flex-1 bg-green-600 py-3 rounded hover:bg-green-700 text-white font-bold shadow">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL CONFIRMAR REMOÇÃO DE ITEM (NOVO) */}
      {itemParaRemover && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Remover Item?</h3>
              <p className="text-slate-500 mt-2">O item será excluído da comanda e a quantidade retornará ao estoque automaticamente.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setItemParaRemover(null)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300">Cancelar</button>
              <button onClick={confirmarRemocao} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200">Sim, Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL CONFIRMAR LIBERAR MESA (NOVO) */}
      {confirmarLiberacao && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Liberar Mesa Vazia?</h3>
            <p className="text-slate-500 mb-6">Essa ação cancela o pedido. Use apenas se o cliente foi embora sem consumir nada.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarLiberacao(false)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300">Voltar</button>
              <button onClick={confirmarLiberacaoMesa} className="flex-1 bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL RESUMO/CUPOM (JÁ EXISTIA) */}
      {mostrarResumo && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-2">
          {/* ... Código do cupom igual ao anterior ... */}
           <div id="area-impressao" className="bg-white w-full max-w-sm p-6 shadow-2xl rounded-lg no-print-shadow animate-in slide-in-from-bottom-10 duration-300">
            {/* ... Conteúdo do Cupom ... */}
            <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
              <h2 className="text-2xl font-bold uppercase text-slate-900">Espetinho da Brasa</h2>
              <div className="text-left text-xs text-slate-600 mt-2 font-mono">
                <p>DATA: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
                <p>MESA: {num}</p>
              </div>
            </div>
            <div className="mb-4">
              <table className="w-full text-left text-sm font-mono">
                <thead><tr className="border-b border-slate-300"><th className="pb-1">QTD</th><th className="pb-1">ITEM</th><th className="text-right pb-1">VALOR</th></tr></thead>
                <tbody className="text-slate-800">
                  {pedido.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-1 align-top">{item.quantidade}x</td>
                      <td className="py-1">{item.product.nome}{item.observacao && <div className="text-[10px] italic text-slate-500">({item.observacao})</div>}</td>
                      <td className="text-right py-1 align-top">{(item.preco * item.quantidade).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t-2 border-dashed border-slate-300 pt-2 mb-6 font-mono text-slate-900">
              <div className="flex justify-between text-lg font-bold"><span>TOTAL</span><span>R$ {pedido.total.toFixed(2)}</span></div>
            </div>
            {/* ... Fim conteúdo Cupom ... */}
            
            <div className="no-print flex flex-col gap-2">
              <button onClick={imprimirCupom} className="w-full bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-700">🖨️ Imprimir</button>
              <button onClick={confirmarFechamentoReal} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 shadow-lg mt-2">✅ Confirmar Fechamento</button>
              <button onClick={() => setMostrarResumo(false)} className="w-full bg-slate-200 text-slate-700 py-3 rounded font-bold hover:bg-slate-300">Voltar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEUDO PRINCIPAL */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded shadow border-l-4 border-blue-500">
        <div><h1 className="text-2xl font-bold text-slate-800">Mesa {num}</h1><p className="text-slate-500 font-medium">{pedido.nomeCliente}</p></div>
        <div className="text-right"><p className="text-sm text-slate-500 uppercase">Total</p><p className="text-4xl font-bold text-green-600">R$ {pedido.total.toFixed(2)}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-160px)]">
        <div className="lg:col-span-2 bg-white p-4 rounded shadow flex flex-col h-full">
          {/* ... Filtros e Lista de Produtos (Código igual) ... */}
           <div className="mb-4 space-y-3">
            <input type="text" placeholder="🔍 Buscar item..." className="w-full border border-slate-300 p-2 rounded text-slate-900 outline-none focus:border-blue-500" value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {categorias.map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-4 py-1 rounded-full text-sm font-bold capitalize whitespace-nowrap transition ${categoriaFiltro === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto content-start flex-1">
            {produtosFiltrados.map(prod => (
              <button key={prod.id} onClick={() => abrirModal(prod)} className="border border-slate-200 p-3 rounded hover:bg-blue-50 hover:border-blue-400 transition text-left group shadow-sm bg-slate-50 flex flex-col justify-between relative overflow-hidden">
                {prod.controlarEstoque && (
                  <div className="absolute top-0 right-0 p-1"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${prod.estoque < 5 ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{prod.estoque}</span></div>
                )}
                <p className="font-bold text-slate-800 group-hover:text-blue-700 text-sm leading-tight mb-2 pr-4">{prod.nome}</p>
                <p className="text-green-600 font-bold text-sm">R$ {prod.preco.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow flex flex-col border-2 border-slate-100 h-full">
          <h2 className="font-bold mb-4 text-lg text-slate-800 flex items-center">📄 Extrato</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {pedido.items.map((item) => (
              <div key={item.id} className="border-b border-slate-100 pb-2 mb-2 last:border-0 hover:bg-slate-50 p-2 rounded group transition hover:pl-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1"><div className="flex items-center"><span className="font-bold text-slate-800 bg-slate-200 w-6 h-6 flex items-center justify-center rounded-full text-xs mr-2">{item.quantidade}</span><span className="text-slate-800 font-medium">{item.product.nome}</span></div>{item.observacao && <p className="text-xs text-orange-600 mt-1 ml-8 italic font-medium">{item.observacao}</p>}</div>
                  <div className="text-right ml-2">
                    <div className="text-slate-900 font-mono font-bold">R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                    {/* AQUI AGORA CHAMA O MODAL DE REMOÇÃO */}
                    <button onClick={() => solicitarRemocao(item.id)} className="text-xs text-red-400 hover:text-red-600 mt-1 underline font-medium">Remover</button>
                  </div>
                </div>
              </div>
            ))}
            {pedido.items.length === 0 && <p className="text-center text-slate-400 mt-10">Mesa vazia.</p>}
          </div>
          <div className="mt-auto pt-4 border-t space-y-2">
            <Link href="/" className="block text-center w-full bg-slate-500 text-white py-3 rounded hover:bg-slate-600 font-bold shadow transition hover:scale-[1.02]">Voltar</Link>
            
            {pedido.items.length > 0 ? (
                <button onClick={solicitarFechamento} className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 font-bold shadow-lg shadow-red-200 transition hover:scale-[1.02]">
                    Conferir e Fechar Conta
                </button>
              ) : (
                <button onClick={solicitarLiberacao} className="w-full bg-slate-400 text-white py-3 rounded hover:bg-slate-500 font-bold shadow transition hover:scale-[1.02]">
                    Liberar Mesa (Sem Consumo)
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}