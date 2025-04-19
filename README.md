# Questões ENEM

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)

## Sobre

Aplicação web que permite aos estudantes acessar questões do ENEM de anos anteriores para estudo e prática. O projeto consome a API pública [enem-api](https://github.com/yunger7/enem-api) para obter os dados das questões e apresentá-los em uma interface amigável e responsiva.

## Tecnologias

- **Next.js** - Framework React para desenvolvimento web
- **React** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI reutilizáveis
- **Kinde Auth** - Autenticação e autorização
- **PostgreSQL** - Banco de dados relacional (via Neon.tech)
- **Prisma** - ORM para Node.js e TypeScript
- **React Markdown** - Renderização de markdown
- **KaTeX** - Renderização de fórmulas matemáticas

## API

Este projeto consome a [enem-api](https://github.com/yunger7/enem-api), uma API pública e open-source para listagem de provas e questões do Exame Nacional do Ensino Médio (ENEM).

## Como executar

1. Clone o repositório:

```bash
git clone https://github.com/RianNegreiros/enem-questoes.git
cd enem-questoes
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo `.env.local`:

```plaintext
NEXT_PUBLIC_API_URL=https://api.enem.dev
DATABASE_URL=your_postgresql_connection_string
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=your_kinde_issuer_url
KINDE_SITE_URL=your_site_url
KINDE_POST_LOGOUT_REDIRECT_URL=your_post_logout_redirect_url
KINDE_POST_LOGIN_REDIRECT_URL=your_post_login_redirect_url
```

4. Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

5. Execute o projeto em modo de desenvolvimento:

```bash
npm run dev
```

6. Acesse `http://localhost:3000` no seu navegador.

## Licença

Este projeto está licenciado sob a licença GPL 2.0.

## Agradecimentos

- [yunger7](https://github.com/yunger7) pelo desenvolvimento da enem-api usada neste projeto.
