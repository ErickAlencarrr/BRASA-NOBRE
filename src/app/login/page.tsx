'use client';

import { useActionState } from 'react';
import { authenticate } from '../lib/actions';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-black p-8 shadow-2xl border border-slate-800">
        
        {/* Logo e Cabeçalho */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-2xl shadow-lg bg-black p-2 border border-slate-800">
            <Image
              src="/logo.png"
              alt="Logo Brasa Nobre"
              width={96}
              height={96}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
            Brasa <span className="text-red-600">Nobre</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Acesso Restrito ao Sistema
          </p>
        </div>

        {/* Formulário */}
        <form action={dispatch} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-400" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 transition-colors focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-400" htmlFor="password">
              Senha
            </label>
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 transition-colors focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <LoginButton />
          
          <div className="mt-4 flex h-8 items-end justify-center space-x-1" aria-live="polite" aria-atomic="true">
            {errorMessage && (
              <p className="text-sm font-medium text-red-600 bg-red-100 dark:text-red-500 dark:bg-red-950/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/50">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>
        </form>
        
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 text-center">
           <p className="text-xs text-slate-500 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Brasa Nobre. Todos os direitos reservados.
           </p>
        </div>
      </div>
    </main>
  );
}

function LoginButton() {
  return (
    <ButtonContent />
  );
}

function ButtonContent() {
  const { pending } = useFormStatus();
  return (
    <button 
      className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-red-900/20 active:scale-[0.98] disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-slate-200 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Entrando...
        </span>
      ) : (
        'ACESSAR SISTEMA'
      )}
    </button>
  );
}
