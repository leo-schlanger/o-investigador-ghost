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

## Observações Importantes
- Editar código LOCALMENTE, não no servidor
- Confiar no deploy automático após push
- Ghost theme usa routes.yaml para roteamento customizado
- Login de membros está temporariamente desabilitado (TODO no header.hbs)
