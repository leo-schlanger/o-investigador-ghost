# API Reference - Endpoints

## Base URL

| Ambiente | URL |
|----------|-----|
| Desenvolvimento | `http://localhost:3001/api` |
| Producao | `https://api.jornalinvestigador.pt/api` |

---

## Autenticacao

A API usa autenticacao JWT Bearer Token.

### Obter Token
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "senha123"
}
```

**Resposta (200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "email": "admin@example.com",
        "name": "Administrador",
        "role": "admin"
    }
}
```

### Usar Token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Endpoints Publicos (Sem Autenticacao)

### Health Check
```http
GET /health

Response: { "status": "ok", "timestamp": "2024-03-01T12:00:00Z" }
```

### Configuracao de Anuncios
```http
GET /api/public/ads-config

Response:
{
    "adsEnabled": true,
    "adsenseClientId": "ca-pub-xxxxx",
    "adSlots": {
        "header": { "slotId": "123", "format": "auto" },
        "sidebar": { "slotId": "456", "format": "rectangle" }
    }
}
```

### Rastrear Visualizacao
```http
POST /api/public/track-view
Content-Type: application/json

{
    "postId": "abc123",
    "postSlug": "titulo-do-artigo",
    "postTitle": "Titulo do Artigo"
}

Response: { "success": true, "views": 42 }
```

### Posts Mais Vistos
```http
GET /api/public/most-viewed?limit=5&period=week

Response:
[
    {
        "postId": "abc123",
        "postSlug": "titulo",
        "postTitle": "Titulo",
        "viewCount": 1500,
        "lastViewedAt": "2024-03-01T12:00:00Z"
    }
]
```

### Enviar Contato
```http
POST /api/public/contact
Content-Type: application/json

{
    "name": "Joao Silva",
    "email": "joao@email.com",
    "subject": "Dica de reportagem",
    "message": "Texto da mensagem..."
}

Response: { "success": true, "message": "Mensagem enviada!" }
```

---

## Endpoints Autenticados

### Autenticacao

#### Login
```http
POST /api/auth/login

Body: { "email": "...", "password": "..." }
Response: { "token": "...", "user": {...} }
```

#### Registrar Usuario (Admin only)
```http
POST /api/auth/register
Authorization: Bearer <token>

Body: { "email": "...", "password": "...", "name": "...", "role": "editor" }
Response: { "user": {...} }
```

#### Perfil Atual
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { "id": 1, "email": "...", "name": "...", "role": "admin" }
```

---

### Artigos (via Ghost API)

#### Listar Artigos
```http
GET /api/articles?page=1&limit=10&status=published
Authorization: Bearer <token>

Response:
{
    "posts": [...],
    "meta": { "pagination": {...} }
}
```

#### Obter Artigo
```http
GET /api/articles/:id
Authorization: Bearer <token>

Response: { "post": {...} }
```

#### Criar Artigo
```http
POST /api/articles
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Titulo do Artigo",
    "html": "<p>Conteudo HTML...</p>",
    "status": "draft",
    "tags": ["politica"],
    "feature_image": "https://..."
}

Response: { "post": {...} }
```

#### Atualizar Artigo
```http
PUT /api/articles/:id
Authorization: Bearer <token>

Body: { "title": "...", "html": "...", ... }
Response: { "post": {...} }
```

#### Excluir Artigo
```http
DELETE /api/articles/:id
Authorization: Bearer <token>

Response: { "success": true }
```

---

### Paginas

#### Listar Paginas
```http
GET /api/pages
Authorization: Bearer <token>

Response: { "pages": [...] }
```

#### CRUD Paginas
```http
POST /api/pages
GET /api/pages/:id
PUT /api/pages/:id
DELETE /api/pages/:id
```

---

### Tags

#### Listar Tags
```http
GET /api/tags
Authorization: Bearer <token>

Response: { "tags": [...] }
```

#### CRUD Tags
```http
POST /api/tags
GET /api/tags/:id
PUT /api/tags/:id
DELETE /api/tags/:id
```

---

### Navegacao

#### Obter Navegacao
```http
GET /api/navigation
Authorization: Bearer <token>

Response:
{
    "navigation": [
        { "label": "Home", "url": "/" },
        { "label": "Politica", "url": "/politica/" }
    ]
}
```

#### Atualizar Navegacao
```http
PUT /api/navigation
Authorization: Bearer <token>

Body: { "navigation": [...] }
Response: { "success": true }
```

---

### Media

#### Upload de Arquivo
```http
POST /api/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
folderId: <uuid> (opcional)

Response:
{
    "id": "uuid",
    "filename": "abc123.jpg",
    "url": "/uploads/abc123.jpg",
    "size": 102400,
    "folder": {...},
    "tags": [...]
}
```

#### Listar Midias (com filtros)
```http
GET /api/media?folderId=<uuid>&tags=<id1,id2>&search=<termo>&page=1&limit=50
Authorization: Bearer <token>

