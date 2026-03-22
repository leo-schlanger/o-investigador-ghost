# TODO - Pendencias e Tarefas

> **Ultima atualizacao:** Marco 2026

Este documento lista todas as tarefas pendentes, melhorias planejadas e bugs conhecidos.

---

## Legenda de Prioridade

| Icone | Nivel | Descricao |
|-------|-------|-----------|
| P0 | Critico | Bloqueia uso, deve ser feito imediatamente |
| P1 | Alta | Importante para proxima release |
| P2 | Media | Desejavel, mas pode esperar |
| P3 | Baixa | Nice to have, backlog |

---

## Bugs Conhecidos

### P1 - Alta Prioridade

- [ ] **Search: API Key nao configurada automaticamente**
  - O sistema de busca requer configuracao manual da Content API Key
  - Workaround: Configurar via localStorage ou meta tag
  - Arquivo: `ghost-theme/assets/js/search.js`

### P2 - Media Prioridade

- [ ] **Mobile: Menu fecha ao clicar fora nao funciona consistentemente**
  - Em alguns dispositivos o overlay nao fecha o menu
  - Arquivo: `ghost-theme/partials/header.hbs`

- [ ] **Admin: Toast notifications nao aparecem em erros de rede**
  - Quando a API esta offline, nao ha feedback visual
  - Arquivo: `admin-panel/src/services/api.js`

### P3 - Baixa Prioridade

- [ ] **SEO: Schema.org pode gerar JSON invalido com caracteres especiais**
  - Titulos com aspas podem quebrar o JSON-LD
  - Arquivo: `ghost-theme/partials/schema.hbs`

---

## Features Pendentes

### P1 - Alta Prioridade

- [ ] **Testes E2E**
  - Implementar testes end-to-end com Playwright ou Cypress
  - Cobrir fluxos criticos: login, publicacao, busca
  - Estimativa: Configuracao + 10 testes basicos

- [ ] **Cache Redis**
  - Implementar cache para melhorar performance
  - Cachear: configuracoes, posts populares, sessoes
  - Requer: Adicionar Redis ao docker-compose

- [ ] **Monitoramento Dashboard**
  - Criar dashboard com metricas operacionais
  - Tecnologia sugerida: Grafana + Prometheus
  - Metricas: requests, erros, latencia, recursos

### P2 - Media Prioridade

- [ ] **PWA (Progressive Web App)**
  - Adicionar manifest.json
  - Implementar service worker
  - Suporte offline basico
  - Arquivo a criar: `ghost-theme/assets/js/sw.js`

- [ ] **Dark Mode**
  - Implementar tema escuro
  - Toggle no header
  - Persistir preferencia
  - Arquivos: `ghost-theme/assets/css/`, header.hbs

- [ ] **Sistema de Comentarios**
  - Opcoes: Disqus, Commento, ou custom
  - Moderacao pelo admin
  - Notificacao por email

- [x] **Botoes de Compartilhamento Social** (Implementado 22 Mar 2026)
  - Facebook, Twitter/X, WhatsApp, LinkedIn, Email, Copiar Link
  - Arquivo: `ghost-theme/partials/share-buttons.hbs`

- [ ] **Google Analytics Integration**
  - Configuracao via admin panel
  - Suporte a GA4
  - Respeitar cookies/LGPD

- [ ] **Paginacao Melhorada**
  - Infinite scroll ou
  - Numeracao de paginas visivel
  - Arquivos: index.hbs, tag.hbs, author.hbs

### P3 - Baixa Prioridade

- [ ] **AMP (Accelerated Mobile Pages)**
  - Template amp.hbs
  - Validacao Google
  - Links canonicos

- [ ] **RSS Feeds por Categoria**
  - Feed separado por tag
  - Configuravel

- [ ] **Modo de Leitura**
  - Simplificar layout para leitura
  - Esconder sidebar e ads
  - Aumentar fonte

- [ ] **Estimativa de Tempo de Leitura**
  - Ja existe no Ghost, melhorar exibicao
  - Adicionar progress bar no scroll

- [ ] **Posts Relacionados Inteligentes**
  - Melhorar algoritmo atual
  - Considerar tags, autor, data
  - Machine learning (futuro)

- [ ] **Notificacoes Push**
  - Web Push API
  - Opt-in para novos posts
  - Requer HTTPS

---

## Melhorias Tecnicas

### P1 - Alta Prioridade

- [ ] **Migracoes Sequelize**
  - Substituir sync por migracoes
  - Criar historico de mudancas de schema
  - Script de rollback de schema

- [ ] **Logs Estruturados**
  - Padronizar formato de logs
  - Adicionar correlation IDs
  - Facilitar debugging

- [ ] **Health Checks Detalhados**
  - Verificar cada dependencia
  - Retornar status individual
  - Endpoint: /health/detailed

### P2 - Media Prioridade

