'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Pedido {
  id: number
  numMesa: number
  nomeCliente: string
  total: number
}

export default function Home() {
  const router = useRouter()
  const [pedidosAbertos, setPedidosAbertos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  const mesas = Array.from({ length: 15 }, (_, i) => i + 1)

  useEffect(() => {
    carregarPedidos()
  }, [])

  async function carregarPedidos() {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' })
      
      if (!res.ok) {
        throw new Error('Erro na API')
      }
      
      const dados = await res.json()
      setPedidosAbertos(dados)
    } catch (error) {
      console.error("Erro ao carregar mesas:", error)
    } finally {
      setLoading(false)
    }
  }

  async function abrirMesa(numMesa: number) {
    const nome = prompt(`Nome do cliente para a Mesa ${numMesa}?`)
    if (nome === null) return;

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numMesa, nomeCliente: nome || 'Cliente Balcão' })
      })

      if (res.ok) {
        carregarPedidos()
      } else {
        alert("Erro: Mesa já ocupada ou erro no sistema.")
      }
    } catch (error) {
      alert("Erro de conexão ao abrir mesa.")
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">BRASA NOBRE</h1>
          <p className="text-slate-500">Controle de Mesas e Pedidos</p>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href="/admin" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium shadow-sm"
          >
            📊 Relatórios
          </Link>

          <Link 
            href="/produtos" 
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition font-medium shadow-sm"
          >
            Gerenciar Produtos
          </Link>
        </div>
      </header>
      {loading ? (
        <div className="text-center py-10">
          <p className="text-xl text-slate-600 animate-pulse">Carregando mapa de mesas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mesas.map((numMesa) => {
            const pedido = pedidosAbertos.find(p => p.numMesa === numMesa)
            const ocupada = !!pedido

            return (
              <div
                key={numMesa}
                onClick={() => !ocupada ? abrirMesa(numMesa) : router.push(`/mesa/${numMesa}`)}
                className={`
                  h-32 rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105 border-2
                  ${ocupada? 'bg-red-50 border-red-200 text-red-600':'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}>
                <span className="text-3xl font-bold mb-1">Mesa {numMesa}</span>
                {ocupada ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold bg-red-200 px-2 py-0.5 rounded-full text-red-800 mb-1">{pedido?.nomeCliente}</p>
                    <p className="text-xs font-bold">R$ {pedido?.total?.toFixed(2) || '0.00'}</p>
                  </div>
                ) : (
                  <p className="text-xs font-medium opacity-70 bg-green-200 px-2 py-1 rounded-full">LIVRE</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}