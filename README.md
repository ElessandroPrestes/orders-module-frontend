# 🎯 orders-module-frontend


> Aplicação **Frontend SPA** , integrada à API RESTful do projeto Orders Module. Focada em **gerenciamento** de pedidos e exibição de dados.

---

## ⚙️ Funcionalidades

- 🌐 Interface responsiva com Quasar Framework
- 🛰️ Visualização e detalhamento de pedidos
- 🔐 Autenticação com persistência de sessão
- 🔄 Integração com API RESTful via Axios

---

## 🚀 Primeiros Passos

### 📋 Pré-requisitos

- Docker
- Docker Compose
- API RESTful funcional (ex: http://localhost:8081)

### 🔧 Instalação e Execução via Docker

```bash
# 1. Clone o projeto
git clone https://gitlab.com/elessandrodev/orders-module-frontend

# 2. Acesse o diretório
cd orders-module-frontend

# 3. Crie o arquivo de variáveis de ambiente
cp .env.example .env

# 4. Suba o container do frontend
docker compose up -d --build

# 5. Acesse o container
docker compose exec orders_frontend sh

# 6. Instale as dependências manualmente 
npm install

```

### ✅ Testes Automatizados

```bash
# Dentro do container spassu_frontend
  npm run test

# Para gerar o relatório de cobertura
  npm run test:coverage
```

## 📊 Relatório de Cobertura de Testes


---

## 🖥️ Acessos Locais

| Serviço                | URL                   | Detalhes                               |
|------------------------|------------------------|-----------------------------------------|
| Frontend SPA (Quasar) | http://localhost:9000 | Interface de pedidos   |
| Antennas - Criar         | http://localhost:9000/orders/create  | Formulário para criação de pedidos     |
| Antennas - Listagem      | http://localhost:9000/orders/list    | Visualização em lista de todos os pedidos |
| Antennas - Detalhes      | http://localhost:9000/orders/details | Detalhes de um pedido específica       |
| Antennas - Cancelamento        | http://localhost:9000/antennas/cancel    | Formulário de cancelamento de pedidos        |

---

## 🧰 Tecnologias Utilizadas

- **Vue.js 3** – estrutura reativa da SPA  
- **Quasar Framework** – interface rica e responsiva  
- **Vite** – build rápido e moderno  
- **Pinia** – gerenciamento global de estado  
- **Vue Router** – navegação entre rotas  
- **Axios** – comunicação com a API RESTful  
- **Vitest** – testes unitários e cobertura  
- **ESLint + Prettier** – padronização e estilo de código  
- **Docker + Docker Compose** – ambiente containerizado  

## 📄 Licença

Este projeto foi desenvolvido com 💙 por **Elessandro Prestes Macedo**, e está distribuído sob a [Licença MIT](https://opensource.org/licenses/MIT).




