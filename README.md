# API de Gerenciamento de Eventos

Uma API REST completa para gerenciar eventos, cronogramas, convidados, acompanhantes, confirmações de presença e geração de QR Codes de acesso. 

Construída em **Node.js (ES Modules)**, Express, Sequelize e MySQL.

## Requisitos
- Node.js (v18+)
- MySQL (v8+)

## Instalação

1. Clone o repositório
2. Instale as dependências executando:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure os dados do seu MySQL.
5. Crie a base de dados utilizando o script provido em: `database/schema.sql`

## Execução

Inicie a aplicação:
```bash
npm start
```
Ou inicie o servidor rodando:
```bash
node src/server.js
```

## Estrutura do Projeto

A aplicação segue uma arquitetura baseada em camadas, restrita ao uso de injeções de classes para evitar acoplamento direto de rotas:

- **Routes:** Centralizam Express-Validator (validações estritas).
- **Controllers:** Exclusivamente encarregados de receber HTTP Req/Res. Delegam as regras para os Services.
- **Services:** Local da Regra de Negócio (ex: limites de capacidade, regras de preenchimento).
- **Repositories:** Interagem diretamente com os Entity Models (Sequelize). Tratam operações de banco.

*(controllers e services NUNCA acionam tratamento de erro enviando Json, todos disparam `throw new AppError` que são processados por um `errorHandler`)*

## Postman / Endpoints

As rotas base utilizam o prefixo `/api/` (Ex: `/api/events`).
As rotas protegidas por JWT exigem cabeçalho Authorization: `Bearer SEU_TOKEN`.
