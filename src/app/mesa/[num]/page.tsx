'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { updateOrderItemStatus } from '../../lib/actions'

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
  status: string // PENDENTE, PREPARANDO, PRONTO, ENTREGUE
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
  
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [qtdModal, setQtdModal] = useState(1)
  const [obsModal, setObsModal] = useState('')
  const [mostrarResumo, setMostrarResumo] = useState(false)
  const [itemParaRemover, setItemParaRemover] = useState<number | null>(null)
  const [confirmarLiberacao, setConfirmarLiberacao] = useState(false)

  useEffect(() => { if (num) carregarDados(num) }, [num])

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
    } catch (error) { toast.error("Erro ao carregar dados.") } 
    finally { setLoading(false) }
  }

  function abrirModal(produto: Produto) {
    setProdutoSelecionado(produto)
    setQtdModal(1)
    setObsModal('')
  }
  function fecharModal() { setProdutoSelecionado(null) }

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
          orderId: pedido.id, productId: produtoSelecionado.id, quantidade: qtdModal, observacao: obsModal
        })
      })
      await carregarDados(num)
      fecharModal()
      toast.dismiss(toastId); toast.success("Item adicionado!")
    } catch (error) { toast.dismiss(toastId); toast.error("Erro de conexão") }
  }

  function solicitarRemocao(itemId: number) { setItemParaRemover(itemId) }
  async function confirmarRemocao() {
    if (!itemParaRemover) return
    const toastId = toast.loading('Removendo...')
    try {
      await fetch(`/api/pedidos/item/${itemParaRemover}`, { method: 'DELETE' })
      await carregarDados(num)
      toast.dismiss(toastId); toast.success("Item removido."); setItemParaRemover(null)
    } catch (error) { toast.dismiss(toastId); toast.error("Erro ao remover") }
  }

  async function confirmarEntrega(itemId: number) {
    const toastId = toast.loading('Confirmando entrega...');
    const result = await updateOrderItemStatus(itemId, 'ENTREGUE');
    if (result.success) {
        await carregarDados(num);
        toast.dismiss(toastId);
        toast.success("Entrega confirmada!");
    } else {
        toast.dismiss(toastId);
        toast.error("Erro ao confirmar.");
    }
  }

  function solicitarFechamento() {
    if (!pedido) return;
    if (pedido.items.length === 0) { toast("Mesa vazia!", { icon: 'ℹ️' }); return; }
    setMostrarResumo(true);
  }

  function solicitarLiberacao() { setConfirmarLiberacao(true) }
  async function confirmarLiberacaoMesa() {
    if (!pedido) return;
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success("Mesa liberada!"); router.push('/mesas'); } 
      else { toast.error("Erro ao liberar mesa"); }
    } catch (error) { toast.error("Erro de conexão"); }
  }

  function imprimirCupom() {
    const conteudo = document.getElementById('area-impressao')?.innerHTML;
    if (!conteudo) return;

    let iframe = document.getElementById('impressao-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'impressao-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Cupom</title>
            <style>
              @page { margin: 0; size: 80mm auto; }
              body { 
                font-family: Arial, sans-serif; 
                width: 72mm; /* Área de impressão real da Epson TM-T20X */
                margin: 0; 
                padding: 2mm 4mm 2mm 2mm; /* Margem extra na direita para não cortar */
                box-sizing: border-box;
                color: black; 
                background: white;
                font-size: 11px; /* Levemente menor para caber melhor */
              }
              table { width: 100%; border-collapse: collapse; table-layout: fixed; }
              th, td { padding: 4px 0; word-wrap: break-word; }
              th:nth-child(1), td:nth-child(1) { width: 15%; } /* QTD */
              th:nth-child(2), td:nth-child(2) { width: 55%; padding-right: 2px; } /* ITEM */
              th:nth-child(3), td:nth-child(3) { width: 30%; text-align: right; } /* VALOR */
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .font-bold { font-weight: bold; }
              .uppercase { text-transform: uppercase; }
              .text-2xl { font-size: 16px; }
              .text-lg { font-size: 13px; }
              .text-xs { font-size: 9px; }
              .text-sm { font-size: 11px; }
              .border-b { border-bottom: 1px solid #000; }
              .border-b-2 { border-bottom: 2px dashed #000; }
              .border-t-2 { border-top: 2px dashed #000; }
              .pb-4 { padding-bottom: 8px; }
              .mb-4 { margin-bottom: 8px; }
              .mb-6 { margin-bottom: 12px; }
              .mt-2 { margin-top: 4px; }
              .pt-2 { padding-top: 4px; }
              .flex { display: flex; }
              .flex-col { flex-direction: column; }
              .justify-between { justify-content: space-between; }
              .align-top { vertical-align: top; }
              .no-print { display: none !important; }
              
              /* Força tudo a ficar preto na impressão */
              * { color: black !important; }
            </style>
          </head>
          <body>
            ${conteudo}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 500);
    }
  }
  async function confirmarFechamentoReal() {
    if (!pedido) return;
    const toastId = toast.loading('Fechando conta...');
    try {
      const res = await fetch('/api/pedidos/fechar', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: pedido.id })
      })
      if (res.ok) { toast.dismiss(toastId); toast.success("Conta fechada!"); router.push('/mesas'); } 
      else { toast.dismiss(toastId); toast.error("Erro ao fechar.") }
    } catch (error) { toast.dismiss(toastId); toast.error("Erro de conexão."); }
  }

  const produtosFiltrados = produtos.filter(p => {
    return p.nome.toLowerCase().includes(termoBusca.toLowerCase()) &&
          (categoriaFiltro === 'todos' || p.categoria === categoriaFiltro) &&
          p.ativo === true
  })
  const categorias = ['todos', ...new Set(produtos.map(p => p.categoria))]

  if (loading) return <div className="p-8 font-bold text-slate-800 dark:text-white">Carregando...</div>
  if (!pedido) return <div className="p-8 text-slate-800 dark:text-white">Mesa não encontrada.</div>

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 relative text-slate-800 dark:text-slate-100 transition-colors">

      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
            
            <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{produtoSelecionado.nome}</h3>
            
            <div className="flex justify-between items-center mb-6">
              <p className="text-green-600 dark:text-green-400 font-bold text-lg">R$ {produtoSelecionado.preco.toFixed(2)}</p>
              {produtoSelecionado.controlarEstoque ? (
                  <p className={`text-sm font-bold px-2 py-1 rounded ${produtoSelecionado.estoque < 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    Restam: {produtoSelecionado.estoque}
                  </p>
              ) : <p className="text-sm font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">Produção</p>}
            </div>
            
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quantidade</label>
            <div className="flex items-center mb-6 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <button onClick={() => setQtdModal(Math.max(1, qtdModal - 1))} className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white w-12 h-12 rounded-lg text-xl font-bold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition">-</button>
              <span className="flex-1 text-center font-bold text-3xl text-slate-900 dark:text-white">{qtdModal}</span>
              <button onClick={() => setQtdModal(qtdModal + 1)} className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white w-12 h-12 rounded-lg text-xl font-bold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition">+</button>
            </div>
            
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Observação</label>
            <textarea
              className="w-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-lg mb-6 outline-none focus:border-blue-500 placeholder:text-slate-400" 
              placeholder="Ex: Sem cebola, bem passado..."
              rows={3}
              value={obsModal}
              onChange={e => setObsModal(e.target.value)}/>
            <div className="flex gap-3">
              <button onClick={fecharModal} className="flex-1 bg-slate-200 dark:bg-slate-800 py-3 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition">Cancelar</button>
              <button onClick={confirmarAdicao} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition hover:scale-[1.02]">Adicionar Item</button>
            </div>
          </div>
        </div>
      )}
      {itemParaRemover && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 animate-in zoom-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Remover Item?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">O item voltará para o estoque.</p>
            <div className="flex gap-3">
              <button onClick={() => setItemParaRemover(null)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-bold">Cancelar</button>
              <button onClick={confirmarRemocao} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">Remover</button>
            </div>
          </div>
        </div>
      )}
      {confirmarLiberacao && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Liberar Mesa?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Confirme se o cliente saiu sem consumir.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarLiberacao(false)} className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-bold">Voltar</button>
              <button onClick={confirmarLiberacaoMesa} className="flex-1 bg-slate-800 dark:bg-slate-700 text-white py-3 rounded-lg font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarResumo && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-2 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:block">
          <div id="area-impressao" className="bg-white w-full max-w-sm p-6 shadow-2xl rounded-lg no-print-shadow print:max-w-[80mm] print:w-[80mm] print:p-0 print:m-0 print:shadow-none">
            <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
              <h2 className="text-2xl font-bold uppercase text-slate-900">Brasa Nobre</h2>
              <div className="text-left text-xs text-slate-600 mt-2 font-mono">
                <p>DATA: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
                <p>MESA: {num}</p>
              </div>
            </div>
            <div className="mb-4">
              <table className="w-full text-left text-sm font-mono">
                <thead><tr className="border-b border-slate-300"><th className="pb-1 text-black">QTD</th><th className="pb-1 text-black">ITEM</th><th className="text-right pb-1 text-black">VALOR</th></tr></thead>
                <tbody className="text-slate-800">
                  {pedido.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-1 align-top text-black">{item.quantidade}x</td>
                      <td className="py-1 text-black">{item.product.nome}</td>
                      <td className="text-right py-1 align-top text-black">{(item.preco * item.quantidade).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t-2 border-dashed border-slate-300 pt-2 mb-6 font-mono text-slate-900">
              <div className="flex justify-between text-lg font-bold text-black"><span>TOTAL</span><span>R$ {pedido.total.toFixed(2)}</span></div>
            </div>
            <div className="no-print flex flex-col gap-2">
              <button onClick={imprimirCupom} className="w-full bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-700">🖨️ Imprimir</button>
              <button onClick={confirmarFechamentoReal} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 shadow-lg mt-2">✅ Confirmar Fechamento</button>
              <button onClick={() => setMostrarResumo(false)} className="w-full bg-slate-200 text-slate-700 py-3 rounded font-bold hover:bg-slate-300">Voltar</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow border-l-4 border-blue-500 dark:border-blue-400 transition-colors">
        <div><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mesa {num}</h1><p className="text-slate-500 dark:text-slate-400 font-medium">{pedido.nomeCliente}</p></div>
        <div className="text-right"><p className="text-sm text-slate-500 dark:text-slate-400 uppercase">Total</p><p className="text-4xl font-bold text-green-600 dark:text-green-400">R$ {pedido.total.toFixed(2)}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-160px)]">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl shadow flex flex-col h-full border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="mb-4 space-y-3">
            <input type="text" placeholder="🔍 Buscar item..." className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-lg outline-none focus:border-blue-500 transition-colors" value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {categorias.map(cat => (
                <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition ${categoriaFiltro === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto content-start flex-1">
            {produtosFiltrados.map(prod => (
              <button key={prod.id} onClick={() => abrirModal(prod)} className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition text-left group shadow-sm flex flex-col justify-between relative overflow-hidden h-28">
                {prod.controlarEstoque && (
                  <div className="absolute top-0 right-0 p-1"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${prod.estoque < 5 ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{prod.estoque}</span></div>
                )}
                <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 text-sm leading-tight pr-2 line-clamp-2">{prod.nome}</p>
                <p className="text-green-600 dark:text-green-400 font-bold text-sm">R$ {prod.preco.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow flex flex-col border-2 border-slate-100 dark:border-slate-800 h-full transition-colors">
          <h2 className="font-bold mb-4 text-lg text-slate-800 dark:text-white flex items-center">📄 Extrato</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {pedido.items.map((item) => (
              <div key={item.id} className={`border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 last:border-0 p-2 rounded group transition ${item.status === 'PRONTO' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 w-6 h-6 flex items-center justify-center rounded-full text-xs mr-2">{item.quantidade}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{item.product.nome}</span>
                        {item.status === 'PRONTO' && <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded font-bold animate-pulse">PRONTO 🔔</span>}
                    </div>
                    {item.observacao && <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 ml-8 italic font-medium">{item.observacao}</p>}
                  </div>
                  <div className="text-right ml-2 flex flex-col items-end">
                    <div className="text-slate-900 dark:text-white font-mono font-bold">R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                    
                    {item.status === 'PRONTO' ? (
                        <button onClick={() => confirmarEntrega(item.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded mt-1 hover:bg-green-700 transition shadow-sm font-bold">
                            Entregar
                        </button>
                    ) : (
                        <button onClick={() => solicitarRemocao(item.id)} className="text-xs text-red-400 hover:text-red-600 mt-1 underline font-medium">Remover</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {pedido.items.length === 0 && <p className="text-center text-slate-400 mt-10">Mesa vazia.</p>}
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Link href="/mesas" className="block text-center w-full bg-slate-500 dark:bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 font-bold shadow transition hover:scale-[1.02]">Voltar</Link>
            {pedido.items.length > 0 ? (
                <button onClick={solicitarFechamento} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold shadow-lg shadow-red-200 dark:shadow-none transition hover:scale-[1.02]">
                    Conferir e Fechar Conta
                </button>
            ) : (
                <button onClick={solicitarLiberacao} className="w-full bg-slate-400 dark:bg-slate-600 text-white py-3 rounded-lg hover:bg-slate-500 font-bold shadow transition hover:scale-[1.02]">
                    Liberar Mesa (Sem Consumo)
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}