/**
 * Templates profissionais de Newsletter para O Investigador
 * Inspirados em: NYT Morning Briefing, The Guardian, Publico, Observador
 */

// Cores do projeto
export const BRAND_COLORS = {
  brand: '#0d345e',
  brandLight: '#1a4f8a',
  brandDark: '#071d38',
  accent: '#c0392b'
};

// Blocos padrão reutilizáveis
const defaultHeader = {
  id: 'header-1',
  type: 'header',
  content: {
    siteName: 'O Investigador',
    tagline: 'Jornal Online',
    logoUrl: ''
  }
};

const defaultFooter = {
  id: 'footer-1',
  type: 'footer',
  content: {
    copyright: `© ${new Date().getFullYear()} O Investigador. Todos os direitos reservados.`,
    unsubscribeText: 'Cancelar subscricao',
    socialLinks: true
  }
};

// Templates profissionais
export const NEWSLETTER_TEMPLATES = [
  {
    id: 'daily-briefing',
    name: 'Briefing Diario',
    description: 'Resumo matinal das principais noticias. Ideal para envio diario.',
    category: 'noticias',
    thumbnail: '/templates/daily-briefing.png',
    previewColors: { primary: BRAND_COLORS.brand, accent: BRAND_COLORS.accent },
    defaultSubject: 'Bom dia! As noticias de hoje',
    defaultPreheader: 'O resumo das principais noticias para comecar o seu dia informado.',
    blocks: [
      defaultHeader,
      {
        id: 'intro-1',
        type: 'text',
        content: {
          content:
            'Bom dia! Aqui esta o resumo das principais noticias para comecar o seu dia bem informado.'
        }
      },
      {
        id: 'section-destaque',
        type: 'section-title',
        content: { title: 'Destaque' }
      },
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: '',
          excerpt: '',
          imageUrl: '',
          link: '',
          category: 'Destaque'
        }
      },
      {
        id: 'section-mais',
        type: 'section-title',
        content: { title: 'Mais Noticias' }
      },
      {
        id: 'article-1',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '', category: '' }
      },
      {
        id: 'article-2',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '', category: '' }
      },
      {
        id: 'article-3',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '', category: '' }
      },
      {
        id: 'divider-1',
        type: 'divider',
        content: { style: 'solid' }
      },
      {
        id: 'section-rapidas',
        type: 'section-title',
        content: { title: 'Em Resumo' }
      },
      {
        id: 'list-1',
        type: 'article-list',
        content: {
          articles: [
            { title: '', link: '' },
            { title: '', link: '' },
            { title: '', link: '' },
            { title: '', link: '' }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'button',
        content: {
          text: 'Ver Todas as Noticias',
          url: 'https://jornalinvestigador.pt',
          style: 'primary'
        }
      },
      defaultFooter
    ]
  },
  {
    id: 'weekly-digest',
    name: 'Resumo Semanal',
    description: 'As melhores noticias e analises da semana. Perfeito para envio aos domingos.',
    category: 'noticias',
    thumbnail: '/templates/weekly-digest.png',
    previewColors: { primary: BRAND_COLORS.brand, accent: BRAND_COLORS.accent },
    defaultSubject: 'O melhor da semana no Investigador',
    defaultPreheader: 'As noticias que marcaram a semana, analises exclusivas e mais.',
    blocks: [
      defaultHeader,
      {
        id: 'intro-1',
        type: 'text',
        content: {
          content:
            'Esta semana trouxe desenvolvimentos importantes. Aqui esta o resumo do que precisa de saber.'
        }
      },
      {
        id: 'section-principal',
        type: 'section-title',
        content: { title: 'Historia da Semana' }
      },
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: '',
          excerpt: '',
          imageUrl: '',
          link: '',
          category: 'Analise'
        }
      },
      {
        id: 'section-politica',
        type: 'section-title',
        content: { title: 'Politica' }
      },
      {
        id: 'article-pol-1',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '', category: 'Politica' }
      },
      {
        id: 'article-pol-2',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '', category: 'Politica' }
      },
      {
        id: 'section-economia',
        type: 'section-title',
        content: { title: 'Economia' }
      },
      {
        id: 'article-eco-1',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '', category: 'Economia' }
      },
      {
        id: 'article-eco-2',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '', category: 'Economia' }
      },
      {
        id: 'section-mundo',
        type: 'section-title',
        content: { title: 'Mundo' }
      },
      {
        id: 'list-mundo',
        type: 'article-list',
        content: {
          articles: [
            { title: '', link: '' },
            { title: '', link: '' },
            { title: '', link: '' }
          ]
        }
      },
      {
        id: 'divider-1',
        type: 'divider',
        content: { style: 'solid' }
      },
      {
        id: 'quote-1',
        type: 'quote',
        content: {
          text: '',
          author: ''
        }
      },
      {
        id: 'cta-1',
        type: 'button',
        content: { text: 'Explorar Mais', url: 'https://jornalinvestigador.pt', style: 'primary' }
      },
      defaultFooter
    ]
  },
  {
    id: 'breaking-news',
    name: 'Alerta de Noticia',
    description: 'Para noticias urgentes e de ultima hora. Envio imediato.',
    category: 'alertas',
    thumbnail: '/templates/breaking-news.png',
    previewColors: { primary: BRAND_COLORS.accent, accent: BRAND_COLORS.brand },
    defaultSubject: 'URGENTE: ',
    defaultPreheader: 'Noticia de ultima hora do Investigador',
    blocks: [
      {
        ...defaultHeader,
        id: 'header-alert',
        content: {
          ...defaultHeader.content,
          isAlert: true
        }
      },
      {
        id: 'alert-banner',
        type: 'text',
        content: {
          content: 'ULTIMA HORA',
          isAlertBanner: true
        }
      },
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: '',
          excerpt: '',
          imageUrl: '',
          link: '',
          category: 'Urgente'
        }
      },
      {
        id: 'updates-title',
        type: 'section-title',
        content: { title: 'O que sabemos' }
      },
      {
        id: 'text-updates',
        type: 'text',
        content: {
          content: ''
        }
      },
      {
        id: 'cta-1',
        type: 'button',
        content: { text: 'Acompanhar ao Vivo', url: '', style: 'primary' }
      },
      {
        id: 'text-note',
        type: 'text',
        content: {
          content: 'Esta noticia esta a ser atualizada. Visite o site para as ultimas informacoes.'
        }
      },
      defaultFooter
    ]
  },
  {
    id: 'editorial',
    name: 'Editorial / Opiniao',
    description: 'Para artigos de opiniao, editoriais e cronicas. Tom mais pessoal.',
    category: 'opiniao',
    thumbnail: '/templates/editorial.png',
    previewColors: { primary: BRAND_COLORS.brand, accent: BRAND_COLORS.accent },
    defaultSubject: 'Opiniao: ',
    defaultPreheader: 'Uma reflexao sobre os acontecimentos da atualidade',
    blocks: [
      defaultHeader,
      {
        id: 'author-intro',
        type: 'text',
        content: {
          content: '',
          authorName: '',
          authorTitle: '',
          authorPhoto: ''
        }
      },
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: '',
          excerpt: '',
          imageUrl: '',
          link: '',
          category: 'Opiniao'
        }
      },
      {
        id: 'content-1',
        type: 'text',
        content: { content: '' }
      },
      {
        id: 'quote-1',
        type: 'quote',
        content: { text: '', author: '' }
      },
      {
        id: 'content-2',
        type: 'text',
        content: { content: '' }
      },
      {
        id: 'cta-1',
        type: 'button',
        content: { text: 'Ler Artigo Completo', url: '', style: 'outline' }
      },
      {
        id: 'divider-1',
        type: 'divider',
        content: { style: 'solid' }
      },
      {
        id: 'related-title',
        type: 'section-title',
        content: { title: 'Relacionados' }
      },
      {
        id: 'related-list',
        type: 'article-list',
        content: {
          articles: [
            { title: '', link: '' },
            { title: '', link: '' }
          ]
        }
      },
      defaultFooter
    ]
  },
  {
    id: 'special-edition',
    name: 'Edicao Especial',
    description: 'Para coberturas especiais, eventos e reportagens longas.',
    category: 'especial',
    thumbnail: '/templates/special-edition.png',
    previewColors: { primary: BRAND_COLORS.brandDark, accent: BRAND_COLORS.accent },
    defaultSubject: 'Especial: ',
    defaultPreheader: 'Uma cobertura completa e aprofundada',
    blocks: [
      defaultHeader,
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: '',
          excerpt: '',
          imageUrl: '',
          link: '',
          category: 'Especial'
        }
      },
      {
        id: 'intro-text',
        type: 'text',
        content: { content: '' }
      },
      {
        id: 'section-1',
        type: 'section-title',
        content: { title: 'Contexto' }
      },
      {
        id: 'article-1',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '' }
      },
      {
        id: 'section-2',
        type: 'section-title',
        content: { title: 'Analise' }
      },
      {
        id: 'article-2',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '' }
      },
      {
        id: 'quote-1',
        type: 'quote',
        content: { text: '', author: '' }
      },
      {
        id: 'section-3',
        type: 'section-title',
        content: { title: 'Reacoes' }
      },
      {
        id: 'article-3',
        type: 'article',
        content: { title: '', excerpt: '', imageUrl: '', link: '' }
      },
      {
        id: 'section-4',
        type: 'section-title',
        content: { title: 'Cronologia' }
      },
      {
        id: 'timeline-list',
        type: 'article-list',
        content: {
          articles: [
            { title: '', link: '' },
            { title: '', link: '' },
            { title: '', link: '' },
            { title: '', link: '' }
          ]
        }
      },
      {
        id: 'cta-1',
        type: 'button',
        content: { text: 'Ver Cobertura Completa', url: '', style: 'primary' }
      },
      defaultFooter
    ]
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Layout simples e limpo. Ideal para comunicados breves.',
    category: 'outros',
    thumbnail: '/templates/minimal.png',
    previewColors: { primary: BRAND_COLORS.brand, accent: BRAND_COLORS.accent },
    defaultSubject: '',
    defaultPreheader: '',
    blocks: [
      defaultHeader,
      {
        id: 'text-1',
        type: 'text',
        content: { content: '' }
      },
      {
        id: 'cta-1',
        type: 'button',
        content: { text: 'Saber Mais', url: '', style: 'primary' }
      },
      defaultFooter
    ]
  }
];

