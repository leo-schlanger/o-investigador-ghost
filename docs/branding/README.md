# O Investigador — Identidade Visual

Documentação completa da identidade visual do projeto O Investigador.

## Conteúdo

- [Brandbook Completo](brandbook.md) — Manual de identidade visual
- [Paleta de Cores](brandbook.md#paleta-de-cores) — Cores primárias, accent, neutras e de tipo
- [Tipografia](brandbook.md#tipografia) — Famílias tipográficas e hierarquia
- [Logo](brandbook.md#logo) — Especificações, variações e uso
- [Badges de Tipo](brandbook.md#badges-de-tipo-de-artigo) — Crónica, Reportagem, Opinião
- [Referências](brandbook.md#referencias-e-inspiracoes) — Publicações e padrões de referência

## Logo (ficheiros vetorizados)

Wordmark oficial — texto em curvas (SVG, independente de fontes) e PNG transparente.
Réplica exata do cabeçalho do site. Ver [Brandbook §4.6](brandbook.md#46-ficheiros-oficiais-vetorizados).

| Ficheiro | Variação | Fundo |
|----------|----------|-------|
| `logo-oficial.svg` / `.png` | Branca | Navy / escuro (versão do site) |
| `logo-oficial-dark.svg` / `.png` | Navy | Branco / claro |

Disponíveis em `docs/branding/` e `ghost-theme/assets/images/`.
Para favicon / ícone de app usar a **lupa** (`logo-square.svg`, `favicon.svg`), não o wordmark.

## Ficheiros Técnicos

| Ficheiro | Localização | Descrição |
|----------|-------------|-----------|
| `tailwind.config.js` | `ghost-theme/` | Definição das cores, fontes e tokens |
| `index.css` | `ghost-theme/assets/css/` | Estilos base e imports de fontes |
| `default.hbs` | `ghost-theme/` | Carregamento de fontes e meta tags |
| `header.hbs` | `ghost-theme/partials/` | Logo, navegação, top bar |
| `footer.hbs` | `ghost-theme/partials/` | Logo footer, links, copyright |
| `post-card.hbs` | `ghost-theme/partials/` | Badges de tipo e categoria |
| `post.hbs` | `ghost-theme/` | Badge de tipo na página do artigo |
