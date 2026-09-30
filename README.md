# TIME-1 - FullCycle: Rotaê
## Sumário
- [Objetivo](#-objetivo)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar o Projeto (Docker)](#-como-executar-o-projeto-docker)
- [Acessando a Aplicação](#-acessando-a-aplicação)
- [Comandos Úteis](#-comandos-úteis)
- [Colaboradores](#-colaboradores)

---

## Objetivo
Este repositório centraliza o projeto final da equipe no curso **Geração Tech - FullCycle**. O projeto **Rotaê** é estruturado como um monorepo, facilitando o gerenciamento do ecossistema que engloba Frontend, Backend e configurações de infraestrutura.

---

## Arquitetura e Tecnologias

A aplicação é dividida em serviços isolados orquestrados via Docker, garantindo que o ambiente de desenvolvimento seja padronizado para toda a equipe.

- **Frontend (`/rotaeFrontend`)**: Next.js 16 (React 19) estilizado com Tailwind CSS. Responsável pela interface do usuário.
- **Backend (`/rotaeBackend`)**: Django e Django REST Framework. Provê as APIs da aplicação.
- **Banco de Dados**: PostgreSQL 16. Persiste as informações do sistema.
- **Nginx (`/rotaeNginx`)**: Atua como um Reverse Proxy, roteando as requisições na porta `80` para o frontend ou backend dependendo da rota.

---

## Pré-requisitos

Para rodar este projeto na sua máquina, você precisará apenas do **Docker** e do **Docker Compose** instalados e rodando.

- [Guia de Instalação do Docker (Windows, macOS e Linux)](https://docs.docker.com/get-docker/)

---

## Como Executar o Projeto (Docker)

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
docker compose up --build -d
```

**4. Execute as migrações do banco de dados (Backend):**
Após subir os containers, aplique as migrações para criar a estrutura inicial das tabelas no banco de dados PostgreSQL:
```bash
docker compose exec backend python manage.py migrate
```

**5. (Opcional) Crie um superusuário para o painel Django Admin:**
Para acessar a interface de administração do backend ([http://localhost/admin/](http://localhost/admin/)), crie a conta administrativa:
```bash
docker compose exec backend python manage.py createsuperuser
```
O terminal interativo solicitará nome de usuário, email e senha.

---

## Acessando a Aplicação

Com os containers em execução, o Nginx irá expor a aplicação na porta `80` (porta web padrão) do seu localhost.

- **Frontend (Aplicação Web):** [http://localhost](http://localhost) (ou http://127.0.0.1)
- **Backend (API Base):** O Nginx redireciona as requisições que começam com `/api`, `/admin` ou `/docs` para o Django. Se acessar localmente com o Nginx desligado, o Django responde em http://localhost:8000.
- **Documentação da API (Swagger):** [http://localhost/docs/](http://localhost/docs/) (Interface visual interativa gerada pelo drf-spectacular)

---

## Comandos Úteis

Abaixo estão os comandos essenciais para o dia a dia do desenvolvimento. **Execute-os sempre na raiz do projeto:**

**Parar a aplicação:**
```bash
docker compose down
```

**Parar e resetar o banco de dados (⚠️ ATENÇÃO: isso apaga todos os dados persistidos):**
```bash
docker compose down -v
```


**Criar novas migrações após alterar os models do Django:**
```bash
docker compose exec backend python manage.py makemigrations
```

---

## Colaboradores

- bma9616@gmail.com
- asc.lima15@gmail.com
- danielsampaio127@gmail.com
- juliactp.santos@gmail.com
- paulovictormcarneiro@gmail.com
