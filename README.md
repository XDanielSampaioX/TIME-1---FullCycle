# TIME-1 - FullCycle: Rotae
## 📌 Sumário
- [Objetivo](#-objetivo)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar o Projeto (Docker)](#-como-executar-o-projeto-docker)
- [Acessando a Aplicação](#-acessando-a-aplicação)
- [Comandos Úteis](#-comandos-úteis)
- [Colaboradores](#-colaboradores)

---

## 🎯 Objetivo
Este repositório centraliza o projeto final da equipe no curso **Geração Tech - FullCycle**. O projeto **Rotae** é estruturado como um monorepo, facilitando o gerenciamento do ecossistema que engloba Frontend, Backend e configurações de infraestrutura.

---

## 🏗 Arquitetura e Tecnologias

A aplicação é dividida em serviços isolados orquestrados via Docker, garantindo que o ambiente de desenvolvimento seja padronizado para toda a equipe.

- **Frontend (`/rotaeFrontend`)**: Next.js 16 (React 19) estilizado com Tailwind CSS. Responsável pela interface do usuário.
- **Backend (`/rotaeBackend`)**: Django e Django REST Framework. Provê as APIs da aplicação.
- **Banco de Dados**: PostgreSQL 16. Persiste as informações do sistema.
- **Nginx (`/rotaeNginx`)**: Atua como um Reverse Proxy, roteando as requisições na porta `80` para o frontend ou backend dependendo da rota.

---

## ⚙️ Pré-requisitos

Para rodar este projeto na sua máquina, você precisará apenas do **Docker** e do **Docker Compose** instalados e rodando.

- [Guia de Instalação do Docker (Windows, macOS e Linux)](https://docs.docker.com/get-docker/)

---

## 🚀 Como Executar o Projeto (Docker)

Siga os passos abaixo para iniciar a aplicação localmente de forma automatizada:

**1. Clone o repositório:**
```bash
git clone https://github.com/XDanielSampaioX/TIME-1---FullCycle.git
cd TIME-1---FullCycle
```

**2. Configure as variáveis de ambiente:**
Tanto no diretório do backend quanto no frontend, existem arquivos de exemplo (`.env.example`). Você precisa criar uma cópia deles e renomeá-la para `.env`.

- **Linux / macOS:** 
  ```bash
  cp rotaeBackend/.env.example rotaeBackend/.env
  cp rotaeFrontend/.env.example rotaeFrontend/.env
  ```
- **Windows (PowerShell):** 
  ```powershell
  Copy-Item rotaeBackend\.env.example rotaeBackend\.env
  Copy-Item rotaeFrontend\.env.example rotaeFrontend\.env
  ```

**3. Inicie os containers com Docker Compose:**
Na raiz do projeto (onde está o arquivo `docker-compose.yml`), execute o comando:
```bash
docker compose up --build
```
> **Dica:** Adicione a flag `-d` no final (`docker compose up --build -d`) para rodar os containers em segundo plano, liberando o seu terminal para executar outros comandos.

---

## 🌐 Acessando a Aplicação

Com os containers em execução, o Nginx irá expor a aplicação na porta `80` (porta web padrão) do seu localhost.

- **Frontend (Aplicação Web):** [http://localhost](http://localhost) (ou http://127.0.0.1)
- **Backend (API Base):** O Nginx redireciona as requisições que começam com `/api`, `/admin` ou `/docs` para o Django. Se acessar localmente com o Nginx desligado, o Django responde em http://localhost:8000.
- **Documentação da API (Swagger):** [http://localhost/docs/](http://localhost/docs/) (Interface visual interativa gerada pelo drf-spectacular)

---

## 🛠 Comandos Úteis

Abaixo estão os comandos essenciais para o dia a dia do desenvolvimento. **Execute-os sempre na raiz do projeto:**

**Parar a aplicação (se estiver rodando com `-d`):**
```bash
docker compose down
```

**Parar e remover os volumes (⚠️ ATENÇÃO: isso apaga o banco de dados):**
```bash
docker compose down -v
```

**Rodar migrações do banco (Backend):**
```bash
docker compose exec backend python manage.py migrate
```

**Criar um superusuário no Django:**
*(Isso permite acessar a interface de administrador em http://localhost/admin/)*
```bash
docker compose exec backend python manage.py createsuperuser
```
O terminal interativo irá solicitar nome de usuário, email e senha.

---

## 🤝 Colaboradores

- bma9616@gmail.com
- asc.lima15@gmail.com
- danielsampaio127@gmail.com
- juliactp.santos@gmail.com
- paulovictormcarneiro@gmail.com
