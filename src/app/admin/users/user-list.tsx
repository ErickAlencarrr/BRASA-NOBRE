'use client';

import { useState } from 'react';
import { deleteUser, updateUser } from '../../lib/actions';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

export default function UserList({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    const toastId = toast.loading('Excluindo...');
    try {
      await deleteUser(id);
      toast.dismiss(toastId);
      toast.success('Usuário excluído!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao excluir.');
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingUser) return;
    const toastId = toast.loading('Atualizando...');
    const result = await updateUser(editingUser.id, formData);
    if (result.success) {
      toast.dismiss(toastId);
      toast.success(result.message);
      setEditingUser(null);
    } else {
      toast.dismiss(toastId);
      toast.error(result.error || 'Erro ao atualizar.');
    }
  }

  return (
    <>
      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between group hover:border-red-200 dark:hover:border-red-900/50 transition-all gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0">
                {user.name?.[0] || user.email[0]}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{user.name || 'Sem nome'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                user.role === 'ADMIN' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {user.role}
              </span>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => setEditingUser(user)}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Editar Usuário</h2>
            <form action={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                <input 
                  name="name" 
                  defaultValue={editingUser.name || ''} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input 
                  name="email" 
                  defaultValue={editingUser.email} 
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nova Senha (Opcional)</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Deixe em branco para manter"
                  minLength={6}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Função</label>
                <select 
                  name="role" 
                  defaultValue={editingUser.role}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
