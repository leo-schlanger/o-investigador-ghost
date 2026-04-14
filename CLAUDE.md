# O Investigador - Contexto do Projeto

## Stack
- **CMS:** Ghost 5 (Alpine)
- **API:** Node.js + Express
- **Admin Panel:** React + Vite + TailwindCSS
- **Database:** MySQL 8
- **Proxy:** Nginx
- **Containers:** Docker Compose

## URLs de Produção
- **Site:** https://jornalinvestigador.pt
- **Admin Panel:** https://admin.jornalinvestigador.pt
- **API:** https://api.jornalinvestigador.pt
- **Ghost Admin:** https://jornalinvestigador.pt/ghost
- **Logs (Grafana):** https://admin.jornalinvestigador.pt/grafana/

## Deploy
- **AUTOMÁTICO via GitHub Actions** - NÃO fazer build manual no servidor
- Push para `main` → GitHub Actions faz deploy automaticamente
- Workflow: `.github/workflows/deploy.yml`

## Servidor (apenas para debug se necessário)
- Host: srv.jornalinvestigador.pt
- Path: /opt/o-investigador

## Estrutura do Projeto
```
ghost-theme/        → Tema Ghost (Handlebars)
cms-api/            → API Node.js/Express
admin-panel/        → React admin (Vite)
infrastructure/     → Docker, nginx, scripts
docs/               → Documentação
```

## Variáveis de Ambiente
- Arquivo `.env` na raiz
- `GHOST_API_KEY` - Content API key do Ghost
- `GHOST_ADMIN_API_KEY` - Admin API key do Ghost (formato: id:secret)
- `GRAFANA_ADMIN_PASSWORD` - Senha do admin do Grafana
- `RECAPTCHA_SECRET_KEY` - (Opcional) reCAPTCHA v3 secret para formulário de contacto
- `REDIS_PASSWORD` - (Opcional) Senha do Redis para autenticação
- Variáveis `VITE_*` são injetadas no build time do admin panel

## Tipos de Artigo
O sistema suporta 3 tipos de artigo:
- **Cronica** (badge roxo)
- **Reportagem** (badge azul)
- **Opiniao** (badge laranja)

Implementação via tags especiais no Ghost:
- Tags com prefixo `Tipo: ` (ex: `Tipo: Cronica`, slug: `tipo-cronica`)
- Selecionável no editor de artigos do admin panel
- Exibido com badges coloridos no tema

## Categorias de Navegação
Categorias definidas em `ghost-theme/routes.yaml`:
- `/politica/`, `/economia/`, `/justica/`
- `/internacional/`, `/tecnologia/`, `/cultura/`
- `/investigacoes/`

**IMPORTANTE:** Após alterar `routes.yaml`, fazer upload manual:
1. Acessar: https://jornalinvestigador.pt/ghost/#/settings/labs
2. Em Routes, clicar Upload routes YAML
3. Selecionar `ghost-theme/routes.yaml`

Para criar as tags de categoria: `POST /api/tags/init-categories`

## Funcionalidades do Admin Panel

### Foto de Perfil (Avatar)
- Upload de foto na página Meu Perfil
- Exibido no sidebar
- Campo `avatar` no modelo User (migration automática)

### Gestão de Newsletter
- Integração com Brevo (SendGrid alternativo)
- Campanhas com editor de blocos
- Listas de subscritores

### Biblioteca de Mídias (Media Library)
Organização avançada de ficheiros com pastas e tags:

**Pastas**
- Hierárquicas (subpastas suportadas)
- Criar, renomear, eliminar via sidebar
- Eliminar pasta move conteúdo para pasta pai
- Filtrar media por pasta

**Tags**
- Múltiplas tags por imagem
- Autocomplete com sugestões
- Criar tags inline ao adicionar
- Filtrar media por tags (combinável)

**Pesquisa**
- Por nome de ficheiro
- Combinável com filtros de pasta e tags

**Operações em Lote**
- Multi-seleção (Ctrl+click ou modo seleção)
- Mover múltiplos ficheiros para pasta

