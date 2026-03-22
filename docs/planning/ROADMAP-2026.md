# Roadmap de Melhorias 2026

> **Ultima atualizacao:** 22 Marco 2026
> **Objetivo:** Identificar oportunidades de melhoria para O Investigador baseado em tendencias e funcionalidades do mercado

---

## Checklist de Implementacao

### Melhorias P1 (Alta Prioridade) - CONCLUIDO
- [x] **Autor no final dos artigos** - Foto de perfil, nome, bio e link para pagina do autor
- [x] **Trending News / Carrossel** - Barra "Agora" com noticias em destaque rotacionando
- [x] **Social Icons no Header** - Facebook, Instagram, X/Twitter, YouTube
- [x] **Botoes de Compartilhamento** - Facebook, X, WhatsApp, LinkedIn, Email, Copiar Link
- [x] **Widget de Data** - Data atual em formato portugues no header

### Melhorias P2 (Media Prioridade) - PENDENTE
- [ ] Sistema de Pesquisa Aprimorado (AJAX preview)
- [ ] Subcategorias e Navegacao Expandida
- [ ] Secao Magazine / Reportagens Especiais
- [ ] Dark Mode
- [ ] Sistema de Membros/Assinantes Ativo

### Melhorias P3 (Baixa Prioridade) - PENDENTE
- [ ] Secao de Agenda/Eventos
- [ ] Secao de Video/Multimedia
- [ ] Podcast Integration
- [ ] Notificacoes Push

---

## Resumo Executivo

Este documento apresenta uma analise comparativa entre O Investigador e portais de referencia, identificando funcionalidades que podem ser implementadas para melhorar a experiencia do usuario e competitividade do portal.

---

## 1. Melhorias de Alta Prioridade (P1) - IMPLEMENTADAS

### 1.1 Trending News / Noticias em Destaque
**Status:** IMPLEMENTADO (22 Mar 2026)

**O que foi feito:**
- Barra "Agora" no topo da homepage
- Carrossel com 6 noticias em destaque (featured:true)
- Rotacao automatica a cada 4 segundos
- Controles de navegacao manual (setas)
- Pausa ao passar o mouse
- Tag visual com categoria do artigo

**Arquivos modificados:**
- `ghost-theme/index.hbs`

---

### 1.2 Integracao com Redes Sociais (Header)
**Status:** IMPLEMENTADO (22 Mar 2026)

**O que foi feito:**
- Barra superior com data e redes sociais
- Icons: Facebook, Instagram, X/Twitter, YouTube
- Design minimalista integrado ao header
- Visivel apenas em telas sm+

**Arquivos modificados:**
- `ghost-theme/partials/header.hbs`

**TODO futuro:** Tornar links configuraveis via admin panel

---

### 1.3 Botoes de Compartilhamento em Artigos
**Status:** IMPLEMENTADO (22 Mar 2026)

**O que foi feito:**
- Botoes no final do artigo (antes da bio do autor)
- Plataformas: Facebook, X/Twitter, WhatsApp, LinkedIn, Email
- Botao "Copiar Link" com feedback
- Design responsivo com botoes circulares coloridos

**Arquivos criados/modificados:**
- `ghost-theme/partials/share-buttons.hbs` (novo)
- `ghost-theme/post.hbs`

---

### 1.4 Widget de Data
**Status:** IMPLEMENTADO (22 Mar 2026)

**O que foi feito:**
- Data atual no header em formato portugues completo
- Exibido na barra superior junto com redes sociais
- Formato: "sexta-feira, 22 de Marco de 2026"

**Arquivos modificados:**
- `ghost-theme/partials/header.hbs`

**TODO futuro:** Adicionar temperatura via API (opcional)

---

## 2. Melhorias de Media Prioridade (P2)

### 2.1 Sistema de Pesquisa Aprimorado
**Status atual:** Busca basica implementada
**O que O Cidadao tem:** AJAX search com preview de resultados

**Proposta:**
- Preview de resultados enquanto digita
- Mostrar thumbnail, titulo e categoria
- Destacar termos buscados
- Sugestoes de busca populares
- Historico de buscas recentes (localStorage)

**Arquivos a modificar:**
- `ghost-theme/partials/search-modal.hbs`
- `ghost-theme/assets/js/search.js`
- `ghost-theme/assets/css/index.css`

**Esforco estimado:** Medio

---

### 2.2 Subcategorias e Navegacao Expandida
**Status atual:** 7 categorias principais
**O que O Cidadao tem:** 18+ categorias com subcategorias extensas

**Proposta:**
- Avaliar necessidade de novas categorias:
  - Ambiente (com sub: Biodiversidade)
  - Saude
  - Educacao
  - Desporto (se relevante)
- Menu dropdown para subcategorias
- Mega menu opcional para desktop

**Arquivos a modificar:**
- `ghost-theme/routes.yaml`
- `ghost-theme/partials/navigation.hbs`
- `admin-panel/src/pages/Settings.jsx`

**Esforco estimado:** Medio

---

### 2.3 Secao "Magazine" / Reportagens Especiais
**Status atual:** Nao implementado
**O que O Cidadao tem:** Secao Magazine com series editoriais

**Proposta:**
- Criar secao "Especiais" ou "Magazine"
- Permitir criacao de series/colecoes de artigos
- Visual diferenciado para reportagens longas
- Pagina dedicada para series em andamento

**Arquivos a modificar:**
- `ghost-theme/routes.yaml`
- `ghost-theme/magazine.hbs` (novo)
- `ghost-theme/series.hbs` (novo)

**Esforco estimado:** Alto

---

### 2.4 Dark Mode
**Status atual:** Planejado no TODO.md
**O que O Cidadao tem:** Indicios de suporte a dark mode

