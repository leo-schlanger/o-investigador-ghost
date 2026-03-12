# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semantico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Adicionado
- Sistema de busca com modal e integracao Ghost Content API
- SEO Schema.org JSON-LD para artigos, organizacao e breadcrumbs
- Pagina de contato com formulario funcional
- Integracao SendGrid para envio de emails
- Backup automatizado via cron job
- Documentacao completa do projeto (pasta docs/)

### Modificado
- default.hbs inclui agora search modal e schema partial
- public.js adiciona endpoint POST /api/public/contact
- DEPLOY.md expandido com instrucoes de backup

### Corrigido
- (nenhum nesta versao)

---

## [1.0.0] - 2026-03-01

### Adicionado
- Infraestrutura Docker completa (docker-compose)
- Ghost CMS 5.x integrado
- Tema customizado responsivo com TailwindCSS
- Painel administrativo React
- API Backend Node.js/Express
- Sistema de autenticacao JWT
- Gerenciamento de artigos via Ghost API
- Biblioteca de midia com upload
- Sistema de anuncios (Google AdSense)
- Configuracao de navegacao
- Gestao de tags e categorias
- Gestao de usuarios com roles
- Newsletter via Ghost Members
- CI/CD com GitHub Actions
- Deploy automatizado para VPS
- Scripts de deploy e rollback
- Health checks
- Rate limiting
- Protecao CORS
- SSL/HTTPS com Let's Encrypt

### Infraestrutura
- Nginx como reverse proxy
- MySQL 8 como banco de dados
- Volumes persistentes para dados
- Rede Docker isolada

---

## [0.5.0] - 2026-02-15

### Adicionado
- Estrutura inicial do projeto
- Configuracao Docker basica
- Tema Ghost inicial
- API com autenticacao

### Conhecido
- Busca nao implementada
- Backup manual apenas
- Documentacao incompleta

---

## [0.1.0] - 2026-02-01

### Adicionado
- Repositorio inicial
- README basico
- docker-compose de desenvolvimento
- Estrutura de pastas

---

## Tipos de Mudanca

- **Adicionado** para novas funcionalidades
- **Modificado** para mudancas em funcionalidades existentes
- **Obsoleto** para funcionalidades que serao removidas
- **Removido** para funcionalidades removidas
- **Corrigido** para correcao de bugs
- **Seguranca** para correcoes de vulnerabilidades

---

## Versionamento

Este projeto usa versionamento semantico:

- **MAJOR** (1.x.x): Mudancas incompativeis com versoes anteriores
- **MINOR** (x.1.x): Novas funcionalidades compativeis
- **PATCH** (x.x.1): Correcoes de bugs compativeis

---

## Links

- [Repositorio](https://github.com/...)
- [Issues](https://github.com/.../issues)
- [Releases](https://github.com/.../releases)
