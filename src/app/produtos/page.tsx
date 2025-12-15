'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Product {
  id: number
  nome: string
  preco: number
  precoCusto: number
  estoque: number
  controlarEstoque: boolean
  categoria: string
  fornecedor: string
  ativo: boolean
}

export default function GerenciarProdutos() {
  const [produtos, setProdutos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const [termoBusca, setTermoBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const [form, setForm] = useState({
    nome: '',
    categoria: 'espetinho',
    precoCusto: '0,00',
    margemLucro: '50,0',
    precoVenda: '0,00',
    estoqueAtual: 0,
    controlarEstoque: true,
    adicionarEstoque: 0,
    fornecedor: '',
    ativo: true
  })

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    const res = await fetch('/api/produtos')
    const data = await res.json()
    setProdutos(data)
    setLoading(false)
  }

  function aplicarMascaraMoeda(valor: string) {
    const apenasNumeros = valor.replace(/\D/g, "")
    const numero = parseInt(apenasNumeros) / 100
    if (isNaN(numero)) return "0,00"
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function stringParaFloat(valor: string) {
    if (!valor) return 0
    return parseFloat(valor.replace(/\./g, '').replace(',', '.'))
  }

  function handleCustoChange(valorDigitado: string) {
    const valorFormatado = aplicarMascaraMoeda(valorDigitado)
    const custo = stringParaFloat(valorFormatado)
    const venda = stringParaFloat(form.precoVenda)
    const novaMargem = custo > 0 ? ((venda - custo) / custo) * 100 : 0
    setForm(prev => ({ ...prev, precoCusto: valorFormatado, margemLucro: novaMargem.toFixed(1).replace('.', ',') }))
  }

  function handleVendaChange(valorDigitado: string) {
    const valorFormatado = aplicarMascaraMoeda(valorDigitado)
    const venda = stringParaFloat(valorFormatado)
    const custo = stringParaFloat(form.precoCusto)
    const novaMargem = custo > 0 ? ((venda - custo) / custo) * 100 : 100
    setForm(prev => ({ ...prev, precoVenda: valorFormatado, margemLucro: novaMargem.toFixed(1).replace('.', ',') }))
  }

  function handleMargemChange(valor: string) {
    setForm(prev => ({ ...prev, margemLucro: valor }))
    const margem = parseFloat(valor.replace(',', '.'))
    if (!isNaN(margem)) {
      const custo = stringParaFloat(form.precoCusto)
      const novaVenda = custo + (custo * (margem / 100))
      setForm(prev => ({ ...prev, precoVenda: novaVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }))
    }
  }

  function abrirModal(produto?: Product) {
    if (produto) {
      setEditandoId(produto.id)
      const custo = produto.precoCusto
      const venda = produto.preco
      const margem = custo > 0 ? ((venda - custo) / custo) * 100 : 0
      
      setForm({
        nome: produto.nome,
        categoria: produto.categoria,
        precoCusto: custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        margemLucro: margem.toFixed(1).replace('.', ','),
        precoVenda: venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        estoqueAtual: produto.estoque,
        controlarEstoque: produto.controlarEstoque,
        adicionarEstoque: 0,
        fornecedor: produto.fornecedor || '',
        ativo: produto.ativo
      })
    } else {
      setEditandoId(null)
      setForm({
        nome: '', categoria: 'espetinho', precoCusto: '0,00', margemLucro: '50,0', precoVenda: '0,00',
        estoqueAtual: 0, controlarEstoque: true, adicionarEstoque: 0, fornecedor: '', ativo: true
      })
    }
    setModalAberto(true)
  }

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault()
    const toastId = toast.loading('Salvando...')
    
    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      preco: stringParaFloat(form.precoVenda),
      precoCusto: stringParaFloat(form.precoCusto),
      estoque: editandoId ? (form.estoqueAtual + Number(form.adicionarEstoque)) : Number(form.estoqueAtual),
      controlarEstoque: form.controlarEstoque,
      fornecedor: form.fornecedor,
      ativo: form.ativo
    }

    const url = editandoId ? `/api/produtos/${editandoId}` : '/api/produtos'
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.dismiss(toastId)
        toast.success("Salvo com sucesso!")
        setModalAberto(false)
        carregarProdutos()
      } else {
        toast.dismiss(toastId)
        toast.error("Erro ao salvar")
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro de conexão")
    }
  }

  const produtosFiltrados = produtos.filter(p => {
    const batemNome = p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    const bateCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
    return batemNome && bateCategoria
  })

  const categorias = ['todos', ...new Set(produtos.map(p => p.categoria))]

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-8 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* CABEÇALHO COM BOTÃO VOLTAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Gerenciar Estoque</h1>
           {/* BOTÃO VOLTAR AQUI EM BAIXO */}
           <Link 
             href="/" 
             className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
           >
             ⬅ Voltar para o Início
           </Link>
        </div>
        
        <button 
          onClick={() => abrirModal()} 
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200 dark:shadow-none w-full md:w-auto transition hover:scale-105"
        >
          + Novo Produto
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow mb-6 transition-colors border border-slate-200 dark:border-slate-800">
        <input 
          type="text"
          placeholder="🔍 Buscar por nome ou fornecedor..."
          className="w-full border border-slate-300 dark:border-slate-700 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 mb-4 transition-colors"
          value={termoBusca}
          onChange={e => setTermoBusca(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition
                ${categoriaFiltro === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MODAL (Todo adaptado para Dark Mode) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl p-6 h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
              {editandoId ? 'Editar Produto' : 'Cadastrar Produto'}
            </h2>
            
            <form onSubmit={salvarProduto} className="space-y-4">
              
              <div className="flex gap-4">
                <div className="w-1/3 md:w-1/4">
                  <label className="block text-sm font-bold mb-1 dark:text-slate-300">Status</label>
                  <select 
                    className="w-full border p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 outline-none focus:border-blue-500"
                    value={form.ativo ? 'true' : 'false'}
                    onChange={e => setForm({...form, ativo: e.target.value === 'true'})}
                  >
                    <option value="true">✅ Ativo</option>
                    <option value="false">❌ Inativo</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-1 dark:text-slate-300">Nome do Produto</label>
                  <input 
                    required type="text" 
                    className="w-full border p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 outline-none focus:border-blue-500"
                    value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-slate-300">Categoria</label>
                  <select 
                    className="w-full border p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 outline-none focus:border-blue-500"
                    value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
                  >
                    <option value="espetinho">Espetinho</option>
                    <option value="bebida">Bebida</option>
                    <option value="jantinha">Jantinha</option>
                    <option value="porcao">Porção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-slate-300">Fornecedor</label>
                  <input 
                    type="text" 
                    className="w-full border p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-700 outline-none focus:border-blue-500" 
                    placeholder="Ex: Zé das Carnes"
                    value={form.fornecedor} onChange={e => setForm({...form, fornecedor: e.target.value})}
                  />
                </div>
              </div>

              <hr className="my-4 border-slate-200 dark:border-slate-700" />
              
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="chkEstoque" 
                  className="w-5 h-5 accent-blue-600"
                  checked={form.controlarEstoque}
                  onChange={e => setForm({...form, controlarEstoque: e.target.checked})}
                />
                <label htmlFor="chkEstoque" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Controlar Estoque deste produto?
                </label>
              </div>

              {form.controlarEstoque ? (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-slate-400">Estoque Atual</label>
                    <input disabled type="text" className="w-full border p-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold" value={form.estoqueAtual} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-blue-600 dark:text-blue-400">Adicionar/Remover</label>
                    <input type="number" className="w-full border-2 border-blue-100 dark:border-blue-900 p-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="0" onChange={e => setForm({...form, adicionarEstoque: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              ) : (
                 <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded text-orange-700 dark:text-orange-300 text-sm italic border border-orange-200 dark:border-orange-800">
                   Este é um produto de produção (ex: cozinha). O estoque não será contabilizado.
                 </div>
              )}

              <hr className="my-4 border-slate-200 dark:border-slate-700" />

              <div className="grid grid-cols-3 gap-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Custo (R$)</label>
                  <input type="text" inputMode="numeric" className="w-full border p-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-600 outline-none focus:border-blue-500" value={form.precoCusto} onChange={e => handleCustoChange(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Margem (%)</label>
                  <input type="text" inputMode="decimal" className="w-full border p-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:border-slate-600 outline-none focus:border-blue-500" value={form.margemLucro} onChange={e => handleMargemChange(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-green-700 dark:text-green-400">Venda (R$)</label>
                  <input type="text" inputMode="numeric" className="w-full border-2 border-green-500 p-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none" value={form.precoVenda} onChange={e => handleVendaChange(e.target.value)} />
                </div>
              </div>
              
              <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-bold">
                Lucro Estimado: <span className="text-green-600 dark:text-green-400 text-base">
                  R$ {(stringParaFloat(form.precoVenda) - stringParaFloat(form.precoCusto)).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" onClick={() => setModalAberto(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 py-3 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition hover:scale-[1.02]"
                >
                  Salvar Produto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LISTA DE PRODUTOS (Com Rolagem para Celular) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Produto</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Categoria</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Fornecedor</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Custo</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Venda</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-center">Estoque</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {produtosFiltrados.map(prod => (
                <tr 
                  key={prod.id} 
                  onClick={() => abrirModal(prod)}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition"
                >
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{prod.nome}</td>
                  <td className="p-4 capitalize text-slate-500 dark:text-slate-400">{prod.categoria}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{prod.fornecedor || '-'}</td>
                  <td className="p-4 text-right text-slate-500 dark:text-slate-400">R$ {prod.precoCusto.toFixed(2).replace('.', ',')}</td>
                  <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">R$ {prod.preco.toFixed(2).replace('.', ',')}</td>
                  <td className="p-4 text-center font-bold">
                    {prod.controlarEstoque ? (
                      <span className={prod.estoque < 5 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}>
                        {prod.estoque}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xl" title="Estoque Infinito">∞</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${prod.ativo ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {prod.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {produtosFiltrados.length === 0 && !loading && (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <span className="text-4xl mb-2">🔍</span>
              <p>Nenhum produto encontrado com esse nome.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}