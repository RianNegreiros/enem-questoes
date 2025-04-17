# Questões ENEM

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

## Sobre

Aplicação web que permite aos estudantes acessar questões do ENEM de anos anteriores para estudo e prática. O projeto consome a API pública [enem-api](https://github.com/yunger7/enem-api) para obter os dados das questões e apresentá-los em uma interface amigável e responsiva.

## Tecnologias

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Markdown**
- **KaTeX**

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

3. Configure a variável de ambiente no arquivo `.env.local`:

```plaintext
NEXT_PUBLIC_API_URL=https://api.enem.dev
```

4. Execute o projeto em modo de desenvolvimento:

```bash
npm run dev
```

5. Acesse `http://localhost:3000` no seu navegador.

## Licença

Este projeto está licenciado sob a licença GPL 2.0.

## Agradecimentos

- [yunger7](https://github.com/yunger7) pelo desenvolvimento da enem-api que alimenta este projeto.
