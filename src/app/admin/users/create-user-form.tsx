'use client';

import { createUser } from '../../lib/actions';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-700 transition active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
    >
      {pending ? 'Criando...' : 'Adicionar Usuário'}
    </button>
  );
}

export default function CreateUserForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  async function clientAction(formData: FormData) {
    setMessage('');
    setError(false);
    
    const result = await createUser(formData);
    
    if (result?.message) {
      setMessage(result.message);
      if (result.errors || result.message.includes('Error')) {
        setError(true);
      }
    } else {
        setMessage('Usuário criado com sucesso!');
        // Reset form manually? HTMLFormElement.reset() isn't directly accessible here unless we use a ref.
        // For simplicity, just show success. Ideally, we'd clear the inputs.
        const form = document.querySelector('form') as HTMLFormElement;
        if(form) form.reset();
    }
  }

  return (
    <form action={clientAction} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
        <input 
          name="name" 
          placeholder="Ex: João Silva" 
          required 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
        />
      </div>
      
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
        <input 
          name="email" 
          type="email" 
          placeholder="joao@brasanobre.com" 
          required 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
        <input 
          name="password" 
          type="password" 
          placeholder="Mínimo 6 caracteres" 
          required 
          minLength={6} 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Função</label>
        <select 
          name="role" 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition appearance-none"
        >
          <option value="STAFF">Staff (Apenas Mesas)</option>
          <option value="ADMIN">Admin (Acesso Total)</option>
        </select>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium text-center ${error ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
          {message}
        </div>
      )}
    </form>
  );
}
