# Servicos - Detalhamento

## Mapa de Servicos

```
+------------------------------------------------------------------+
|                         INFRAESTRUTURA                            |
+------------------------------------------------------------------+
|  nginx:alpine  |  ghost:5-alpine  |  node:18  |  mysql:8        |
+------------------------------------------------------------------+
```

---

## 1. Nginx (Reverse Proxy)

### Configuracao
| Atributo | Valor |
|----------|-------|
| Imagem | `nginx:alpine` |
| Porta Publica | 80, 443 |
| Config Dev | `infrastructure/nginx/nginx-dev.conf` |
| Config Prod | `infrastructure/nginx/nginx-prod.conf` |

### Rotas Configuradas

```nginx
# Site publico (Ghost)
location / {
    proxy_pass http://ghost:2368;
}

# API Backend
location /api/ {
    proxy_pass http://api:3000/api/;
}

# Ghost Admin
location /ghost/ {
    proxy_pass http://ghost:2368/ghost/;
}

# Admin Panel (producao)
location /admin/ {
    alias /usr/share/nginx/html/admin/;
}
```

### Rate Limiting (Producao)
```
Zone: general  - 10 req/s por IP
Zone: api      - 20 req/s por IP
Zone: admin    - 5 req/s por IP
```

### Headers de Seguranca
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 2. Ghost CMS

### Configuracao
| Atributo | Valor |
|----------|-------|
| Imagem | `ghost:5-alpine` |
| Porta Interna | 2368 |
| URL Publica | Configurada via `url` env |
| Database | MySQL externo |

### Variaveis de Ambiente
```
url=https://jornalinvestigador.pt
database__client=mysql
database__connection__host=mysql
database__connection__user=ghost
database__connection__database=o_investigador
mail__transport=SMTP (opcional)
```

### APIs Disponiveis
| API | Autenticacao | Uso |
|-----|--------------|-----|
| Content API | API Key (query param) | Leitura publica |
| Admin API | API Key (JWT) | CRUD completo |

### Tema Customizado
- Localizado em: `ghost-theme/`
- Engine: Handlebars
- CSS: TailwindCSS compilado
- JS: Vanilla JS modular

---

## 3. CMS API (Backend)

### Configuracao
| Atributo | Valor |
|----------|-------|
| Runtime | Node.js 18 LTS |
| Framework | Express 4.x |
| Porta | 3001 (dev), 3000 (prod) |
| ORM | Sequelize 6.x |

### Estrutura de Diretorios
```
cms-api/
├── server.js           # Entry point
├── package.json
├── Dockerfile
└── src/
    ├── config/         # Configuracoes
    ├── controllers/    # Logica de requisicoes
    ├── middleware/     # Auth, validation
    ├── models/         # Modelos Sequelize
    ├── routes/         # Definicao de rotas
    └── services/       # Logica de negocio
```

### Middlewares
1. **Helmet** - Headers de seguranca
2. **CORS** - Cross-Origin Resource Sharing
3. **Rate Limit** - Protecao contra abuso
4. **Auth** - Verificacao JWT
5. **Multer** - Upload de arquivos

### Health Check
```
GET /health
Response: { status: "ok", timestamp: "..." }
```

---

## 4. Admin Panel (Frontend)

### Configuracao
| Atributo | Valor |
|----------|-------|
| Framework | React 18 |
| Build Tool | Vite 4.x |
| Porta Dev | 5173 |
| Output | `dist/` |

### Estrutura de Diretorios
```
admin-panel/
├── src/
│   ├── components/     # Componentes reutilizaveis
│   ├── context/        # React Context (Auth)
│   ├── pages/          # Paginas da aplicacao
│   ├── services/       # Chamadas API
│   ├── utils/          # Funcoes utilitarias
│   └── App.jsx         # Componente raiz
├── public/             # Assets estaticos
├── index.html          # Template HTML
├── vite.config.js      # Config Vite
└── tailwind.config.js  # Config Tailwind
```

### Paginas Principais
| Rota | Componente | Descricao |
|------|------------|-----------|
| `/` | Dashboard | Visao geral |
| `/articles` | Articles | Lista de artigos |
| `/articles/new` | ArticleEditor | Criar artigo |
| `/media` | MediaLibrary | Biblioteca |
| `/settings` | Settings | Configuracoes |
| `/users` | Users | Gestao usuarios |

### Autenticacao
- Token JWT armazenado em localStorage
- Interceptor Axios para injetar token
- Refresh automatico em 401

---

## 5. MySQL Database

### Configuracao
| Atributo | Valor |
|----------|-------|
| Imagem | `mysql:8` |
| Porta | 3306 |
| Database | `o_investigador` |
| Charset | `utf8mb4` |
| Collation | `utf8mb4_unicode_ci` |

### Usuarios
| Usuario | Permissoes | Uso |
|---------|------------|-----|
| root | ALL | Administracao |
| ghost | ALL on o_investigador | Aplicacao |

### Volumes
```
mysql_data:/var/lib/mysql
```

### Health Check
```sql
SELECT 1
-- Timeout: 5s, Interval: 30s, Retries: 3
```

---

## Comunicacao entre Servicos

### Portas Internas (Docker Network)
```
mysql:3306    <- ghost, api
ghost:2368   <- nginx, api
api:3000     <- nginx
admin:5173   <- nginx (dev only)
nginx:80,443 <- internet
```

### Dependencias de Inicializacao
```
1. mysql (deve estar healthy)
2. ghost (depende de mysql)
3. api (depende de ghost e mysql)
4. admin (depende de api)
5. nginx (depende de todos)
```

---

## Logs e Monitoramento

### Acessar Logs
```bash
# Todos os servicos
docker compose logs -f

# Servico especifico
docker compose logs -f api

# Ultimas 100 linhas
docker compose logs --tail=100 ghost
```

### Localizacao dos Logs
| Servico | Local |
|---------|-------|
| Nginx | stdout/stderr + /var/log/nginx/ |
| Ghost | stdout/stderr |
| API | stdout/stderr |
| MySQL | stdout/stderr |

---

## Restart Policies

### Desenvolvimento
```yaml
restart: "no"  # Nao reinicia automaticamente
```

### Producao
```yaml
restart: unless-stopped  # Reinicia exceto se parado manualmente
```

---

## Recursos Recomendados

### Minimo (Desenvolvimento)
- CPU: 2 cores
- RAM: 4 GB
- Disco: 20 GB

### Producao (VPS)
- CPU: 4 cores
- RAM: 8 GB
- Disco: 50 GB SSD
- Banda: 1 TB/mes
