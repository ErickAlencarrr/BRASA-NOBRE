    'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

    interface DashboardData {
    faturamento: number
    totalPedidos: number
    ticketMedio: number
    ranking: { nome: string; qtd: number }[]
    estoqueBaixo: { id: number; nome: string; estoque: number }[]
    ultimosPedidos: { 
        id: number; 
        nomeCliente: string; 
        total: number; 
        updatedAt: string 
    }[]
    }

    export default function Dashboard() {
    const [dados, setDados] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        carregarDashboard()
    }, [])

    async function carregarDashboard() {
        try {
        const res = await fetch('/api/admin', { cache: 'no-store' })
        const data = await res.json()
        setDados(data)
        setLoading(false)
        } catch (error) {
        console.error("Erro ao carregar dashboard")
        }
    }

    if (loading) return <div className="p-8 text-slate-800 font-bold">Gerando relatórios...</div>
    if (!dados) return <div className="p-8 text-slate-800">Erro ao carregar dados.</div>

    return (
        <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-3xl font-bold text-slate-800">Painel Financeiro</h1>
            <p className="text-slate-500">Visão geral do negócio</p>
            </div>
            <Link href="/" className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 font-medium">
            Voltar para Mesas
            </Link>
        </div>

        {/* CARDS DE RESUMO (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Faturamento */}
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-sm text-slate-500 uppercase font-bold">Faturamento Total</p>
            <p className="text-3xl font-bold text-green-600">R$ {dados.faturamento.toFixed(2)}</p>
            </div>

            {/* Vendas Realizadas */}
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-sm text-slate-500 uppercase font-bold">Pedidos Fechados</p>
            <p className="text-3xl font-bold text-slate-800">{dados.totalPedidos}</p>
            </div>

            {/* Ticket Médio */}
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <p className="text-sm text-slate-500 uppercase font-bold">Ticket Médio</p>
            <p className="text-3xl font-bold text-purple-600">R$ {dados.ticketMedio.toFixed(2)}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUNA 1: ALERTA DE ESTOQUE + TOP VENDAS */}
            <div className="space-y-6">
            
            {/* Alerta de Estoque */}
            {dados.estoqueBaixo.length > 0 && (
                <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
                <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center">
                    ⚠️ Alerta de Estoque Baixo
                </h2>
                <ul className="space-y-2">
                    {dados.estoqueBaixo.map(prod => (
                    <li key={prod.id} className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                        <span className="font-medium text-slate-700">{prod.nome}</span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                        Restam: {prod.estoque}
                        </span>
                    </li>
                    ))}
                </ul>
                </div>
            )}

            {/* Ranking de Produtos */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold text-slate-700 mb-4">🏆 Top 5 Mais Vendidos</h2>
                <div className="space-y-3">
                {dados.ranking.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400 text-lg">#{index + 1}</span>
                        <span className="font-medium text-slate-700">{item.nome}</span>
                    </div>
                    <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(item.qtd / Math.max(...dados.ranking.map(r => r.qtd))) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 ml-2">{item.qtd} un.</span>
                    </div>
                ))}
                {dados.ranking.length === 0 && <p className="text-slate-400">Nenhuma venda ainda.</p>}
                </div>
            </div>

            </div>

            {/* COLUNA 2: HISTÓRICO RECENTE */}
            <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h2 className="text-lg font-bold text-slate-700 mb-4">🕒 Últimas Vendas</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-200">
                    <th className="pb-2 text-sm text-slate-500">Cliente/Mesa</th>
                    <th className="pb-2 text-sm text-slate-500">Data</th>
                    <th className="pb-2 text-sm text-slate-500 text-right">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {dados.ultimosPedidos.map(pedido => (
                    <tr key={pedido.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-3 font-medium text-slate-700">
                        {pedido.nomeCliente || 'Balcão'}
                        </td>
                        <td className="py-3 text-sm text-slate-500">
                        {new Date(pedido.updatedAt).toLocaleDateString('pt-BR')} 
                        {' '} 
                        {new Date(pedido.updatedAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="py-3 font-bold text-green-600 text-right">
                        R$ {pedido.total.toFixed(2)}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {dados.ultimosPedidos.length === 0 && (
                <div className="text-center py-10 text-slate-400">Nenhum pedido fechado ainda.</div>
                )}
            </div>
            </div>

        </div>
        </div>
    )
    }