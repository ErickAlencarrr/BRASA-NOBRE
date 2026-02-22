'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Pedido {
  id?: number;
  numMesa: number;
  nomeCliente: string | null;
  total: number;
}

export default function TablesGrid({ initialPedidos }: { initialPedidos: any[] }) {
  const router = useRouter();
  const [pedidosAbertos, setPedidosAbertos] = useState<Pedido[]>(initialPedidos || []);
  const [modalAberto, setModalAberto] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [nomeCliente, setNomeCliente] = useState('');

  const mesas = Array.from({ length: 15 }, (_, i) => i + 1);

  // Poll for updates every 10 seconds to keep tables fresh
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/pedidos', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            setPedidosAbertos(data);
        }
      } catch (e) {
        console.error("Erro ao atualizar mesas");
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  function iniciarAberturaMesa(numMesa: number) {
    setMesaSelecionada(numMesa);
    setNomeCliente('');
    setModalAberto(true);
  }

  async function confirmarAbrirMesa(e: React.FormEvent) {
    e.preventDefault();
    if (!mesaSelecionada) return;
    const nomeFinal = nomeCliente.trim() || 'Cliente Balcão';
    const toastId = toast.loading('Abrindo mesa...');

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numMesa: mesaSelecionada, nomeCliente: nomeFinal })
      });

      if (res.ok) {
        toast.dismiss(toastId);
        toast.success(`Mesa ${mesaSelecionada} aberta!`);
        setModalAberto(false);
        router.refresh(); // Refresh server data
        router.push(`/mesa/${mesaSelecionada}`);
      } else {
        toast.dismiss(toastId);
        const err = await res.json();
        toast.error(err.error || "Essa mesa já está ocupada!");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Erro de conexão");
    }
  }

  return (
    <>
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
                onChange={e => setNomeCliente(e.target.value)}/>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition">
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map((numMesa) => {
          const pedido = pedidosAbertos.find(p => p.numMesa === numMesa);
          const ocupada = !!pedido;
          return (
            <div
              key={numMesa}
              onClick={() => !ocupada ? iniciarAberturaMesa(numMesa) : router.push(`/mesa/${numMesa}`)}
              className={`
                relative h-36 rounded-2xl shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 group
                ${ocupada
                  ? 'bg-white dark:bg-slate-800 border-red-500 shadow-red-100 dark:shadow-none hover:shadow-red-200 hover:-translate-y-1'
                  : 'bg-white dark:bg-slate-800 border-green-400 shadow-green-100 dark:shadow-none hover:shadow-green-200 hover:-translate-y-1 hover:bg-green-50 dark:hover:bg-slate-700'}`}>
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
          );
        })}
      </div>
    </>
  );
}
