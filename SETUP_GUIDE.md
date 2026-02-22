# Configuração: Brasa Nobre (Admin & Login)

Este guia explica como colocar seu sistema no ar usando **Supabase** e **Vercel**.

## 1. Configurar Supabase (Banco de Dados)

Já configurei o código para usar seu projeto `ipgpjzidjmwwdtfzords`. Agora você precisa conectar:

1.  Abra o arquivo `.env` na raiz do projeto.
2.  Na linha `DATABASE_URL`, substitua `[SUA-SENHA]` pela senha que você criou para o banco de dados (database password) no painel do Supabase.
    *   *Se não lembra a senha:* Vá no Supabase -> Project Settings -> Database -> Reset Database Password.
3.  Salve o arquivo.

## 2. Criar as Tabelas no Supabase

Agora vamos enviar a estrutura do banco de dados para a nuvem. Abra o terminal e rode:

```bash
npx prisma db push
```

*(Se der erro de autenticação, verifique se a senha no `.env` está correta).*

## 3. Criar o Primeiro Usuário (Admin)

Para acessar o painel, precisamos criar o primeiro login. Rode este comando:

```bash
npx prisma db seed
```

Isso criará o usuário:
- **Email:** `admin@brasanobre.com`
- **Senha:** `admin123`

## 4. Testar Localmente

Rode o projeto e acesse `http://localhost:3000/login`:

```bash
npm run dev
```

Tente entrar com o email e senha acima. Se funcionar, você verá o painel admin.

---

## 5. Colocar no Ar (Vercel)

Para que o site funcione na internet (celular, outros computadores), faça o deploy na Vercel:

1.  Crie uma conta na [Vercel](https://vercel.com) e importe seu projeto do GitHub.
2.  Na tela de importação, vá em **Environment Variables** e adicione as mesmas variáveis do seu arquivo `.env`:

| Nome da Variável | Valor |
| :--- | :--- |
| `DATABASE_URL` | Copie o valor completo do seu `.env` (com a senha) |
| `AUTH_SECRET` | Crie uma senha longa e aleatória (ex: `x8z7a9b2c3d4e5f6...`) |
| `AUTH_URL` | A URL do seu site na Vercel (ex: `https://brasa-nobre.vercel.app`) |

3.  Clique em **Deploy**.

## 6. Usando no Celular

Após o deploy, basta acessar o link `https://brasa-nobre.vercel.app/admin` no navegador do seu celular e fazer login. O sistema é responsivo e funcionará como um app.
