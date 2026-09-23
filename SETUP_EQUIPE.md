# Preparar o Rotaê no computador da equipe

Estas instruções são para a primeira instalação. Execute os comandos no terminal Bash, dentro da pasta do projeto, onde está `docker-compose.yml`.

## 1. Criar configurações privadas

```bash
cp rotaeBD/.env.example rotaeBD/.env
cp rotaeFrontend/.env.example rotaeFrontend/.env.local
```

Abra `rotaeBD/.env` e substitua a senha de exemplo por uma senha forte criada por você. Salve o arquivo. Cada pessoa usa a própria senha; não envie arquivos `.env` ou `.env.local` ao GitHub.

## 2. Iniciar banco e frontend

```bash
docker compose up -d --build banco frontend
```

Confira se o banco está pronto:

```bash
docker compose exec banco pg_isready -U admin -d rotae
```

Se ainda não aparecer `accepting connections`, aguarde alguns segundos e repita esse último comando.

## 3. Criar tabelas e dados de exemplo

Execute os cinco arquivos SQL na ordem do nome:

```bash
for arquivo in rotaeBD/migrations/*.sql; do
  docker compose exec -T banco psql -v ON_ERROR_STOP=1 -U admin -d rotae < "$arquivo" || break
done
```

Continue somente se nenhum comando apresentar `ERROR`.

## 4. Definir a senha do usuário de leitura

Entre no PostgreSQL:

```bash
docker compose exec banco psql -U admin -d rotae
```

Dentro do PostgreSQL, digite:

```text
\password rotae_reader
```

Escolha uma senha e repita quando solicitado. Os caracteres digitados não aparecem na tela. Depois digite:

```text
\q
```

Abra `rotaeFrontend/.env.local`. Na linha `PGPASSWORD=`, substitua o texto de exemplo pela **mesma senha que acabou de criar para `rotae_reader`**. Salve o arquivo.

## 5. Reiniciar e testar

```bash
docker compose restart frontend
```

Abra http://localhost:3000/api/viagens no navegador. O resultado esperado é uma lista contendo a viagem de exemplo de Fortaleza para Recife.