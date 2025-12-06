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

  // Estados para o Modal de Abrir Mesa
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
    <main className="min-h-screen bg-slate-100 p-6 md:p-8">
      
      {/* --- MODAL DE ABRIR MESA --- */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Abrir Mesa {mesaSelecionada}</h2>
            <p className="text-slate-500 mb-6">Quem é o cliente?</p>
            
            <form onSubmit={confirmarAbrirMesa}>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Cliente</label>
              <input 
                autoFocus
                type="text" 
                className="w-full border-2 border-slate-300 p-3 rounded-lg text-lg text-slate-900 focus:border-red-600 outline-none mb-6"
                placeholder="Ex: João Silva"
                value={nomeCliente}
                onChange={e => setNomeCliente(e.target.value)}
              />
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition"
                >
                  Abrir Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CABEÇALHO DA MARCA (BRASA NOBRE) --- */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-lg border-b-4 border-red-600">
        
        {/* Logo e Nome */}
        <div className="flex items-center gap-5 mb-4 md:mb-0">
          
          {/* --- CÍRCULO DA LOGO (ATUALIZADO PARA IMAGEM) --- */}
          {/* Mudei o fundo para branco e adicionei a tag <img> */}
          <div className="bg-black w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-black ring-2 ring-red-100 overflow-hidden p-1">
            <img 
              src="/logo.png"  // <--- Certifique-se que o arquivo 'logo.png' está na pasta 'public'
              alt="Logo Brasa Nobre" 
              className="w-full h-full object-contain" 
            />
          </div>
          
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
              Brasa Nobre
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 tracking-wide">
              ESPETARIA
            </p>
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex gap-3 w-full md:w-auto">
          <Link 
            href="/admin" 
            className="flex-1 md:flex-none text-center bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition font-bold shadow-md flex items-center justify-center gap-2"
          >
            📊 <span className="hidden md:inline">Relatórios</span>
          </Link>
          <Link 
            href="/produtos" 
            className="flex-1 md:flex-none text-center bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition font-bold shadow-md shadow-orange-100 flex items-center justify-center gap-2"
          >
            🥩 <span className="hidden md:inline">Produtos</span>
          </Link>
        </div>
      </header>

      {/* --- GRID DE MESAS --- */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-700">Mapa do Salão</h2>
        
        {/* --- LEGENDA (COR ATUALIZADA) --- */}
        {/* Adicionei 'text-slate-700' aqui para escurecer o texto */}
        <div className="flex gap-4 text-sm font-medium text-slate-700">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Livre</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Ocupada</div>
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
                    ? 'bg-white border-red-500 shadow-red-100 hover:shadow-red-200 hover:-translate-y-1' 
                    : 'bg-white border-green-400 shadow-green-100 hover:shadow-green-200 hover:-translate-y-1 hover:bg-green-50'}
                `}
              >
                {/* Número da Mesa */}
                <span className={`text-4xl font-black mb-2 ${ocupada ? 'text-red-600' : 'text-green-600'}`}>
                  {numMesa}
                </span>
                
                {/* Status */}
                {ocupada ? (
                  <div className="text-center w-full px-3 absolute bottom-3">
                    <div className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full truncate mb-1">
                      {pedido?.nomeCliente}
                    </div>
                    <p className="text-sm font-bold text-slate-700">R$ {pedido?.total?.toFixed(2)}</p>
                  </div>
                ) : (
                  <div className="absolute bottom-4">
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full group-hover:bg-green-200 transition">
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