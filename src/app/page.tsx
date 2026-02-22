import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import { auth, signOut } from '../auth';
import { redirect } from 'next/navigation';
import TablesGrid from './tables-grid';

// Força renderização dinâmica para buscar dados atualizados
export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  
  // Proteção extra (além do middleware)
  if (!session?.user) {
    redirect('/login');
  }

  // Busca pedidos abertos diretamente do banco (Server Component)
  const pedidosAbertos = await prisma.order.findMany({
    where: { status: 'ABERTO' },
    select: {
      id: true,
      numMesa: true,
      nomeCliente: true,
      total: true,
    }
  });

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-8 transition-colors duration-300">
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
              Olá, <span className="text-red-600">{session.user.name || 'Usuario'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-center">
          {session.user.role === 'ADMIN' && (
             <Link href="/admin" className="flex-1 md:flex-none text-center bg-slate-800 dark:bg-slate-700 text-white px-4 py-3 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition font-bold shadow-md flex items-center justify-center gap-2">
               📊 <span className="hidden md:inline">Admin</span>
             </Link>
          )}
          
          <Link href="/produtos" className="flex-1 md:flex-none text-center bg-orange-600 text-white px-4 py-3 rounded-xl hover:bg-orange-700 transition font-bold shadow-md shadow-orange-100/50 flex items-center justify-center gap-2">
            🥩 <span className="hidden md:inline">Produtos</span>
          </Link>

          <form action={async () => {
            'use server';
            await signOut();
          }}>
            <button className="flex-1 md:flex-none bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-4 py-3 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition font-bold flex items-center justify-center gap-2">
               🚪 <span className="hidden md:inline">Sair</span>
            </button>
          </form>
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Mapa do Salão</h2>
        <div className="flex gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span> Livre</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> Ocupada</div>
        </div>
      </div>

      <TablesGrid initialPedidos={pedidosAbertos} />
    </main>
  );
}
