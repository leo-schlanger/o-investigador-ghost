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
- `GHOST_API_KEY` deve estar configurado para API funcionar
- Variáveis `VITE_*` são injetadas no build time do admin panel

## Observações Importantes
- Editar código LOCALMENTE, não no servidor
- Confiar no deploy automático após push
- Ghost theme usa routes.yaml para roteamento customizado
