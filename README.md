# SPIGFIT

Sistema web responsivo para gestão de alunos e prescrição de treinos. Inclui autenticação, perfis de administrador e aluno, biblioteca de exercícios, fichas, agenda semanal, registro de cargas e histórico.

## Tecnologias

- Next.js (App Router)
- React + TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- PWA para instalação no celular
- GitHub Actions para validação automática

## Configuração do Supabase

1. Crie um projeto no painel do Supabase com o nome `SPIGFIT`.
2. Abra **SQL Editor > New query**.
3. Copie todo o conteúdo de `supabase/migrations/001_initial_schema.sql`, cole no editor e clique em **Run**.
4. Abra uma nova consulta, copie `supabase/seed.sql` e clique em **Run**.
5. Abra o painel **Connect** ou **Project Settings > API Keys** e copie:
   - Project URL;
   - Publishable key;
   - Secret key.
6. Copie `.env.example` para `.env.local` e preencha as credenciais.

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

O sistema também aceita as chaves legadas `anon` e `service_role` quando necessário.

## Execução local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Criar o primeiro administrador

1. No painel do Supabase, abra **Authentication > Users**.
2. Clique em **Add user** e crie um usuário com e-mail e senha.
3. No SQL Editor, execute, substituindo pelo mesmo e-mail:

```sql
update public.profiles
set role = 'admin', status = 'active'
where email = 'SEU_EMAIL';
```

4. Entre no SPIGFIT usando esse e-mail e senha.

## Publicar

1. Crie um repositório privado no GitHub e envie esta pasta.
2. Importe o repositório na Vercel.
3. Cadastre as quatro variáveis do arquivo `.env.example`.
4. Altere `NEXT_PUBLIC_APP_URL` para o endereço publicado.
5. Faça o deploy.

## Demonstração visual

Abra `preview/index.html` diretamente no navegador. Essa página é apenas uma demonstração visual, sem conexão com o banco.

## Segurança

- A `SUPABASE_SECRET_KEY` nunca deve ser colocada em variável `NEXT_PUBLIC_` nem enviada para terceiros.
- As regras RLS do banco limitam cada aluno aos próprios dados.
- Use repositório privado e ative autenticação em dois fatores no GitHub e Supabase.

Nova validação do projeto.
