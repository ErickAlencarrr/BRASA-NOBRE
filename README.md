# Brasa Nobre 🥩 - Sistema de Gestão para Espetaria

> Modernizando o fluxo de atendimento, do pedido na mesa à entrega pela cozinha, com controle financeiro em tempo real.

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

---

## 🎯 Visão Geral

O Brasa Nobre foi desenvolvido para solucionar gargalos de comunicação entre o salão e a cozinha em estabelecimentos gastronômicos rápidos, como espetarias. Centralizando o controle de mesas, comandas, fluxo de caixa e estoque em uma única plataforma, o sistema reduz drasticamente o tempo de espera do cliente, elimina erros em anotações manuais e fornece aos administradores um controle rigoroso sobre margens de lucro e movimentações financeiras.

## 📷 Telas do Projeto

### Visão Geral das Mesas e Pedidos
<div align="center">
  <img src="https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165017.png" width="800px" alt="Tela de Mesas Livre/Ocupada">
  <img src="https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165152.png" width="800px" alt="Detalhe do Pedido">
</div>

### Gerenciamento de Produtos (CRUD)
<div align="center">
  <img src="https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165105.png" width="800px" alt="Cadastro de Produtos">
</div>

### Gestão Financeira e Relatórios
<div align="center">
  <img src="https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165034.png" width="800px" alt="Fluxo de Caixa">
</div>

### Autenticação robusta com perfis de acesso (Admin, Atendimento, Cozinha).
<div align="center">
  <img src="https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/main/prints/Captura de tela 2026-05-25 172113.png" width="800px" alt="Fluxo de Caixa">
</div>

<div align="center">
  <img src="https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/main/prints/Captura de tela 2026-05-25 172045.png" width="800px" alt="Fluxo de Caixa">
</div>

### Workflow de Cozinha (KDS)

<div align="center">
  <img src="https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/main/prints/Captura de tela 2026-05-25 173946.png" width="800px" alt="Fluxo de Caixa">
</div>

---

## ✅ Funcionalidades

- [x] **Gestão de Mesas e Comandas:** Visualização em tempo real de mesas ocupadas/livres, adição rápida de pedidos e facilidade no fechamento de contas.
- [x] **Fluxo de Caixa:** Registro de pagamentos, controle de totais e fechamento de caixa detalhado.
- [x] **Controle de Estoque (CRUD):** Cadastro, edição e remoção de itens do cardápio com monitoramento de preço de custo versus preço de venda.
- [x] **Painel Administrativo:** Gráficos de vendas diárias e relatórios operacionais.
- [x] **Controle de Acesso (RBAC):** Autenticação robusta com perfis de acesso (Admin, Atendimento, Cozinha).
- [x] **Workflow de Cozinha (KDS):** Painel dinâmico para a cozinha com atualização de status em tempo real.

## 🛠️ Tecnologias e Arquitetura

Este projeto foi desenvolvido com uma stack moderna focada em type-safety de ponta a ponta, performance e escalabilidade:

- **Frontend:** Next.js (App Router), React, TailwindCSS
- **Backend:** Node.js, Next.js (Server Actions)
- **Infraestrutura/DB:** PostgreSQL, Prisma ORM
- **Linguagem:** TypeScript

### Boas Práticas Aplicadas
- **Server Actions:** Forte adoção de mutações de dados limpas no lado do servidor, reduzindo a complexidade no client-side.
- **Modelagem Relacional:** Banco de dados estruturado via Prisma, desenhado para suportar a concorrência de pedidos em horários de pico.

---

## 🚀 Como executar o projeto localmente

**Pré-requisitos:** Node.js (versão LTS) e Git instalados.

```bash
# 1. Clone este repositório
git clone [https://github.com/ErickAlencarrr/BRASA-NOBRE.git](https://github.com/ErickAlencarrr/BRASA-NOBRE.git)

# 2. Acesse a pasta do projeto
cd BRASA-NOBRE

# 3. Instale as dependências
npm install

# 4. Configure o ambiente
# Renomeie o arquivo .env.example para .env e insira a URL do seu banco de dados PostgreSQL.

# 5. Configure o Banco de Dados e rode as migrations
npx prisma generate
npx prisma migrate dev

# 6. Inicie o servidor de desenvolvimento
npm run dev
