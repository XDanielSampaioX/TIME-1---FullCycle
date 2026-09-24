# Guia de contribuição — Backend

Este documento define a estrutura do backend do Rotaê e o fluxo para implementação de novos módulos e endpoints.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Fluxo de implementação](#fluxo-de-implementação)
  - [1. Model](#1-model)
  - [2. Migration](#2-migration)
  - [3. Serializer](#3-serializer)
  - [4. Service](#4-service)
  - [5. View](#5-view)
  - [6. URL](#6-url)
  - [7. Swagger](#7-swagger--openapi)
  - [8. Resultado](#8-resultado)
  - [9. Quando dividir os arquivos](#9-quando-dividir-os-arquivos)
  - [10. Testes](#10-testes)
- [Referência rápida](#referência-rápida)

---

## Arquitetura
O backend é dividido em Django Apps de acordo com os principais domínios da aplicação:

```text
rotaeBackend/
├── core/
├── usuarios/
├── viagens/
├── reservas/
├── pagamentos/
└── manage.py
```

* `core`: configurações gerais do projeto
* `usuarios`: usuários e autenticação
* `viagens`: viagens, cidades, ônibus e assentos
* `reservas`: reservas e passagens
* `pagamentos`: pagamentos

O App é a principal unidade de modularização. Não criamos necessariamente um App para cada entidade.

A estrutura inicial de um módulo é:

```text
viagens/
├── migrations/
├── swagger/
├── tests/
├── models.py
├── serializers.py
├── services.py
├── views.py
├── urls.py
├── admin.py
└── apps.py
```

### Responsabilidades

| Arquivo          | Responsabilidade                             |
| ---------------- | -------------------------------------------- |
| `models.py`      | modelos e relacionamento com o banco         |
| `serializers.py` | validação e transformação dos dados da API   |
| `services.py`    | regras de negócio e operações mais complexas |
| `views.py`       | tratamento das requisições HTTP |
| `urls.py`        | rotas do módulo                              |
| `swagger/`       | documentação OpenAPI das rotas               |
| `tests/`         | testes automatizados                         |
| `admin.py`       | registro de entidades no painel admin do django |

Não é necessário utilizar todas as camadas em toda funcionalidade. Uma operação simples não deve ganhar um Service apenas por formalidade.

---

# Fluxo de implementação

Para uma nova rota, siga esta ordem:

```text
Model
  ↓
Migration
  ↓
Serializer
  ↓
Service (quando necessário)
  ↓
View
  ↓
URL
  ↓
Swagger
```

---

## 1. Model

Quando a funcionalidade envolve uma nova entidade ou alteração no banco, comece pelo Model.

Exemplo:

```python
from django.db import models


class Cidade(models.Model):
    nome = models.CharField(max_length=100)
    uf = models.CharField(max_length=2)
    imagem_url = models.URLField(blank=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} - {self.uf}"
```

Models representam os dados persistidos e normalmente correspondem a tabelas do banco.

Consulte a documentação oficial do Django sobre [Models e banco de dados](https://docs.djangoproject.com/en/6.1/topics/db/).

---

## 2. Migration

Depois de alterar os Models:

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

As migrations devem ser versionadas junto com as alterações dos Models.

O fluxo é:

```text
Alterar Model
    ↓
makemigrations
    ↓
migrate
```

Consulte [Django Migrations](https://docs.djangoproject.com/en/6.1/topics/migrations/) para detalhes.

---

## 3. Serializer

O Serializer define como os dados serão validados e representados pela API.

```python
from rest_framework import serializers

from viagens.models import Cidade


class CidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cidade
        fields = ["id", "nome", "uf", "imagem_url"]
```

Para endpoints de leitura, o Serializer transforma os objetos do ORM em JSON para que o frontend possa consumir. 

Para endpoints de escrita, também pode validar os dados recebidos.

Consulte [DRF Serializers](https://www.django-rest-framework.org/api-guide/serializers/).

---

## 4. Service

Services são utilizados quando existem regras de negócio ou uma operação que envolve várias etapas.

Uma listagem simples, por exemplo, não precisa de Service:

```text
View
  ↓
ORM
  ↓
Serializer
```

Já uma criação de reserva pode exigir:

```text
View
  ↓
ReservaService
  ├── valida viagem
  ├── verifica assentos
  ├── cria reserva
  └── bloqueia assentos
```

Nesse caso, a regra de negócio fica no `services.py`, e não na View.

Não criar Services apenas para adicionar uma camada.

---

## 5. View

A View trata a requisição HTTP e utiliza o Serializer e, quando necessário, um Service.

Para uma listagem simples:

```python
from rest_framework.generics import ListAPIView

from viagens.models import Cidade
from viagens.serializers import CidadeSerializer


class CidadeListView(ListAPIView):
    queryset = Cidade.objects.all()
    serializer_class = CidadeSerializer
```

O Django Rest Framework fornece Generic Views para operações comuns, como listagem, criação e consulta de objetos.

Consulte [DRF Generic Views](https://www.django-rest-framework.org/api-guide/generic-views/).

---

## 6. URL

Cada módulo mantém suas próprias URLs.

`viagens/urls.py`:

```python
from django.urls import path

from viagens.views import CidadeListView

urlpatterns = [
    path("cidades/", CidadeListView.as_view(), name="lista_cidades"),
]
```

Depois, o `core/urls.py` inclui as URLs dos módulos:

```python
from django.urls import include, path


api_v1_patterns = [
    path("", include("viagens.urls")),
]

urlpatterns = [
    path("api/v1/", include(api_v1_patterns)),
]
```

O endpoint resultante será:

```text
GET /api/v1/cidades/
```

---

## 7. Swagger / OpenAPI

A documentação das rotas fica separada das Views, dentro de `swagger/`.

Exemplo:

```text
viagens/
├── swagger/
│   └── cidades.py
├── serializers.py
├── views.py
└── urls.py
```

`viagens/swagger/cidades.py`:

```python
from drf_spectacular.utils import extend_schema

from viagens.serializers import CidadeSerializer


cidades_list_schema = extend_schema(
    summary="Listar cidades",
    description="Retorna a lista de todas as cidades disponíveis para viagens.",
    tags=["cidades"],
    responses={
        200: CidadeSerializer(many=True),
    },
)
```

A View utiliza o schema importado:

```python
from rest_framework.generics import ListAPIView

from viagens.models import Cidade
from viagens.serializers import CidadeSerializer
from viagens.swagger.cidades import cidades_list_schema


@cidades_list_schema
class CidadeListView(ListAPIView):
    queryset = Cidade.objects.all()
    serializer_class = CidadeSerializer
```

Dessa forma:

* `views.py` contém o comportamento da rota;
* `swagger/` contém sua documentação;
* `serializers.py` define a estrutura dos dados.

A documentação deve ser adicionada junto com a implementação da rota.

Consulte a documentação oficial do [drf-spectacular — schema customization](https://drf-spectacular.readthedocs.io/en/latest/customization.html?utm_source=chatgpt.com);.

---

## 8. Resultado

Uma rota simples como `GET /api/v1/cidades/` ficará organizada assim:

```text
viagens/
├── swagger/
│   └── cidades.py
├── tests/
├── models.py
├── serializers.py
├── services.py
├── views.py
└── urls.py
```

Fluxo completo:

```text
GET /api/v1/cidades/
        ↓
core/urls.py
        ↓
viagens/urls.py
        ↓
CidadeListView
        ↓
Cidade.objects.all()
        ↓
CidadeSerializer
        ↓
JSON Response
```

A documentação Swagger é mantida separadamente:

```text
CidadeListView
      ↑
cidades_list_schema
      ↑
viagens/swagger/cidades.py
```

---

## 9. Quando dividir os arquivos

A estrutura inicial deve permanecer simples.

Se um arquivo crescer significativamente (>100 linhas de código), ele pode ser transformado em um pacote:

```text
viagens/
├── models/
│   ├── __init__.py
│   ├── cidade.py
│   ├── onibus.py
│   └── viagem.py
├── serializers/
├── services/
├── views/
└── swagger/
```

Não criar uma pasta para cada entidade apenas para aumentar a organização.

A divisão deve acontecer quando a quantidade de código ou a complexidade do módulo justificar.

---

## 10. Testes

Os testes automatizados serão escritos utilizando **pytest**.

A estrutura prevista é:

```text
viagens/
└── tests/
    ├── test_cidades.py
    └── ...
```

A implementação dos testes não faz parte deste guia inicial, mas novos endpoints deverão ser testados conforme o desenvolvimento do projeto avançar.

---

## Referência rápida

### Onde colocar cada coisa?

**Banco de dados** -> `models.py`

**Validação e representação da API** -> `serializers.py`

**Regra de negócio** -> `services.py`

**HTTP** -> `views.py`

**Rotas** -> `urls.py`

**Swagger/OpenAPI** -> `swagger/`

**Testes** -> `tests/`

**Configuração global** -> `core/`

### Regra geral

> Mantenha a lógica próxima de sua responsabilidade e evite criar camadas ou abstrações que não sejam necessárias para a funcionalidade.