**API Endpoints**
- `GET/POST /api/media/folders` - CRUD pastas
- `GET/POST /api/media/tags` - CRUD tags
- `GET /api/media/tags/suggestions?q=` - Autocomplete
- `GET /api/media?folderId=&tags=&search=` - Listar com filtros
- `PUT /api/media/:id` - Atualizar media (tags, pasta)
- `PUT /api/media/bulk-move` - Mover múltiplos

**Modelos de Dados**
- `MediaFolder` - Pastas hierárquicas (parentId)
- `MediaTag` - Tags com nome e slug únicos
- `MediaTagAssignment` - Relação N:N entre Media e Tags
- `Media` - Campo folderId adicionado

## Monitoring (Grafana + Loki + Promtail)

Sistema de monitoramento centralizado de logs para todos os containers.

**Stack:**
- **Loki 3.1.0** - Agregação e armazenamento de logs (30 dias de retenção)
- **Promtail 3.1.0** - Coleta logs de todos os containers Docker automaticamente
- **Grafana 10.2.0** - Visualização e dashboards

**Acesso:**
- URL: https://admin.jornalinvestigador.pt/grafana/
- Usuário: admin
- Senha: Definida em `GRAFANA_ADMIN_PASSWORD` (usar `$$` para escapar `$` no .env)

**Configuração:**
```
infrastructure/monitoring/
├── loki-config.yml           → Configuração do Loki
├── promtail-config.yml       → Configuração do Promtail
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── loki.yml      → Auto-configura Loki como datasource
    │   └── dashboards/
    │       └── dashboard.yml → Auto-importa dashboards
    └── dashboards/
        └── logs-overview.json → Dashboard pré-configurado
```

**Dashboard pré-configurado:** "O Investigador - Logs Overview"
- Volume de logs por serviço
- Distribuição de logs (pie chart)
- Contadores de erros e warnings
- Live logs com filtros
- Logs de erro de todos os serviços

**Queries úteis no Grafana (LogQL):**
```
# Logs de um serviço específico
{compose_service="api"}

# Buscar erros
{compose_service=~".+"} |~ "(?i)error"

# Logs do Ghost
{compose_service="ghost"}

# Filtrar por texto
{compose_service="api"} |= "POST /api"

# Logs dos últimos 5 minutos com erro
{compose_service=~".+"} |~ "(?i)(error|exception|fatal)"
```

**Troubleshooting:**
- Se Promtail não coleta logs: verificar versão (requer 3.x+ para Docker 29+)
- Se Grafana dá 503: rate limiting do nginx, verificar logs
- Se senha não funciona: resetar via `docker exec grafana grafana-cli admin reset-admin-password NOVA_SENHA`

## Audit Logging
- Modelo `AuditLog` registra ações críticas (login, CRUD users/articles/media/settings)
- Middleware `auditMiddleware.js` captura automaticamente nas rotas
- Endpoint: `GET /api/audit-logs` (admin only) - consultar logs
- Tabela: `audit_logs` (user_id, action, resource, resource_id, details, ip, created_at)

## reCAPTCHA v3 (Formulário de Contacto)
- Backend valida token se `RECAPTCHA_SECRET_KEY` configurado
- Frontend carrega script se meta tag `recaptcha-site-key` presente
- Configurar site key via Ghost Admin > Code Injection: `<meta name="recaptcha-site-key" content="YOUR_KEY">`
- Score threshold: 0.5 (rejeita bots)
- Honeypot mantido como camada adicional

## Dark Mode (Admin Panel)
- Toggle no header mobile (Sun/Moon icon)
- Persistido em localStorage
- ThemeContext em `admin-panel/src/context/ThemeContext.jsx`
- Tailwind `darkMode: 'class'` habilitado

## Backup & Restore
- Backup: `infrastructure/scripts/backup.sh` (automático via cron às 3h)
- Restore: `infrastructure/scripts/restore.sh <file.sql.gz>`

## Observações Importantes
- Editar código LOCALMENTE, não no servidor
- Confiar no deploy automático após push
- Ghost theme usa routes.yaml para roteamento customizado
- Sistema de membros Ghost reativado no header (login/signup/account)
