# Prompt Manager

Aplicação desenvolvida para gerenciar prompts de IA, permitindo criar, editar, listar e deletar prompts de forma eficiente. O projeto foca em boas práticas de engenharia de software, qualidade de código e uma experiência de usuário fluida.

## Engenharia de software

Este projeto vai além do código, aplicando conceitos fundamentais de engenharia de software:

- **Arquitetura de software:** adoção de **Clean Architecture** (adaptação), separando o código em camadas (**Core**: domínio e aplicação; **Infra**: persistência e integrações; **App/UI**: Next.js, componentes e ações) para facilitar manutenção e testes.
- **Design patterns:** utilização do padrão **Repository** para abstrair a persistência de dados e inverter dependências.
- **SOLID:** aplicação dos princípios SOLID para criar componentes desacoplados e robustos.
- **Testes automatizados:** implementação prática da **pirâmide de testes**, cobrindo a base com testes unitários, o meio com testes de integração e o topo com testes E2E.
- **Test doubles:** uso de **mocks**, **stubs** e **fakes** para isolar comportamentos em testes.

## Stack principal

| Área                    | Tecnologias                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| Framework               | [Next.js](https://nextjs.org) (App Router), [React](https://react.dev)                                          |
| Linguagem               | [TypeScript](https://www.typescriptlang.org)                                                                    |
| Estilo                  | [Tailwind CSS](https://tailwindcss.com)                                                                         |
| Banco de dados          | [PostgreSQL](https://www.postgresql.org) via [Prisma](https://www.prisma.io)                                    |
| Formulários e validação | [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev)                                          |
| UI                      | [Radix UI](https://www.radix-ui.com), ícones [Lucide](https://lucide.dev)                                       |
| Testes                  | [Jest](https://jestjs.io), [Testing Library](https://testing-library.com), [Playwright](https://playwright.dev) |

## Estrutura do código (visão geral)

- `src/core/domain` — entidades e contratos (ex.: repositório de prompts).
- `src/core/application` — casos de uso e DTOs da camada de aplicação.
- `src/infra` — implementações concretas (ex.: repositório Prisma).
- `src/app` — rotas, layouts e Server Actions que orquestram os casos de uso.
- `src/components` — componentes de interface reutilizáveis.
- `src/test` — testes unitários e de integração espelhando a estrutura de `src`.
- `e2e` — testes end-to-end com Playwright.

## Pré-requisitos

- [Node.js](https://nodejs.org) (versão compatível com o projeto)
- PostgreSQL em execução e uma URL de conexão configurada (variável `DATABASE_URL` para o Prisma)

## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure o ambiente: crie um arquivo `.env` na raiz com `DATABASE_URL` apontando para seu banco PostgreSQL.

3. Gere o client do Prisma e aplique as migrações:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   (Opcional) Popular dados iniciais:

   ```bash
   npm run db:seed
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Scripts úteis

| Script                            | Descrição                           |
| --------------------------------- | ----------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento Next.js |
| `npm run build` / `npm run start` | Build e servidor de produção        |
| `npm run lint`                    | ESLint                              |
| `npm run typecheck`               | Verificação de tipos TypeScript     |
| `npm run format`                  | Formatação com Prettier             |
| `npm test`                        | Testes (Jest)                       |
| `npm run test:watch`              | Jest em modo watch                  |
| `npm run test:coverage`           | Cobertura de testes                 |
| `npm run test:e2e`                | Testes E2E (Playwright)             |
| `npm run test:e2e:ui`             | Playwright com UI                   |
| `npm run db:studio`               | Prisma Studio (inspeção do banco)   |
