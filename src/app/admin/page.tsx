'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Pedido {
  id: number
  nomeCliente: string
  total: number
  createdAt: string
}

interface DadosDashboard {
  resumo: {
    faturamentoTotal: number
    totalPedidos: number
    ticketMedio: number
  }
  grafico: { dia: string; valor: number }[]
  listaPedidos: Pedido[]
  estoqueBaixo: { id: number; nome: string; estoque: number }[]
}

export default function AdminDashboard() {
  const [dados, setDados] = useState<DadosDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  
  
  const [periodoAtivo, setPeriodoAtivo] = useState<'hoje' | '7dias' | 'mes' | 'custom'>('hoje')
  const [dataEspecifica, setDataEspecifica] = useState('')

  useEffect(() => {
    carregarRelatorio('hoje')
  }, [])

  function getDatas(periodo: string) {
    const fim = new Date()
    const inicio = new Date()
    
    if (periodo === 'hoje') {
      inicio.setHours(0, 0, 0, 0)
      fim.setHours(23, 59, 59, 999)
    } else if (periodo === '7dias') {
      inicio.setDate(fim.getDate() - 7)
    } else if (periodo === 'mes') {
      inicio.setDate(1)
    }
    
    return {
      inicio: inicio.toISOString(),
      fim: fim.toISOString()
    }
  }

  async function carregarRelatorio(periodo: 'hoje' | '7dias' | 'mes') {
    setLoading(true)
    setPeriodoAtivo(periodo)
    setDataEspecifica('')
    
    const { inicio, fim } = getDatas(periodo)
    
    try {
      const res = await fetch(`/api/admin?inicio=${inicio}&fim=${fim}`, { cache: 'no-store' })
      const data = await res.json()
      setDados(data)
    } catch (error) {
      toast.error("Erro ao atualizar dashboard")
    } finally {
      setLoading(false)
    }
  }

  async function buscarPorData(dataIso: string) {

    if (!dataIso) return
    setLoading(true)
    setPeriodoAtivo('custom')
    setDataEspecifica(dataIso)

    const inicio = new Date(dataIso + 'T00:00:00').toISOString()
    const fim = new Date(dataIso + 'T23:59:59').toISOString()

    try {
      const res = await fetch(`/api/admin?inicio=${inicio}&fim=${fim}`, { cache: 'no-store' })
      const data = await res.json()
      setDados(data)
    } catch (error) {
      toast.error("Erro ao buscar data")
    } finally {
      setLoading(false)
    }
  }

  const maiorVenda = dados?.grafico.reduce((max, item) => Math.max(max, item.valor), 0) || 1

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase">
            Financeiro <span className="text-red-600">Brasa Nobre</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visão geral de desempenho</p>
        </div>
        <Link
          href="/"
          className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition">
          ← Voltar para Mapa
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => carregarRelatorio('hoje')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${periodoAtivo === 'hoje' ? 'bg-white dark:bg-slate-700 text-red-600 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
            Hoje
          </button>
          <button
            onClick={() => carregarRelatorio('7dias')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${periodoAtivo === '7dias' ? 'bg-white dark:bg-slate-700 text-red-600 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
            7 Dias
          </button>
          <button
            onClick={() => carregarRelatorio('mes')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${periodoAtivo === 'mes' ? 'bg-white dark:bg-slate-700 text-red-600 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
            Mês
          </button>
        </div>
        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Ou data específica:</span>
          <input
            type="date"
            className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-2 rounded-lg font-bold outline-none focus:border-red-500 transition-colors w-full md:w-auto"
            value={dataEspecifica}
            onChange={(e) => buscarPorData(e.target.value)}/>
        </div>
      </div>
      {loading && !dados ? (
        <div className="p-20 text-center flex flex-col items-center text-slate-500 dark:text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
          <p>Calculando vendas...</p>
        </div>
      ) : dados && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-green-500 border border-slate-100 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Faturamento</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                R$ {dados.resumo.faturamentoTotal.toFixed(2)}
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-blue-500 border border-slate-100 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Pedidos</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                {dados.resumo.totalPedidos}
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-orange-500 border border-slate-100 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ticket Médio</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                R$ {dados.resumo.ticketMedio.toFixed(2)}
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                📊 Gráfico de Vendas
                {dataEspecifica && <span className="text-sm font-normal text-slate-500">({new Date(dataEspecifica + 'T00:00:00').toLocaleDateString('pt-BR')})</span>}
              </h3>
              {dados.grafico.length > 0 ? (
                <div className="flex items-end gap-3 h-64 w-full overflow-x-auto pb-2 px-2">
                  {dados.grafico.map((item, index) => {
                    let altura = 0;
                    if (maiorVenda > 0) {
                        altura = Math.round((item.valor / maiorVenda) * 100);
                    }
                    if (item.valor > 0 && altura < 5) altura = 5;
                    return (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1 min-w-[40px] group relative h-full justify-end">
                        <div className="absolute -top-10 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none shadow-lg mb-2">
                          R$ {item.valor.toFixed(2)}
                        </div>
                        <div
                          style={{ height: `${altura}%` }}
                          className={`
                            w-full rounded-t-md relative overflow-hidden transition-all duration-500 ease-out
                            ${item.valor > 0
                              ? 'bg-red-500 dark:bg-red-600 group-hover:bg-red-400 dark:group-hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' // Cor forte com brilho
                              : 'bg-slate-100 dark:bg-slate-800 h-[2px]'} // Se for zero, fica cinza baixinho`}>
                          {item.valor > 0 && <div className="absolute top-0 w-full bg-white/20 h-1"></div>}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {item.dia}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-3xl mb-2">📅</span>
                  <p>Sem dados para exibir.</p>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
                <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                  ⚠️ Estoque Crítico
                </h3>
                {dados.estoqueBaixo.length > 0 ? (
                  <ul className="space-y-3">
                    {dados.estoqueBaixo.map(prod => (
                      <li key={prod.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{prod.nome}</span>
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded">
                          {prod.estoque} un
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600 dark:text-green-400">Nenhum produto em falta! 🎉</p>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/produtos" className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Gerenciar Estoque →
                  </Link>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm max-h-[400px] overflow-y-auto border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">
                  📝 Histórico ({dados.listaPedidos.length})
                </h3>
                <div className="space-y-3">
                  {dados.listaPedidos.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{p.nomeCliente}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(p.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400 text-sm">
                        R$ {p.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {dados.listaPedidos.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhum pedido encontrado.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}