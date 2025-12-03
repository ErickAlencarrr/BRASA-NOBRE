'use client'

import { useEffect, useState } from 'react'

interface Product{
    id: number
    nome: string
    preco: number
    estoque: number
    categoria: string
}

export default function GerenciarProdutos(){
    const [produtos, setProdutos] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    const[form, setForm]= useState({
        nome:'',
        preco:'',
        estoque:'',
        categoria: 'espetinho'
    })

    useEffect(()=>{
        carregarProdutos()
    },[])

    async function carregarProdutos() {
        try{
            const resposta = await fetch('/api/produtos')
            const dados = await resposta.json()
            setProdutos(dados)
            setLoading(false)
        } catch(erro){
            console.error("erro ao buscar", erro)
        }
    }

    async function handleSubmit(e:React.FormEvent) {
        e.preventDefault()

        if (!form.nome || !form.preco) return alert("Preencha nome e preço")

            try {
                const resposta = await fetch('/api/produtos',{
                    method: 'POST',
                    headers: { 'Content-Type':'application/json'},
                    body: JSON.stringify(form)
                })
                    if (resposta.ok) {
                        alert("Produto cadastrado com sucesso!")
                        carregarProdutos()
                        setForm({ nome: '', preco: '', estoque: '', categoria: 'espetinho' })
                        }
            } catch (erro) {alert("Erro ao salvar produto")}
    }
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Gerenciar Cardápio</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">Novo Item</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Nome do Produto</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500 text-slate-800"
                                placeholder="Ex: Espetinho de Picanha"
                                value={form.nome}
                                onChange={e => setForm({...form, nome: e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Preço (R$)</label>
                                <input
                                type="number"
                                step="0.01"
                                className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500 text-slate-800"
                                placeholder="0.00"
                                value={form.preco}
                                onChange={e => setForm({...form, preco: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Estoque Atual</label>
                                <input
                                type="number"
                                className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500 text-slate-800"
                                placeholder="0"
                                value={form.estoque}
                                onChange={e => setForm({...form, estoque: e.target.value})}/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Categoria</label>
                            <select 
                                className="w-full border p-2 rounded mt-1 bg-white text-slate-800"
                                value={form.categoria}
                                onChange={e => setForm({...form, categoria: e.target.value})}>
                                <option value="espetinho">Espetinho</option>
                                <option value="bebida">Bebida</option>
                                <option value="jantinha">Jantinha</option>
                                <option value="porcao">Porção</option>
                            </select>
                        </div>
                        <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-bold">Cadastrar Produto</button>
                    </form>
                </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-slate-700">Itens Cadastrados</h2>
                        {loading ? (<p>Carregando...</p> ) : (
                            <div className="space-y-3 h-[500px] overflow-y-auto">
                                {produtos.map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded shadow flex justify-between items-center border-l-4 border-blue-500">
                                    <div>
                                        <p className="font-bold text-slate-800">{item.nome}</p>
                                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full uppercase">{item.categoria}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-600 font-bold">R$ {item.preco.toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">Estoque: {item.estoque}</p>
                                    </div>
                                    </div>
                                ))}
                                
                                {produtos.length === 0 && (
                                    <p className="text-slate-500 text-center mt-10">Nenhum produto cadastrado ainda.</p>
                                )}
                            </div>
                        )}
                    </div>
                    </div>
            </div>
        </div>
    )
}