'use client';

import { useState, useEffect } from 'react';
import { updateOrderItemStatus } from '../lib/actions';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface KitchenItem {
  id: number;
  quantidade: number;
  observacao?: string;
  status: string; // PENDENTE, PREPARANDO, PRONTO
  product: { nome: string };
  order: {
    numMesa: number;
    nomeCliente: string;
    createdAt: string;
  };
}

export default function KitchenManager({ role }: { role?: string }) {
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const canEdit = role === 'ADMIN' || role === 'COZINHA';

  // Poll for updates every 5 seconds
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/cozinha', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos da cozinha');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    const interval = setInterval(fetchItems, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleStatusChange(id: number, currentStatus: string) {
    if (!canEdit) return;

    let nextStatus = '';
    if (currentStatus === 'PENDENTE') nextStatus = 'PREPARANDO';
    else if (currentStatus === 'PREPARANDO') nextStatus = 'PRONTO';
    else if (currentStatus === 'PRONTO') nextStatus = 'ENTREGUE'; 

    if (!nextStatus) return;

    const toastId = toast.loading('Atualizando...');
    try {
      const result = await updateOrderItemStatus(id, nextStatus);
      if (result?.error) throw new Error(result.error);
      
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item).filter(item => item.status !== 'ENTREGUE'));
      
      toast.dismiss(toastId);
      toast.success(`Status alterado para ${nextStatus}!`);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao atualizar status.');
    }
  }

  if (loading) return <div className="p-8 font-bold text-white text-center bg-slate-900 min-h-screen">Carregando Cozinha...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 text-white font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-700 pb-4 gap-4">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
            🔥 Cozinha <span className="text-red-500">Brasa Nobre</span>
            </h1>
            <Link href="/" className="text-slate-400 text-sm hover:text-white transition">← Voltar</Link>
        </div>
        
        <div className="flex gap-4 text-sm font-bold flex-wrap justify-center">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500"></span> Pendente</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></span> Preparando</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span> Pronto</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-500">
            <p className="text-2xl font-bold">Tudo limpo! 🎉</p>
            <p>Nenhum pedido pendente.</p>
          </div>
        ) : items.map((item) => (
          <div 
            key={item.id} 
            className={`
              relative p-4 rounded-xl shadow-lg border-l-8 transition-all duration-300
              ${item.status === 'PENDENTE' ? 'bg-slate-800 border-slate-500' : ''}
              ${item.status === 'PREPARANDO' ? 'bg-yellow-900/20 border-yellow-500' : ''}
              ${item.status === 'PRONTO' ? 'bg-green-900/20 border-green-500 scale-[1.02]' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-xl bg-slate-700 px-2 py-1 rounded text-white">Mesa {item.order.numMesa}</span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(item.order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{item.quantidade}x</span>
                <h3 className="text-xl font-bold text-white leading-tight">{item.product.nome}</h3>
              </div>
              {item.observacao && (
                <div className="mt-2 bg-red-900/30 text-red-300 p-2 rounded border border-red-900/50 text-sm font-bold">
                  ⚠️ {item.observacao}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold">{item.order.nomeCliente}</p>
            </div>

            {canEdit ? (
                <button
                onClick={() => handleStatusChange(item.id, item.status)}
                className={`
                    w-full py-3 rounded-lg font-bold text-white shadow-md transition-all active:scale-95
                    ${item.status === 'PENDENTE' ? 'bg-slate-600 hover:bg-slate-500' : ''}
                    ${item.status === 'PREPARANDO' ? 'bg-yellow-600 hover:bg-yellow-500' : ''}
                    ${item.status === 'PRONTO' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/50 animate-bounce-slow' : ''}
                `}
                >
                {item.status === 'PENDENTE' && '🍳 Iniciar Preparo'}
                {item.status === 'PREPARANDO' && '✅ Marcar Pronto'}
                {item.status === 'PRONTO' && '🚀 Entregar'}
                </button>
            ) : (
                <div className="text-center text-xs font-bold text-slate-500 uppercase bg-slate-900/50 py-2 rounded">
                    Somente Visualização
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
