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
ghost:2368    <- nginx, api
api:3000      <- nginx
admin:80      <- nginx
redis:6379    <- api
loki:3100     <- promtail, grafana
grafana:3000  <- nginx (via /grafana/)
nginx:80,443  <- internet
```

### Dependencias de Inicializacao
```
1. mysql (deve estar healthy)
2. redis (independente)
3. ghost (depende de mysql)
4. api (depende de ghost, mysql, redis)
5. admin (depende de api)
6. loki (independente)
7. promtail (depende de loki)
8. grafana (depende de loki)
9. nginx (depende de ghost, api, admin, grafana)
```

---

## 6. Redis Cache

### Configuracao
| Atributo | Valor |
|----------|-------|
| Imagem | `redis:7-alpine` |
| Porta Interna | 6379 |
| Persistencia | RDB snapshots |

### Uso
- Cache de sessoes
- Cache de configuracoes
- Rate limiting (futuro)

---

## 7. Stack de Monitoramento

> Implementado em 25 Marco 2026

### Loki (Log Aggregation)
| Atributo | Valor |
|----------|-------|
| Imagem | `grafana/loki:3.1.0` |
| Porta Interna | 3100 |
| Retencao | 30 dias |
| Storage | Filesystem (`loki_data` volume) |

### Promtail (Log Collector)
| Atributo | Valor |
|----------|-------|
| Imagem | `grafana/promtail:3.1.0` |
| Funcao | Coleta logs dos containers Docker |
| Descoberta | Via Docker socket |

### Grafana (Visualization)
| Atributo | Valor |
|----------|-------|
| Imagem | `grafana/grafana:10.2.0` |
| Porta Externa | 3002 |
| Acesso | `/grafana/` no admin subdomain |
| Storage | `grafana_data` volume |

### Arquitetura de Monitoramento
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  Ghost  │  │   API   │  │  Nginx  │  │  MySQL  │
│  :2368  │  │  :3000  │  │  :80    │  │  :3306  │
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │            │            │
     └────────────┴────────────┴────────────┘
                       │
                       ▼
              ┌──────────────┐
              │   Promtail   │  (Coleta logs via Docker socket)
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │     Loki     │  (Armazena e indexa logs)
              │    :3100     │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │   Grafana    │  (Dashboards e visualizacao)
              │    :3002     │
              └──────────────┘
```

---

## Logs e Monitoramento

### Via Grafana (Recomendado)
- URL: https://admin.jornalinvestigador.pt/grafana/
- Dashboard: "O Investigador - Logs Overview"
- Filtros por servico, busca por texto, time range

### Via Docker (CLI)
```bash
# Todos os servicos
docker compose logs -f

# Servico especifico
docker compose logs -f api

# Ultimas 100 linhas
docker compose logs --tail=100 ghost
```

### Localizacao dos Logs
| Servico | Local | Agregado no Loki |
|---------|-------|------------------|
| Nginx | stdout/stderr | Sim |
| Ghost | stdout/stderr | Sim |
| API | stdout/stderr | Sim |
| MySQL | stdout/stderr | Sim |
| Redis | stdout/stderr | Sim |
| Loki | stdout/stderr | Nao |
| Promtail | stdout/stderr | Nao |
| Grafana | stdout/stderr | Nao |

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

### Consumo por Servico (Estimado)

| Servico | RAM | CPU | Disco |
|---------|-----|-----|-------|
| MySQL | 512MB | 0.5 | Variavel |
| Ghost | 256MB | 0.25 | Variavel |
| API | 256MB | 0.25 | Minimo |
| Admin | 64MB | 0.1 | Minimo |
| Redis | 64MB | 0.1 | Minimo |
| Nginx | 32MB | 0.1 | Minimo |
| Loki | 256MB | 0.25 | ~1GB/mes logs |
| Promtail | 128MB | 0.1 | Minimo |
| Grafana | 256MB | 0.25 | ~100MB |
| **TOTAL** | **~1.8GB** | **~2** | **~2GB/mes** |
