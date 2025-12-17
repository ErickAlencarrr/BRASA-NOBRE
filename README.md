# Sistema de Gestão para Espetaria 🍢

> Um sistema completo para controle de mesas, pedidos e fluxo financeiro em tempo real, focado na agilidade do atendimento.

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
---
## 📷 Telas do Projeto

Aqui estão algumas prévias do sistema em funcionamento:

### Visão Geral das Mesas e Pedidos
![Screenshot da Tela de Mesas](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165017.png)

![Screenshot da Tela de Mesas](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165152.png)

![Screenshot da Tela de Mesas](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165217.png)

### Gerenciamento de Produtos (CRUD)
![Screenshot do CRUD](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165105.png)

![Screenshot do CRUD](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/image.png)

### Financeiro 

![Screenshot do Financeiro](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165034.png)

![Screenshot do Financeiro](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165042.png)

![Screenshot do Financeiro](https://github.com/ErickAlencarrr/BRASA-NOBRE/blob/master/prints/Captura%20de%20tela%202025-12-16%20165052.png)

## ✅ Funcionalidades

- [x] **Controle de Mesas:** Visualização em tempo real de mesas ocupadas/livres e seus pedidos atuais.
- [x] **Fluxo de Caixa:** Registro de pagamentos e fechamento de contas.
- [x] **Gestão de Produtos (CRUD):** Cadastro, edição e remoção de itens do cardápio com controle de preço.
- [x] **Relatórios e Dashboards:** Gráficos de vendas diárias.
- [ ] **Login de funcionários:** (Próxima implementação) Controle de acesso por nível de usuário.
- [ ] **Envio de Pedidos para Cozinha e Churrasqueira:** (Próxima implementação) Envio dos pedidos registrados no sistema para o preparo.

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenvolvido com uma stack moderna focada em performance e escalabilidade:

* **Front-end:** [Next.js](https://nextjs.org/) (React)
* **Back-end:** [Node.js](https://nodejs.org/en/)
* **ORM / Banco de Dados:** [Prisma](https://www.prisma.io/)
* **Linguagem:** TypeScript

---

## 🤖 Desenvolvimento Assistido por IA

A IA auxiliou em:

1.  **Estruturação do Schema do Banco de Dados:** Sugestões de relacionamentos entre Mesas, Pedidos e Produtos no Prisma.
2.  **Refatoração de Código:** Otimização de funções no Node.js para melhor performance.
3.  **Consultoria Técnica:** Agilizando a tomada de decisões sobre arquitetura do projeto.

*Nota: O uso da IA acelerou o desenvolvimento das estruturas base, permitindo que eu focasse na regra de negócio específica da espetaria e na experiência do usuário.*

## 🚀 Como executar o projeto localmente

Siga os passos abaixo para rodar o sistema na sua máquina:

### Pré-requisitos
* Node.js instalado (versão LTS recomendada)
* Git instalado

### Instalação

```bash
# 1. Clone este repositório
git clone [https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git](https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git)

# 2. Entre na pasta
cd NOME-DO-REPOSITORIO

# 3. Instale as dependências
npm install
# ou
yarn install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz baseado no .env.example
# Insira a URL do seu banco de dados

# 5. Rode as migrações do Prisma
npx prisma migrate dev

# 6. Inicie o servidor de desenvolvimento
npm run dev


