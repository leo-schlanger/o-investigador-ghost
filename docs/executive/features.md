# Funcionalidades - O Investigador

## Visao Geral das Funcionalidades

Este documento lista todas as funcionalidades disponiveis na plataforma, organizadas por modulo.

---

## 1. Site Publico (Portal de Noticias)

### Navegacao e Layout
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Homepage | Ativo | Pagina inicial com destaques e ultimas noticias |
| Categorias | Ativo | Secoes: Politica, Economia, Justica, Internacional, etc. |
| Pagina de Artigo | Ativo | Exibicao completa de noticias |
| Pagina de Autor | Ativo | Perfil e artigos de cada jornalista |
| Pagina de Tag | Ativo | Agrupamento por tematica |
| Menu Mobile | Ativo | Navegacao responsiva para celulares |
| Social Icons Header | Ativo | Links para redes sociais no topo |
| Data no Header | Ativo | Data atual em formato portugues |

### Interacao
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Sistema de Busca | Ativo | Pesquisa de artigos por titulo e conteudo |
| Artigos Relacionados | Ativo | Sugestoes no final de cada artigo |
| Compartilhamento Social | Ativo | Botoes Facebook, X, WhatsApp, LinkedIn, Email |
| Bio do Autor | Ativo | Perfil do autor no final dos artigos |
| Trending News | Ativo | Carrossel de noticias em destaque |
| Comentarios | Planejado | Sistema de comentarios moderados |

### Engajamento
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Newsletter | Ativo | Assinatura via Ghost Members |
| Formulario de Contato | Ativo | Comunicacao direta com a redacao |
| Portal de Membros | Ativo | Login/cadastro de assinantes |

### SEO e Performance
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Meta Tags SEO | Ativo | Open Graph, Twitter Cards |
| Schema.org JSON-LD | Ativo | Dados estruturados para Google |
| Sitemap XML | Ativo | Mapa do site para indexacao |
| AMP | Planejado | Paginas aceleradas para mobile |

---

## 2. Painel Administrativo

### Dashboard
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Visao Geral | Ativo | Resumo de artigos, usuarios e metricas |
| Estatisticas | Parcial | Visualizacoes de posts mais lidos |
| Graficos | Planejado | Visualizacao grafica de metricas |

### Gerenciamento de Conteudo
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Lista de Artigos | Ativo | Visualizacao e filtros |
| Editor de Artigos | Ativo | Criacao via EditorJS |
| Rascunhos | Ativo | Salvamento automatico |
| Agendamento | Ativo | Publicacao programada |
| Paginas Estaticas | Ativo | Sobre, Contato, etc. |

### Biblioteca de Midia
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Upload de Imagens | Ativo | Suporte a JPG, PNG, GIF, WebP |
| Galeria | Ativo | Visualizacao de todas as midias |
| Organizacao | Planejado | Pastas e tags para arquivos |

### Configuracoes
| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Anuncios | Ativo | Gerenciamento de Google AdSense |
| Navegacao | Ativo | Configuracao de menus |
| Tags | Ativo | Gerenciamento de categorias |
| Usuarios | Ativo | Controle de acesso da equipe |

---

## 3. Sistema de Anuncios

| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Ativar/Desativar Ads | Ativo | Controle global de exibicao |
| Google AdSense | Ativo | Integracao com AdSense |
| Slots de Anuncio | Ativo | Header, Sidebar, In-Article, Footer |
| Configuracao por Slot | Ativo | ID e formato de cada posicao |

---

## 4. Sistema de Analytics

| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Contagem de Views | Ativo | Rastreamento de visualizacoes por post |
| Posts Mais Lidos | Ativo | Ranking de popularidade |
| Filtro por Periodo | Ativo | Dia, semana, mes, total |
| Google Analytics | Planejado | Integracao com GA4 |

---

## 5. Autenticacao e Seguranca

| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Login JWT | Ativo | Autenticacao segura com tokens |
| Roles de Usuario | Ativo | Admin, Editor, Redator |
| Rate Limiting | Ativo | Protecao contra abuso |
| HTTPS/SSL | Ativo | Comunicacao criptografada |
| Backup Automatico | Ativo | Cron job diario as 3h |

---

## 6. Integracao com Ghost CMS

| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Sincronizacao de Posts | Ativo | API Admin para CRUD |
| Gestao de Tags | Ativo | Categorias sincronizadas |
| Gestao de Autores | Ativo | Perfis de jornalistas |
| Newsletter Ghost | Ativo | Sistema nativo de membros |
| Preview de Artigos | Ativo | Visualizacao antes de publicar |

---

## 7. Infraestrutura e DevOps

| Funcionalidade | Status | Descricao |
|----------------|--------|-----------|
| Docker Compose | Ativo | Orquestracao de containers |
| CI/CD GitHub Actions | Ativo | Testes e deploy automaticos |
| Nginx Reverse Proxy | Ativo | Roteamento e SSL |
| Health Checks | Ativo | Verificacao de saude dos servicos |
| Rollback | Ativo | Reversao de deploy com problemas |

---

## Legenda de Status

- **Ativo:** Funcionalidade implementada e em uso
- **Parcial:** Implementado mas com melhorias pendentes
- **Planejado:** Previsto para implementacao futura

---

## Solicitacao de Novas Funcionalidades

Para solicitar novas funcionalidades, consulte o [Guia de Contribuicao](../planning/CONTRIBUTING.md) ou entre em contato com a equipe de desenvolvimento.