// Função para obter um template por ID
export const getTemplateById = (id) => {
  return NEWSLETTER_TEMPLATES.find((t) => t.id === id) || null;
};

// Função para obter templates por categoria
export const getTemplatesByCategory = (category) => {
  if (!category || category === 'all') return NEWSLETTER_TEMPLATES;
  return NEWSLETTER_TEMPLATES.filter((t) => t.category === category);
};

// Categorias disponíveis
export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'opiniao', label: 'Opiniao' },
  { id: 'especial', label: 'Especial' },
  { id: 'outros', label: 'Outros' }
];

// Tipos de blocos disponíveis
export const BLOCK_TYPES = [
  {
    type: 'header',
    label: 'Cabecalho',
    icon: 'Layout',
    description: 'Logo e masthead do jornal',
    category: 'estrutura'
  },
  {
    type: 'hero',
    label: 'Destaque Principal',
    icon: 'Newspaper',
    description: 'Noticia em destaque com imagem grande',
    category: 'conteudo'
  },
  {
    type: 'section-title',
    label: 'Titulo de Seccao',
    icon: 'Type',
    description: 'Separador de seccoes',
    category: 'estrutura'
  },
  {
    type: 'article',
    label: 'Artigo',
    icon: 'FileText',
    description: 'Noticia com imagem e resumo',
    category: 'conteudo'
  },
  {
    type: 'article-list',
    label: 'Lista de Artigos',
    icon: 'List',
    description: 'Lista simples de links',
    category: 'conteudo'
  },
  {
    type: 'text',
    label: 'Texto',
    icon: 'AlignLeft',
    description: 'Paragrafo de texto livre',
    category: 'conteudo'
  },
  {
    type: 'quote',
    label: 'Citacao',
    icon: 'Quote',
    description: 'Citacao em destaque',
    category: 'conteudo'
  },
  {
    type: 'button',
    label: 'Botao CTA',
    icon: 'MousePointer',
    description: 'Botao de acao',
    category: 'conteudo'
  },
  {
    type: 'divider',
    label: 'Separador',
    icon: 'Minus',
    description: 'Linha divisoria',
    category: 'estrutura'
  },
  {
    type: 'footer',
    label: 'Rodape',
    icon: 'Layout',
    description: 'Rodape com links e copyright',
    category: 'estrutura'
  }
];

// Conteúdo padrão para cada tipo de bloco
export const getDefaultBlockContent = (type) => {
  const defaults = {
    header: { siteName: 'O Investigador', tagline: 'Jornal Online', logoUrl: '' },
    hero: { title: '', excerpt: '', imageUrl: '', link: '', category: '' },
    'section-title': { title: 'Titulo da Seccao' },
    article: { title: '', excerpt: '', imageUrl: '', link: '', category: '' },
    'article-list': {
      articles: [
        { title: '', link: '' },
        { title: '', link: '' },
        { title: '', link: '' }
      ]
    },
    text: { content: '' },
    quote: { text: '', author: '' },
    button: { text: 'Ler Mais', url: '', style: 'primary' },
    divider: { style: 'solid' },
    footer: {
      copyright: `© ${new Date().getFullYear()} O Investigador`,
      unsubscribeText: 'Cancelar subscricao'
    }
  };
  return defaults[type] || {};
};
