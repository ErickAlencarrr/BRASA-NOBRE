'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

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
  const [modalAberto, setModalAberto] = useState(false)
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null)
  const [nomeCliente, setNomeCliente] = useState('')

  const mesas = Array.from({ length: 15 }, (_, i) => i + 1)

  useEffect(() => {
    carregarPedidos()
  }, [])

  async function carregarPedidos() {
    try {
      const res = await fetch('/api/pedidos', { cache: 'no-store' })
      if (!res.ok) throw new Error('Erro na API')
      const dados = await res.json()
      setPedidosAbertos(dados)
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao carregar mapa de mesas")
    } finally {
      setLoading(false)
    }
  }

  function iniciarAberturaMesa(numMesa: number) {
    setMesaSelecionada(numMesa)
    setNomeCliente('')
    setModalAberto(true)
  }

  async function confirmarAbrirMesa(e: React.FormEvent) {
    e.preventDefault()
    if (!mesaSelecionada) return
    const nomeFinal = nomeCliente.trim() || 'Cliente Balcão'
    const toastId = toast.loading('Abrindo mesa...')

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numMesa: mesaSelecionada, nomeCliente: nomeFinal })
      })

      if (res.ok) {
        toast.dismiss(toastId)
        toast.success(`Mesa ${mesaSelecionada} aberta!`)
        setModalAberto(false)
        carregarPedidos()
        router.push(`/mesa/${mesaSelecionada}`)
      } else {
        toast.dismiss(toastId)
        toast.error("Essa mesa já está ocupada!")
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro de conexão")
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-8 transition-colors duration-300">
      
      {/* MODAL (Adaptado para Escuro) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Abrir Mesa {mesaSelecionada}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Quem é o cliente?</p>
            
            <form onSubmit={confirmarAbrirMesa}>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome do Cliente</label>
              <input 
                autoFocus
                type="text" 
                className="w-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-lg text-lg focus:border-red-600 outline-none mb-6"
                placeholder="Ex: João Silva"
                value={nomeCliente}
                onChange={e => setNomeCliente(e.target.value)}
              />
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200/50 transition">
                  Abrir Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border-b-4 border-red-600 transition-colors">
        
        <div className="flex items-center gap-5 mb-4 md:mb-0">
          <div className="bg-white dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-700 ring-2 ring-red-100 dark:ring-red-900 overflow-hidden p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
              Brasa Nobre
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1 tracking-wide">
              ESPETINHOS & JANTINHAS
            </p>
          </div>
        </div>
        
        {/* BOTÕES DE AÇÃO (Sem o botão de tema) */}
        <div className="flex gap-3 w-full md:w-auto items-center">
          
          <Link href="/admin" className="flex-1 md:flex-none text-center bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition font-bold shadow-md flex items-center justify-center gap-2">
            📊 <span className="hidden md:inline">Relatórios</span>
          </Link>
          <Link href="/produtos" className="flex-1 md:flex-none text-center bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition font-bold shadow-md shadow-orange-100/50 flex items-center justify-center gap-2">
            🥩 <span className="hidden md:inline">Produtos</span>
          </Link>
        </div>
      </header>

      {/* MAPA */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Mapa do Salão</h2>
        <div className="flex gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span> Livre</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> Ocupada</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
          <p>Carregando mesas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mesas.map((numMesa) => {
            const pedido = pedidosAbertos.find(p => p.numMesa === numMesa)
            const ocupada = !!pedido

            return (
              <div 
                key={numMesa}
                onClick={() => !ocupada ? iniciarAberturaMesa(numMesa) : router.push(`/mesa/${numMesa}`)}
                className={`
                  relative h-36 rounded-2xl shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 group
                  ${ocupada 
                    ? 'bg-white dark:bg-slate-800 border-red-500 shadow-red-100 dark:shadow-none hover:shadow-red-200 hover:-translate-y-1' 
                    : 'bg-white dark:bg-slate-800 border-green-400 shadow-green-100 dark:shadow-none hover:shadow-green-200 hover:-translate-y-1 hover:bg-green-50 dark:hover:bg-slate-700'}
                `}
              >
                <span className={`text-4xl font-black mb-2 ${ocupada ? 'text-red-600' : 'text-green-600'}`}>
                  {numMesa}
                </span>
                
                {ocupada ? (
                  <div className="text-center w-full px-3 absolute bottom-3">
                    <div className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-bold px-2 py-1 rounded-full truncate mb-1">
                      {pedido?.nomeCliente}
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">R$ {pedido?.total?.toFixed(2)}</p>
                  </div>
                ) : (
                  <div className="absolute bottom-4">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full group-hover:bg-green-200 transition">
                      LIVRE
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}