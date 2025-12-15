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
  const [periodoAtivo, setPeriodoAtivo] = useState<'hoje' | '7dias' | 'mes'>('hoje')

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
      inicio.setDate(1) // Dia 1 do mês atual
    }
    
    return { 
      inicio: inicio.toISOString(), 
      fim: fim.toISOString() 
    }
  }

  async function carregarRelatorio(periodo: 'hoje' | '7dias' | 'mes') {
    setLoading(true)
    setPeriodoAtivo(periodo)
    
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

  if (loading && !dados) return <div className="p-8 text-center text-slate-500">Carregando inteligência...</div>

  // Cálculo para altura das barras do gráfico (Normalização)
  const maiorVenda = dados?.grafico.reduce((max, item) => Math.max(max, item.valor), 0) || 1

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 transition-colors">
      
      {/* CABEÇALHO E VOLTAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase">
            Financeiro <span className="text-red-600">Brasa Nobre</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Visão geral de desempenho</p>
        </div>
        <Link 
          href="/" 
          className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
        >
          ← Voltar para Mapa
        </Link>
      </div>

      {/* FILTROS DE DATA */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm mb-6 inline-flex gap-2">
        <button 
          onClick={() => carregarRelatorio('hoje')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${periodoAtivo === 'hoje' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Hoje
        </button>
        <button 
          onClick={() => carregarRelatorio('7dias')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${periodoAtivo === '7dias' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Últimos 7 Dias
        </button>
        <button 
          onClick={() => carregarRelatorio('mes')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${periodoAtivo === 'mes' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Este Mês
        </button>
      </div>

      {dados && (
        <>
          {/* CARDS DE KPI (Resumo) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Faturamento</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                R$ {dados.resumo.faturamentoTotal.toFixed(2)}
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Pedidos</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                {dados.resumo.totalPedidos}
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ticket Médio</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                R$ {dados.resumo.ticketMedio.toFixed(2)}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRÁFICO DE VENDAS (COLUNA MAIOR) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                📊 Desempenho no Período
              </h3>
              
              {dados.grafico.length > 0 ? (
                <div className="flex items-end gap-2 h-64 w-full overflow-x-auto pb-2">
                  {dados.grafico.map((item, index) => {
                    // Calcula altura proporcional (max 100%)
                    const altura = Math.round((item.valor / maiorVenda) * 100);
                    return (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1 min-w-[40px] group relative">
                        {/* Tooltip de valor ao passar o mouse */}
                        <div className="absolute -top-10 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                          R$ {item.valor.toFixed(2)}
                        </div>
                        
                        {/* A Barra */}
                        <div 
                          style={{ height: `${altura}%` }} 
                          className="w-full bg-red-100 dark:bg-red-900/30 rounded-t-md relative overflow-hidden group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-all"
                        >
                          <div className="absolute bottom-0 w-full bg-red-500 h-1"></div>
                        </div>
                        
                        {/* A Data */}
                        <span className="text-[10px] font-bold text-slate-400">{item.dia}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  Sem vendas neste período.
                </div>
              )}
            </div>

            {/* ALERTA DE ESTOQUE E LISTA RÁPIDA */}
            <div className="space-y-6">
              
              {/* Estoque Baixo */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
                <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                  ⚠️ Estoque Crítico
                </h3>
                {dados.estoqueBaixo.length > 0 ? (
                  <ul className="space-y-3">
                    {dados.estoqueBaixo.map(prod => (
                      <li key={prod.id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{prod.nome}</span>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                          {prod.estoque} un
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600">Nenhum produto em falta! 🎉</p>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href="/produtos" className="text-sm text-blue-600 font-bold hover:underline">
                    Gerenciar Estoque →
                  </Link>
                </div>
              </div>

              {/* Últimos Pedidos (Mini Lista) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm max-h-[400px] overflow-y-auto">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">
                  📝 Pedidos do Período
                </h3>
                <div className="space-y-3">
                  {dados.listaPedidos.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{p.nomeCliente}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(p.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <span className="font-bold text-green-600 text-sm">
                        R$ {p.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {dados.listaPedidos.length === 0 && (
                    <p className="text-xs text-slate-400 text-center">Nenhum pedido encontrado.</p>
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