Response:
{
    "items": [...],
    "total": 50,
    "page": 1,
    "totalPages": 1
}
```

#### Obter Midia
```http
GET /api/media/:id
Authorization: Bearer <token>

Response: { "id": "...", "filename": "...", "folder": {...}, "tags": [...] }
```

#### Atualizar Midia
```http
PUT /api/media/:id
Authorization: Bearer <token>
Content-Type: application/json

{
    "folderId": "uuid",
    "tagIds": ["uuid1", "uuid2"],
    "originalName": "novo-nome.jpg"
}

Response: { "id": "...", "folder": {...}, "tags": [...] }
```

#### Mover Multiplos (Bulk Move)
```http
PUT /api/media/bulk-move
Authorization: Bearer <token>
Content-Type: application/json

{
    "mediaIds": ["uuid1", "uuid2"],
    "folderId": "uuid" (ou null para raiz)
}

Response: { "message": "X items movidos", "updatedCount": X }
```

#### Adicionar Tags em Lote
```http
PUT /api/media/bulk-add-tags
Authorization: Bearer <token>
Content-Type: application/json

{
    "mediaIds": ["uuid1", "uuid2"],
    "tagIds": ["tag-uuid1", "tag-uuid2"]
}

Response: { "message": "Tags adicionadas a X items" }
```

#### Excluir Midia
```http
DELETE /api/media/:id
Authorization: Bearer <token>

Response: { "message": "Media deleted" }
```

---

### Pastas de Media

#### Listar Pastas
```http
GET /api/media/folders?format=tree|flat
Authorization: Bearer <token>

Response (tree):
[
    {
        "id": "uuid",
        "name": "Pasta A",
        "parentId": null,
        "mediaCount": 5,
        "children": [
            { "id": "uuid2", "name": "Subpasta", ... }
        ]
    }
]
```

#### Criar Pasta
```http
POST /api/media/folders
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Nova Pasta",
    "parentId": "uuid" (opcional)
}

Response: { "id": "uuid", "name": "Nova Pasta", "parentId": null }
```

#### Atualizar Pasta
```http
PUT /api/media/folders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Novo Nome",
    "parentId": "uuid" (opcional - mover pasta)
}

Response: { "id": "...", "name": "Novo Nome" }
```

#### Excluir Pasta
```http
DELETE /api/media/folders/:id
Authorization: Bearer <token>

Response: { "message": "Pasta eliminada" }
```
> Nota: Ao eliminar pasta, midias e subpastas sao movidas para a pasta pai.

---

### Tags de Media

#### Listar Tags
```http
GET /api/media/tags
Authorization: Bearer <token>

Response:
[
    { "id": "uuid", "name": "Evento", "slug": "evento", "usageCount": 10 }
]
```

#### Sugestoes (Autocomplete)
```http
GET /api/media/tags/suggestions?q=<termo>
Authorization: Bearer <token>

Response:
[
    { "id": "uuid", "name": "Evento", "usageCount": 10 }
]
```

#### Criar Tag
```http
POST /api/media/tags
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Nova Tag"
}

Response: { "id": "uuid", "name": "Nova Tag", "slug": "nova-tag" }
```

#### Obter ou Criar Tag
```http
POST /api/media/tags/get-or-create
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Tag Existente ou Nova"
}

Response: { "tag": {...}, "created": true|false }
```

#### Excluir Tag
```http
DELETE /api/media/tags/:id
Authorization: Bearer <token>

Response: { "message": "Tag eliminada" }
```

---

### Configuracoes

#### Obter Todas
```http
GET /api/settings
Authorization: Bearer <token>

Response:
{
    "adsEnabled": true,
    "adsenseClientId": "...",
    "adSlots": {...}
}
```

#### Obter Especifica
```http
GET /api/settings/:key
Authorization: Bearer <token>

Response: { "key": "adsEnabled", "value": "true" }
```

#### Atualizar
```http
PUT /api/settings
Authorization: Bearer <token>

Body: { "key": "adsEnabled", "value": "false" }
Response: { "success": true }
```

---

## Codigos de Erro

| Codigo | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Nao encontrado |
| 429 | Muitas requisicoes (rate limit) |
| 500 | Erro interno |

---

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| `/api/auth/login` | 5 req / 15 min |
| `/api/public/contact` | 3 req / hora |
| Geral | 100 req / 15 min |

---

## Exemplos cURL

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

### Listar Artigos
```bash
curl http://localhost:3001/api/articles \
  -H "Authorization: Bearer <token>"
```

### Upload de Imagem
```bash
curl -X POST http://localhost:3001/api/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@imagem.jpg"
```