**Proposta:**
- Toggle no header
- Persistir preferencia em localStorage
- Respeitar preferencia do sistema (prefers-color-scheme)
- Transicao suave entre modos

**Arquivos a modificar:**
- `ghost-theme/assets/css/index.css`
- `ghost-theme/partials/header.hbs`
- `ghost-theme/assets/js/theme-toggle.js` (novo)

**Esforco estimado:** Medio

---

### 2.5 Sistema de Membros/Assinantes Ativo
**Status atual:** Temporariamente desabilitado
**O que O Cidadao tem:** Sistema de login/cadastro ativo

**Proposta:**
- Reativar sistema de membros do Ghost
- Implementar UI de login/cadastro
- Considerar conteudo exclusivo para membros
- Newsletter exclusiva para assinantes

**Arquivos a modificar:**
- `ghost-theme/partials/header.hbs`
- `ghost-theme/members/` (templates)

**Esforco estimado:** Medio

---

## 3. Melhorias de Baixa Prioridade (P3)

### 3.1 Secao de Agenda/Eventos
**Status atual:** Nao implementado
**O que O Cidadao tem:** Secao "Agenda" dedicada

**Proposta:**
- Pagina de eventos culturais/politicos
- Integracao com calendario
- Filtro por data e categoria
- Submissao de eventos pela comunidade

**Esforco estimado:** Alto

---

### 3.2 Secao de Video/Multimedia
**Status atual:** Nao implementado
**O que O Cidadao tem:** Secao Multimedia dedicada

**Proposta:**
- Pagina dedicada para conteudo em video
- Integracao com YouTube/Vimeo
- Player embutido nos artigos
- Galeria de videos

**Esforco estimado:** Medio

---

### 3.3 Podcast Integration
**Status atual:** Nao implementado
**O que O Cidadao tem:** Indicios de conteudo audio

**Proposta:**
- Player de podcast embutido
- Feed RSS para podcasts
- Pagina dedicada
- Integracao com Spotify/Apple Podcasts

**Esforco estimado:** Medio

---

### 3.4 Notificacoes Push
**Status atual:** Planejado no TODO.md
**O que O Cidadao tem:** Possivelmente implementado

**Proposta:**
- Web Push API
- Opt-in para novos artigos
- Notificacoes por categoria
- Painel de gestao no admin

**Esforco estimado:** Medio

---

## 4. Comparativo de Funcionalidades

| Funcionalidade | O Investigador | Referencia | Status |
|----------------|----------------|------------|--------|
| Autor no final do artigo | **Sim** | Sim | IMPLEMENTADO |
| Trending carousel | **Sim** | Sim | IMPLEMENTADO |
| Social icons header | **Sim** | Sim | IMPLEMENTADO |
| Botoes compartilhamento | **Sim** | Sim | IMPLEMENTADO |
| Data no header | **Sim** | Sim | IMPLEMENTADO |
| AJAX search preview | Nao | Sim | P2 - Pendente |
| Subcategorias | Nao | Extenso | P2 - Pendente |
| Secao Magazine | Nao | Sim | P2 - Pendente |
| Dark mode | Nao | Indicios | P2 - Pendente |
| Sistema membros | Desativado | Ativo | P2 - Pendente |
| Agenda/Eventos | Nao | Sim | P3 - Pendente |
| Multimedia/Video | Nao | Sim | P3 - Pendente |
| Podcasts | Nao | Indicios | P3 - Pendente |
| Push notifications | Nao | Possivelmente | P3 - Pendente |

---

## 5. Tendencias Web 2026 a Considerar

### 5.1 Performance e Core Web Vitals
- Otimizacao de LCP, FID, CLS
- Lazy loading de imagens
- Preload de recursos criticos
- CDN para assets estaticos

### 5.2 Acessibilidade (WCAG 2.2)
- Skip links
- Aria labels completos
- Contraste adequado
- Navegacao por teclado

### 5.3 Mobile-First
- Design responsivo (ja implementado)
- Touch targets adequados
- Gestos nativos (swipe, etc.)

### 5.4 AI e Personalizacao
- Recomendacoes personalizadas
- Resumos automaticos de artigos
- Busca semantica

---

## 6. Proximos Passos Recomendados

### Fase 1 (Imediato) - CONCLUIDA
1. [x] Implementar autor no final dos artigos
2. [x] Adicionar social icons no header
3. [x] Criar botoes de compartilhamento
4. [x] Implementar trending carousel
5. [x] Adicionar widget de data

### Fase 2 (Proximo mes)
6. [ ] Melhorar sistema de busca (AJAX preview)
7. [ ] Reativar sistema de membros
8. [ ] Implementar dark mode

### Fase 3 (Trimestre)
9. [ ] Criar secao de especiais/magazine
10. [ ] Adicionar subcategorias relevantes

### Fase 4 (Futuro)
11. [ ] Push notifications
12. [ ] Integracao multimedia
13. [ ] Sistema de eventos

---

## 7. Recursos Necessarios

| Item | Tipo | Prioridade |
|------|------|------------|
| OpenWeatherMap API Key | API Externa | Opcional |
| CDN (Cloudflare) | Infraestrutura | Recomendado |
| Analytics (GA4 ou Plausible) | Tracking | Recomendado |
| Push Notification Service | API Externa | Futuro |

---

## Notas Finais

Este roadmap deve ser revisado mensalmente e ajustado conforme feedback dos usuarios e prioridades editoriais. As implementacoes devem seguir os padroes ja estabelecidos no projeto:

- TailwindCSS para estilos
- Responsividade mobile-first
- Handlebars para templates Ghost
- React/Vite para admin panel
- Docker para infraestrutura

---

*Documento gerado em Marco 2026*
