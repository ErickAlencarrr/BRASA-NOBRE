'use client';

import { createUser } from '../../lib/actions';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
      {pending ? 'Criando...' : 'Criar Usuário'}
    </button>
  );
}

export default function CreateUserForm() {
  const [message, setMessage] = useState('');

  async function clientAction(formData: FormData) {
    const result = await createUser(formData);
    if (result?.message) {
      setMessage(result.message);
    } else {
        setMessage('Usuário criado com sucesso!');
        // Reset form or close modal logic here
        // For simplicity, just clearing message after timeout or keeping success message
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-md">
      <h2 className="text-lg font-bold mb-4">Novo Usuário</h2>
      <form action={clientAction} className="flex flex-col gap-4">
        <input name="name" placeholder="Nome" required className="border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" required className="border p-2 rounded" />
        <input name="password" type="password" placeholder="Senha" required minLength={6} className="border p-2 rounded" />
        <select name="role" className="border p-2 rounded">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        <SubmitButton />
        {message && <p className="text-sm text-center mt-2">{message}</p>}
      </form>
    </div>
  );
}
