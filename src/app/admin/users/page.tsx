import { prisma } from '../../../../lib/prisma';
import CreateUserForm from './create-user-form';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Gerenciar <span className="text-red-600">Equipe</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Controle de acesso e permissões do sistema.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition flex items-center gap-2"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Criação (Lateral em Desktop, Topo em Mobile) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 p-1.5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </span>
                Novo Usuário
              </h2>
              <CreateUserForm />
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white px-2">
              Usuários Cadastrados ({users.length})
            </h2>
            
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-red-200 dark:hover:border-red-900/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 dark:text-slate-500 uppercase">
                      {user.name?.[0] || user.email[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{user.name || 'Sem nome'}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  Nenhum usuário encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
