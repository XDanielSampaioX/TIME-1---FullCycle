# Rotaê — Nginx

Proxy reverso que oferece uma entrada HTTP única para frontend e API. Usa a imagem `nginx:alpine` e a configuração `nginx.conf` desta pasta.

## Executar

Instale Docker com Compose e configure os arquivos `.env` conforme o [README da raiz](../README.md). Na raiz do projeto (em produção, troque `docker-compose.dev.yml` por `docker-compose.prod.yml` nos comandos abaixo):

```sh
docker compose -f docker-compose.dev.yml up -d --build
```

Abra http://localhost. O Compose publica a porta 80 e conecta o Nginx à rede `app-network`, na qual os nomes `frontend` e `backend` são resolvidos. Não é necessário instalar Nginx diretamente na máquina nem criar um `.env` para este serviço.

## Encaminhamento

| Caminho | Destino |
| --- | --- |
| `/` e páginas da aplicação | `http://frontend:3000` |
| `/api`, `/admin`, `/docs`, `/health`, `/media` e `/static`, com seus subcaminhos | `http://backend:8000`, preservando o caminho |

Não há `server_name` configurado: o único bloco de servidor atende qualquer host na porta 80, como `http://localhost`. A configuração não inclui certificados ou HTTPS.

O Swagger fica em http://localhost/docs/ e o schema OpenAPI em http://localhost/api/schema/, ambos encaminhados ao backend.

## Validar e aplicar mudanças

O Compose monta `nginx.conf` como arquivo somente leitura em `/etc/nginx/nginx.conf`. Após editar a configuração, valide e recarregue, executando na raiz com o serviço iniciado:

```sh
docker compose -f docker-compose.dev.yml exec nginx nginx -t
docker compose -f docker-compose.dev.yml exec nginx nginx -s reload
docker compose -f docker-compose.dev.yml logs --tail=100 nginx
```

Só recarregue se a validação passar. Para alterações no Dockerfile, reconstrua com `docker compose -f docker-compose.dev.yml up -d --build nginx`.

Se ocorrer erro 502, confira `docker compose -f docker-compose.dev.yml ps` e os logs de frontend/backend. O Compose aguarda esses contêineres iniciarem, mas não verifica se as aplicações já estão prontas. Caso um serviço seja recriado e o proxy deixe de alcançá-lo, reinicie o Nginx após confirmar que o destino está disponível.
