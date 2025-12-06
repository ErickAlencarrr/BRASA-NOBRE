'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Product {
  id: number
  nome: string
  preco: number
  precoCusto: number
  estoque: number
  controlarEstoque: boolean // <--- ADICIONADO NO TIPO
  categoria: string
  fornecedor: string
  ativo: boolean
}

export default function GerenciarProdutos() {
  const [produtos, setProdutos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de Busca e Filtro
  const [termoBusca, setTermoBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  
  // Modal e Edição
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)

  // Estado do Formulário
  const [form, setForm] = useState({
    nome: '',
    categoria: 'espetinho',
    precoCusto: '0,00',
    margemLucro: '50,0',
    precoVenda: '0,00',
    estoqueAtual: 0,
    controlarEstoque: true, // <--- ESTADO NOVO
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

  // --- MÁSCARA DE MOEDA ---
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

  // --- LÓGICA MATEMÁTICA ---
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

  // --- ABRIR MODAL ---
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
        controlarEstoque: produto.controlarEstoque, // <--- CARREGA DO BANCO
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

  // --- SALVAR ---
  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault()
    const toastId = toast.loading('Salvando produto...')
    
    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      preco: stringParaFloat(form.precoVenda),
      precoCusto: stringParaFloat(form.precoCusto),
      estoque: editandoId ? (form.estoqueAtual + Number(form.adicionarEstoque)) : Number(form.estoqueAtual),
      controlarEstoque: form.controlarEstoque, // <--- ENVIA O NOVO CAMPO
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
        toast.dismiss(toastId) // Remove o loading
        toast.success("Produto salvo com sucesso!")
        setModalAberto(false)
        carregarProdutos()
      } else {
        toast.dismiss(toastId)
        toast.error("Erro ao salvar produto")
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro de conexão")
    }
  }
  // --- FILTROS ---
  const produtosFiltrados = produtos.filter(p => {
    const batemNome = p.nome.toLowerCase().includes(termoBusca.toLowerCase())
    const bateCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro
    return batemNome && bateCategoria
  })

  const categorias = ['todos', ...new Set(produtos.map(p => p.categoria))]

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-800">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Estoque</h1>
        <button 
          onClick={() => abrirModal()} 
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold shadow w-full md:w-auto"
        >
          + Novo Produto
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <input 
          type="text"
          placeholder="🔍 Buscar por nome ou fornecedor..."
          className="w-full border border-slate-300 p-2 rounded text-slate-900 outline-none focus:border-blue-500 mb-4"
          value={termoBusca}
          onChange={e => setTermoBusca(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categorias.map(cat => (
            <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-4 py-1 rounded-full text-sm font-bold capitalize whitespace-nowrap transition ${categoriaFiltro === cat ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {editandoId ? 'Editar Produto' : 'Cadastrar Produto'}
            </h2>
            
            <form onSubmit={salvarProduto} className="space-y-4">
              
              <div className="flex gap-4">
                <div className="w-1/4">
                  <label className="block text-sm font-bold mb-1">Status</label>
                  <select 
                    className="w-full border p-2 rounded bg-white text-slate-900"
                    value={form.ativo ? 'true' : 'false'}
                    onChange={e => setForm({...form, ativo: e.target.value === 'true'})}
                  >
                    <option value="true">✅ Ativo</option>
                    <option value="false">❌ Inativo</option>
                  </select>
                </div>
                <div className="w-3/4">
                  <label className="block text-sm font-bold mb-1">Nome do Produto</label>
                  <input required type="text" className="w-full border p-2 rounded text-slate-900" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Categoria</label>
                  <select className="w-full border p-2 rounded bg-white text-slate-900" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                    <option value="espetinho">Espetinho</option>
                    <option value="bebida">Bebida</option>
                    <option value="jantinha">Jantinha</option>
                    <option value="porcao">Porção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Fornecedor</label>
                  <input type="text" className="w-full border p-2 rounded text-slate-900" placeholder="Ex: Zé das Carnes" value={form.fornecedor} onChange={e => setForm({...form, fornecedor: e.target.value})} />
                </div>
              </div>

              <hr className="my-4 border-slate-200" />
              
              {/* --- NOVO CONTROLE: USA ESTOQUE? --- */}
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  id="chkEstoque" 
                  className="w-5 h-5 accent-blue-600"
                  checked={form.controlarEstoque}
                  onChange={e => setForm({...form, controlarEstoque: e.target.checked})}
                />
                <label htmlFor="chkEstoque" className="font-bold text-slate-700 cursor-pointer select-none">
                  Controlar Estoque deste produto?
                </label>
              </div>

              {/* Renderização Condicional do Estoque */}
              {form.controlarEstoque ? (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                  <div>
                    <label className="block text-sm font-bold mb-1">Estoque Atual</label>
                    <input disabled type="text" className="w-full border p-2 rounded bg-slate-200 text-slate-500" value={form.estoqueAtual} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-blue-600">Adicionar/Remover</label>
                    <input type="number" className="w-full border border-blue-300 p-2 rounded text-slate-900" placeholder="0" onChange={e => setForm({...form, adicionarEstoque: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              ) : (
                 <div className="bg-orange-50 p-3 rounded text-orange-700 text-sm italic border border-orange-200">
                   Este é um produto de produção (ex: cozinha). O estoque não será contabilizado.
                 </div>
              )}

              <hr className="my-4 border-slate-200" />

              <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded border border-blue-100">
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700">Custo (R$)</label>
                  <input type="text" inputMode="numeric" className="w-full border p-2 rounded text-slate-900" value={form.precoCusto} onChange={e => handleCustoChange(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700">Margem (%)</label>
                  <input type="text" inputMode="decimal" className="w-full border p-2 rounded text-slate-900" value={form.margemLucro} onChange={e => handleMargemChange(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-green-700">Venda (R$)</label>
                  <input type="text" inputMode="numeric" className="w-full border-2 border-green-500 p-2 rounded text-slate-900 font-bold" value={form.precoVenda} onChange={e => handleVendaChange(e.target.value)} />
                </div>
              </div>
              
              <div className="text-right text-xs text-slate-500">
                Lucro: <span className="font-bold text-green-600">
                  R$ {(stringParaFloat(form.precoVenda) - stringParaFloat(form.precoCusto)).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 bg-slate-200 py-3 rounded font-bold hover:bg-slate-300 text-slate-800">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LISTA --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-sm font-bold text-slate-600">Produto</th>
              <th className="p-4 text-sm font-bold text-slate-600">Categoria</th>
              <th className="p-4 text-sm font-bold text-slate-600">Fornecedor</th>
              <th className="p-4 text-sm font-bold text-slate-600 text-right">Custo</th>
              <th className="p-4 text-sm font-bold text-slate-600 text-right">Venda</th>
              <th className="p-4 text-sm font-bold text-slate-600 text-center">Estoque</th>
              <th className="p-4 text-sm font-bold text-slate-600 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map(prod => (
              <tr key={prod.id} onClick={() => abrirModal(prod)} className="border-b last:border-0 hover:bg-blue-50 cursor-pointer transition">
                <td className="p-4 font-medium text-slate-800">{prod.nome}</td>
                <td className="p-4 capitalize text-slate-500">{prod.categoria}</td>
                <td className="p-4 text-slate-500 text-sm">{prod.fornecedor || '-'}</td>
                <td className="p-4 text-right text-slate-500">R$ {prod.precoCusto.toFixed(2).replace('.', ',')}</td>
                <td className="p-4 text-right font-bold text-green-600">R$ {prod.preco.toFixed(2).replace('.', ',')}</td>
                <td className="p-4 text-center font-bold">
                  {prod.controlarEstoque ? (
                    <span className={prod.estoque < 5 ? 'text-red-500' : 'text-slate-700'}>{prod.estoque}</span>
                  ) : (
                    <span className="text-slate-400 text-xl" title="Estoque Infinito">∞</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${prod.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {prod.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {produtosFiltrados.length === 0 && !loading && (
          <div className="p-8 text-center text-slate-500">Nenhum produto encontrado.</div>
        )}
      </div>
    </div>
  )
}