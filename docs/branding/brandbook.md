# O Investigador — Brandbook

Manual completo de identidade visual do jornal online O Investigador.

Versao: 1.0
Data: 15 de maio de 2026

---

## Indice

1. [Essencia da Marca](#1-essencia-da-marca)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Logo](#4-logo)
5. [Badges de Tipo de Artigo](#5-badges-de-tipo-de-artigo)
6. [Componentes Visuais](#6-componentes-visuais)
7. [Fotografia e Imagens](#7-fotografia-e-imagens)
8. [Tom de Voz](#8-tom-de-voz)
9. [Aplicacoes](#9-aplicacoes)
10. [Referencias e Inspiracoes](#10-referencias-e-inspiracoes)

---

## 1. Essencia da Marca

### Missao

O Investigador e um jornal online portugues dedicado ao jornalismo investigativo, analise critica e opiniao fundamentada. A identidade visual reflete os valores de **rigor**, **credibilidade**, **independencia** e **profundidade**.

### Personalidade da Marca

| Atributo | Expressao Visual |
|----------|-----------------|
| **Serio** | Paleta contida, tipografia serif, layouts limpos |
| **Credivel** | Navy profundo como cor de confianca, hierarquia clara |
| **Investigativo** | Vermelho accent para urgencia editorial, contraste forte |
| **Moderno** | Design digital-first, responsivo, acessivel |
| **Portugues** | Tons que evocam a bandeira e a cultura portuguesa |

### Palavras-Chave Visuais

```
Autoridade · Profundidade · Clareza · Confianca · Rigor · Urgencia
```

---

## 2. Paleta de Cores

### 2.1 Cores da Marca

#### Primaria — Navy Profundo

O navy e a cor que ancora toda a identidade visual. Transmite **confianca**, **autoridade** e **seriedade** — os mesmos valores usados por publicacoes como The Guardian (`#052962`) e ProPublica (`#304154`).

| Token | Hex | Uso |
|-------|-----|-----|
| `brand-light` | `#1a4f8a` | Hovers, links ativos |
| **`brand`** | **`#0d345e`** | **Cor primaria da marca** |
| `brand-dark` | `#071d38` | Header, footer, fundos escuros |

```css
/* Aplicacao */
--brand-light: #1a4f8a;
--brand: #0d345e;
--brand-dark: #071d38;
```

#### Accent — Vermelho Editorial

O vermelho funciona como cor de **urgencia**, **destaque** e **acao**. Reservado para elementos que exigem atencao imediata: breaking news, botoes primarios, acentos de seccao.

| Token | Hex | Uso |
|-------|-----|-----|
| **`brand-accent`** | **`#c0392b`** | **Destaques, botoes, breaking news** |

```css
--brand-accent: #c0392b;
```

**Regra de uso:** O vermelho accent deve ser usado com moderacao. Nunca para fundos grandes. Sempre como ponto focal de atencao.

### 2.2 Escala Primaria (Navy)

Escala de 11 tons derivados do navy principal, para criar profundidade e hierarquia.

| Token | Hex | Exemplo de Uso |
|-------|-----|----------------|
| `primary-50` | `#f0f5fb` | Fundos de badges, cards hover |
| `primary-100` | `#dce8f4` | Fundos de seccoes alternadas |
| `primary-200` | `#b9d0e8` | Texto secundario sobre navy, tagline |
| `primary-300` | `#8fb4d9` | Titulos de footer, labels |
| `primary-400` | `#5e92c5` | Icones secundarios |
| `primary-500` | `#3670aa` | Links em texto, elementos interativos |
| `primary-600` | `#1c5790` | Links hover |
| `primary-700` | `#134577` | Texto enfatizado |
| `primary-800` | `#0d345e` | = `brand` (cor principal) |
| `primary-900` | `#092848` | Titulos fortes |
| `primary-950` | `#051a32` | Maximo contraste |

### 2.3 Escala Accent (Vermelho)

| Token | Hex | Uso |
|-------|-----|-----|
| `accent-50` | `#fdf2f1` | Fundo de badge Opiniao |
| `accent-100` | `#fbe0dd` | Alertas leves |
| `accent-200` | `#f5b7b1` | Bordas de destaque |
| `accent-500` | `#c0392b` | = `brand-accent` |
| `accent-600` | `#a63125` | Hover do accent |
| `accent-700` | `#89281f` | Accent pressionado |

### 2.4 Escala Neutra

| Token | Hex | Uso |
|-------|-----|-----|
| `neutral-50` | `#f8f9fb` | Fundo alternado (sidebar, cards) |
| `neutral-100` | `#f0f2f5` | Fundo de cards |
| `neutral-200` | `#e1e5ea` | Bordas, separadores |
| `neutral-300` | `#c8ced7` | Bordas de input |
| `neutral-400` | `#9aa3b0` | Placeholder, texto terciario |
| `neutral-500` | `#6b7685` | Texto secundario |
| `neutral-600` | `#4d5766` | Texto de suporte |
| `neutral-700` | `#3a4250` | Texto normal |
| `neutral-800` | `#2a303b` | Texto forte |
| `neutral-900` | `#1a1f28` | Titulos, texto principal |
| `neutral-950` | `#0f1318` | Preto suave |

### 2.5 Cores de Tipo de Artigo

Os badges de tipo usam cores derivadas da paleta da marca para manter coesao visual.

| Tipo | Fundo | Texto | Identidade |
|------|-------|-------|-----------|
| **Cronica** | `#F3E8FF` | `#7C3AED` | Roxo — reflexao, profundidade pessoal |
| **Reportagem** | `#f0f5fb` | `#0d345e` | Navy (brand) — rigor, investigacao |
| **Opiniao** | `#fdf2f1` | `#c0392b` | Vermelho (accent) — posicao, debate |

**Justificacao:**
- **Cronica** mantem o roxo pois representa a dimensao pessoal e literaria que distingue a cronica dos outros generos
- **Reportagem** usa o navy da marca porque e o genero central do jornal — a investigacao e a razao de existir
- **Opiniao** usa o vermelho accent porque a opiniao e posicao, e afirmacao, requer a cor de urgencia e destaque

---

## 3. Tipografia

### 3.1 Familias Tipograficas

O sistema tipografico usa tres familias com funcoes distintas:

#### Display — Playfair Display

```
Familia: Playfair Display
Tipo: Serif, alto contraste
Pesos: 700 (Bold), 800 (ExtraBold), 900 (Black)
Uso: Logo, wordmark, titulos de destaque
```

Playfair Display foi escolhida para o logo e elementos de destaque por:
- Serifs refinadas que transmitem **autoridade e tradicao** jornalistica
- Alto contraste entre tracos finos e grossos que cria **elegancia**
- Alinhamento com a pratica de publicacoes de referencia (Publico, Guardian, NYT usam serif nos logos)
- Disponivel gratuitamente no Google Fonts

#### Headline — Merriweather

```
Familia: Merriweather
Tipo: Serif, otimizada para ecra
Pesos: 400, 700 (Bold), 900 (Black)
Estilos: Normal, Italico
Uso: Titulos de artigos, h1-h3, citacoes
```

Merriweather foi desenhada especificamente para leitura em ecra:
- Altura-x generosa para legibilidade em tamanhos pequenos
- Serifs robustas que sobrevivem a renderizacao em ecra
- Contraste moderado que funciona em qualquer dispositivo

#### Body — Inter

```
Familia: Inter
Tipo: Sans-serif, otimizada para UI
Pesos: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
Uso: Texto corrido, navegacao, labels, metadados, UI
```

Inter e a escolha padrao para texto corrido digital:
- Desenhada por Rasmus Andersson para interfaces digitais
- Legibilidade excepcional em tamanhos 14-18px
- Amplo suporte de caracteres (incluindo portugues completo)

### 3.2 Hierarquia Tipografica

| Nivel | Fonte | Peso | Tamanho (desktop) | Uso |
|-------|-------|------|-------------------|-----|
| Logo | Playfair Display | ExtraBold | 2.2rem | Wordmark header/footer |
| H1 | Merriweather | Bold | 2.25rem (36px) | Titulo do artigo |
| H2 | Merriweather | Bold | 1.5rem (24px) | Subtitulos de artigo |
| H3 | Merriweather | Bold | 1.25rem (20px) | Subtitulos terciarios |
| Titulo de card | Merriweather | Bold | 1.125rem (18px) | Titulo em cards de artigo |
| Body | Inter | Regular | 1.125rem (18px) | Texto corrido |
| Small/Meta | Inter | Medium | 0.75-0.875rem | Datas, categorias, metadados |
| Label | Inter | SemiBold | 0.75rem | Badges, tags, labels |
| Nav | Inter | Medium/SemiBold | 0.875rem | Itens de navegacao |

### 3.3 Regras Tipograficas

1. **Headlines sempre em Merriweather serif** — nunca em sans-serif
2. **Corpo sempre em Inter** — nunca em serif (exceto blockquotes)
3. **Logo sempre em Playfair Display** — identidade fixa
4. **Tamanho minimo de body: 16px** — acessibilidade
5. **Largura maxima de linha: 75 caracteres** — legibilidade
6. **Line-height do body: 1.7-1.8** — conforto de leitura longa
7. **Blockquotes em Merriweather Italic** — distinguir citacoes

---

## 4. Logo

### 4.1 Versao Principal

```
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║        O INVESTIGADOR                ║
  ║        ━━━━━━━━━━━━━━━               ║
  ║         JORNAL ONLINE                ║
  ║                                      ║
  ╚══════════════════════════════════════╝
```

- **"O INVESTIGADOR"**: Playfair Display ExtraBold, caixa alta
- **Barra divisoria**: 3px de altura, cor `brand-accent` (`#c0392b`), largura 60% do wordmark
- **"JORNAL ONLINE"**: Inter SemiBold, caixa alta, tracking largo (+0.2em), tamanho 40% do wordmark

### 4.2 Variacoes

| Variacao | Fundo | Texto | Barra | Uso |
|----------|-------|-------|-------|-----|
| **Principal** | Navy (`#0d345e`) | Branco | Vermelho (`#c0392b`) | Header, materiais oficiais |
| **Invertida** | Branco | Navy (`#0d345e`) | Vermelho (`#c0392b`) | Documentos, fundo claro |
| **Monocromatica** | Transparente | Navy (`#0d345e`) | Navy (`#0d345e`) | Impressao a uma cor |
| **Branca** | Transparente | Branco | Branco | Sobre imagens escuras |

### 4.3 Zona de Protecao

A zona de protecao minima em torno do logo e equivalente a altura da letra "O" em "O INVESTIGADOR". Nenhum elemento visual deve invadir esta zona.

### 4.4 Tamanho Minimo

- **Digital:** Largura minima de 150px
- **Impressao:** Largura minima de 40mm

### 4.5 Uso Incorreto

- Nunca alterar as proporcoes do logo
- Nunca mudar as cores fora das variacoes definidas
- Nunca adicionar efeitos (sombras, gradientes, brilhos)
- Nunca colocar sobre fundos com baixo contraste
- Nunca usar outra fonte que nao Playfair Display

---

## 5. Badges de Tipo de Artigo

### 5.1 Especificacoes

Os badges identificam o genero jornalistico de cada artigo. Sao elementos criticos da identidade visual.

| Tipo | Label | Fundo | Texto | Border-Radius |
|------|-------|-------|-------|---------------|
| **Cronica** | `Cronica` | `#F3E8FF` | `#7C3AED` | `rounded-full` |
| **Reportagem** | `Reportagem` | `#f0f5fb` | `#0d345e` | `rounded-full` |
| **Opiniao** | `Opiniao` | `#fdf2f1` | `#c0392b` | `rounded-full` |

### 5.2 Tailwind Classes

```html
<!-- Cronica -->
<span class="badge-cronica">Cronica</span>
<!-- bg-purple-50 text-purple-600 -->

<!-- Reportagem -->
<span class="badge-reportagem">Reportagem</span>
<!-- bg-primary-50 text-brand -->

<!-- Opiniao -->
<span class="badge-opiniao">Opiniao</span>
<!-- bg-accent-50 text-accent-500 -->
```

### 5.3 Justificacao das Cores

- **Cronica (Roxo):** O roxo e historicamente associado a introspecao, criatividade e reflexao. A cronica e o genero mais pessoal e literario — o roxo distingue-a visualmente.
- **Reportagem (Navy):** O navy e a cor da marca e da confianca. A reportagem e o coracao do jornal — investigacao rigorosa e factual. Usar a cor da marca reafirma este valor.
- **Opiniao (Vermelho):** A opiniao e posicionamento, e debate, e afirmacao. O vermelho accent carrega urgencia e destaque — a opiniao nao e neutra e a cor reflete isso.

---

## 6. Componentes Visuais

### 6.1 Titulos de Seccao

```html
<h2 class="section-title">
  <!-- Borda esquerda accent + texto uppercase -->
  POLITICA
</h2>
```

- Borda esquerda: 4px, `brand-accent` (`#c0392b`)
- Texto: `brand` (`#0d345e`), uppercase, font-black
- Familia: Inter (display/UI element, nao headline)

### 6.2 Cards de Artigo

- Fundo: branco
- Sombra: `shadow-sm` ao hover `shadow-md`
- Imagem: `rounded-lg`, overflow hidden, zoom ao hover (scale-105)
- Titulo: Merriweather Bold, `text-neutral-900`, hover `text-brand-accent`
- Metadata: Inter, `text-neutral-500`, tamanho xs
- Transicao: 300ms ease

### 6.3 Barra de Trending

- Fundo: `brand-dark` (`#071d38`)
- Badge "Agora": `brand-accent` com pulse animation
- Texto: branco
- Rotacao automatica: 4 segundos

### 6.4 Botoes

| Tipo | Fundo | Texto | Hover |
|------|-------|-------|-------|
| **Primario** | `brand-accent` | Branco | Escurecer 10% |
| **Secundario** | Transparente | Branco | Fundo branco, texto brand |
| **Ghost** | Transparente | `brand` | Fundo `primary-50` |

### 6.5 Redes Sociais

| Rede | Cor | Hex |
|------|-----|-----|
| Facebook | Blue | `#1877F2` |
| X (Twitter) | Preto | `#000000` |
| WhatsApp | Verde | `#25D366` |
| LinkedIn | Azul | `#0A66C2` |

---

## 7. Fotografia e Imagens

### 7.1 Diretrizes

- **Editorial e documental**: Fotos devem ter carater jornalistico, nao stock generico
- **Alto contraste**: Preferir imagens com contraste forte e boa definicao
- **Tons frios**: Imagens com tonalidade fria (azulado) harmonizam melhor com o navy
- **Pessoas reais**: Evitar fotos de stock demasiado posadas ou genericas
- **Proporcoes**: Feature images em 16:9 ou 3:2, nunca quadradas

### 7.2 Tratamento

- Sem filtros excessivos
- Sem saturacao artificial
- Credito de fotografia sempre visivel
- Alt text descritivo para acessibilidade

---

## 8. Tom de Voz

### 8.1 Caracteristicas

| Atributo | Sim | Nao |
|----------|-----|-----|
| **Rigoroso** | Factos verificados, fontes citadas | Especulacao, rumores |
| **Acessivel** | Linguagem clara, jargao explicado | Academismo, obscuridade |
| **Direto** | Titulos claros, leads fortes | Clickbait, sensacionalismo |
| **Critico** | Questionamento fundamentado | Ataques pessoais, parcialidade |

### 8.2 Titulos

- Informativos, nunca clickbait
- Verbos ativos, voz direta
- Maximo 80 caracteres para SEO
- Em Merriweather, a legibilidade e fundamental

---

## 9. Aplicacoes

### 9.1 Website (Ghost Theme)

O tema Ghost implementa a identidade visual atraves de:

| Componente | Ficheiro | Notas |
|------------|----------|-------|
| Cores e fontes | `tailwind.config.js` | Tokens de design centralizados |
| CSS base | `assets/css/index.css` | Imports de fontes, estilos globais |
| Layout base | `default.hbs` | Google Fonts, meta tags |
| Header | `partials/header.hbs` | Logo, navegacao, top bar |
| Footer | `partials/footer.hbs` | Logo, links, copyright |
| Cards | `partials/post-card.hbs` | Badges, imagens, metadata |
| Artigo | `post.hbs` | Badge de tipo, schema.org |
| Homepage | `index.hbs` | Trending, hero, seccoes |

### 9.2 Dark Mode (Site Publico)

O site suporta dark mode com toggle no header e mobile menu.

**Paleta Dark Mode:**

| Elemento | Light | Dark | Justificacao |
|----------|-------|------|-------------|
| Background | `#ffffff` | `#121820` | Navy escuro, nao preto puro — reduz fadiga |
| Surface/Cards | `#f8f9fb` | `#1a2332` | Elevacao sutil |
| Text primary | `#1a1f28` | `#e1e5ea` | Contraste ~14:1 |
| Text secondary | `#6b7685` | `#9aa3b0` | Legivel sem brilho |
| Borders | `#e1e5ea` | `#2a3442` | Separacao sutil |
| Brand | `#0d345e` | `#3670aa` | Mais claro para legibilidade |
| Accent | `#c0392b` | `#e05a4f` | Mais claro em dark |
| Links | `#3670aa` | `#5e92c5` | Contraste suficiente |

**Principios:**
- Navy escuro (`#121820`) em vez de preto puro para evitar "halation" (texto parece sangrar no fundo)
- Font weight +50 em dark para compensar a aparencia optica mais fina de texto claro em fundo escuro
- Imagens a 90% opacidade para reduzir brilho
- Transicao suave de 200ms em background-color e color
- Preferencia persistida em localStorage
- Deteta `prefers-color-scheme` do sistema como default
- Toggle: lua (= mudar para dark) / sol (= mudar para light)

**Toggle (desktop):** Icone sol/lua no header, entre busca e login
**Toggle (mobile):** Pill switch com label "Modo Escuro/Claro" no mobile menu

### 9.3 Admin Panel

O admin panel em React segue a mesma paleta via Tailwind CSS:
- Cores de marca configuradas em `tailwind.config.js`
- Dark mode com classe `dark`
- Badges de tipo com as mesmas cores do tema

### 9.3 Email/Newsletter

- Header: navy escuro com logo branco
- Accent: vermelho para CTAs
- Body: fundo branco, texto escuro
- Footer: cinza claro

---

## 10. Referencias e Inspiracoes

### 10.1 Publicacoes de Referencia

| Publicacao | Pais | Cor Primaria | Tipografia | Inspira em |
|------------|------|-------------|-----------|-----------|
| **The Guardian** | UK | Navy `#052962` + Amarelo `#FFE500` | Guardian Egyptian (serif) | Paleta navy, sistema de seccoes |
| **ProPublica** | US | Blue-gray `#304154` | Graphik (sans) | Jornalismo investigativo, trust blue |
| **Publico** | PT | Vermelho | Publico (serif custom) | Serif em logo, identidade portuguesa |
| **NYT** | US | Preto monocromatico | NYT Cheltenham (serif) | Gravitas, simplicidade |
| **The Intercept** | US | Preto + IK Blue | TI Actu (custom) | Tons escuros, investigacao |
| **Observador** | PT | Preto + Branco | Sans-serif minimalista | Minimalismo, digital-first |

### 10.2 Principios de Design de Noticias

1. **Azul/Navy = Confianca** — cor mais associada a credibilidade em estudos de percepcao (Stanford Web Credibility Research)
2. **Serif em logos = Autoridade** — quase todas as publicacoes serias usam serif no wordmark
3. **Accent restrito = Impacto** — usar a cor de destaque com moderacao maximiza o seu efeito
4. **Whitespace = Qualidade** — espacamento generoso sinaliza curadoria editorial
5. **Hierarquia tipografica = Confianca** — consistencia nas fontes transmite profissionalismo

### 10.3 Tendencias 2025-2026

- Dark mode como funcionalidade essencial
- Serif fonts em retorno para headlines
- "Dark Minimalism" — sombras como novo whitespace
- Paletas mais suaves e "restaurativas"
- Tipografia fluida com `clamp()`
- Componentes modulares reutilizaveis

---

## Historico de Versoes

| Versao | Data | Alteracoes |
| 1.0 | 2026-05-15 | Versao inicial do brandbook |
| 1.1 | 2026-05-15 | Favicon lupa, logo square, dark mode, magazine hero, cores alinhadas |
|--------|------|-----------|
| 1.0 | 2026-05-15 | Versao inicial do brandbook |