- [ ] **TypeScript Backend**
  - Migrar API para TypeScript
  - Adicionar tipos para models
  - Melhorar autocomplete e catch de erros

- [ ] **API Versioning**
  - Implementar /api/v1/, /api/v2/
  - Manter compatibilidade

- [ ] **Rate Limiting Granular**
  - Limites por endpoint
  - Limites por usuario autenticado
  - Dashboard de uso

- [ ] **Documentacao API (Swagger)**
  - Gerar OpenAPI spec
  - UI interativa
  - Exemplos de uso

### P3 - Baixa Prioridade

- [ ] **GraphQL**
  - Adicionar endpoint GraphQL
  - Manter REST como principal
  - Para queries flexiveis

- [ ] **Websockets**
  - Atualizacoes em tempo real
  - Notificacoes live
  - Editor colaborativo (futuro)

---

## Infraestrutura

### P1 - Alta Prioridade

- [ ] **Alertas Automaticos**
  - Configurar alertas para:
    - Site down
    - Erros 5xx
    - Disco > 90%
    - Backup falhou
  - Integracao: Email, Slack

- [ ] **CDN para Assets**
  - Configurar Cloudflare ou similar
  - Cache de imagens e CSS/JS
  - Reduzir carga no servidor

### P2 - Media Prioridade

- [ ] **Staging Environment**
  - Ambiente de testes pre-producao
  - Deploy automatico de develop
  - Dados anonimizados

- [ ] **Blue-Green Deployment**
  - Zero downtime deploys
  - Rollback instantaneo
  - Requer mais recursos

### P3 - Baixa Prioridade

- [ ] **Kubernetes**
  - Migrar de Docker Compose
  - Auto-scaling
  - Self-healing
  - Complexidade maior

---

## Documentacao

### P2 - Media Prioridade

- [ ] **Video Tutoriais**
  - Criar videos para:
    - Setup inicial
    - Publicar artigo
    - Configurar anuncios
  - Hospedar no YouTube ou Loom

- [ ] **FAQ**
  - Perguntas frequentes
  - Troubleshooting comum
  - Atualizar baseado em tickets

### P3 - Baixa Prioridade

- [ ] **Documentacao em Ingles**
  - Traduzir docs principais
  - README bilingual

- [ ] **Changelog Automatico**
  - Gerar a partir de commits
  - Formato Keep a Changelog

---

## Debitos Tecnicos

### P1 - Alta Prioridade

- [ ] **Dependencias Desatualizadas**
  - Rodar npm audit regularmente
  - Atualizar pacotes com vulnerabilidades
  - Testar apos atualizacoes

- [ ] **Codigo Duplicado**
  - Refatorar helpers repetidos
  - Criar biblioteca compartilhada
  - Admin panel + API

### P2 - Media Prioridade

- [ ] **Cobertura de Testes**
  - Backend: Atingir 70%
  - Frontend: Atingir 60%
  - Adicionar testes para novos features

- [ ] **Error Handling Consistente**
  - Padronizar respostas de erro
  - Mensagens amigaveis
  - Logging adequado

### P3 - Baixa Prioridade

- [ ] **Code Review Automatizado**
  - Configurar ESLint no CI
  - Prettier para formatacao
  - Husky para pre-commit

---

## Contribuicoes Bem-vindas

Se voce quer contribuir, estas tarefas sao bons pontos de entrada:

1. **Documentacao** - Melhorar guias existentes
2. **Testes** - Adicionar testes unitarios
3. **Bugs P3** - Corrigir issues menores
4. **CSS** - Ajustes de responsividade

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para instrucoes.

---

## Como Adicionar Tarefas

1. Identifique a categoria (Bug, Feature, Tecnico, Infra, Docs)
2. Defina a prioridade (P0-P3)
3. Descreva claramente o problema/solucao
4. Adicione arquivos relevantes
5. Atualize este documento

---

## Historico

| Data | Mudanca |
|------|---------|
| 22 Mar 2026 | Sistema de busca aprimorado (historico, highlight, teclado) |
| 22 Mar 2026 | Subcategorias implementadas (Sociedade, Ambiente, Saude, Educacao) |
| 22 Mar 2026 | Secao Magazine criada com template dedicado |
| 22 Mar 2026 | Widget de clima (Lisboa) implementado |
| 22 Mar 2026 | Autor no final dos artigos implementado |
| 22 Mar 2026 | Trending News carousel implementado |
| 22 Mar 2026 | Social icons no header implementado |
| 22 Mar 2026 | Botoes de compartilhamento implementados |
| 22 Mar 2026 | Widget de data no header implementado |
| Mar 2026 | Sistema de busca implementado |
| Mar 2026 | SEO Schema.org adicionado |
| Mar 2026 | Pagina de contato criada |
| Mar 2026 | Backup automatizado configurado |
| Mar 2026 | Documentacao completa criada |
