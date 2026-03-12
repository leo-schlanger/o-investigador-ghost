# Guia do Ghost CMS

## Acesso

### URL
- **Desenvolvimento:** http://localhost:2368/ghost/
- **Producao:** https://jornalinvestigador.pt/ghost/

### Primeiro Acesso
1. Acesse a URL do Ghost Admin
2. Crie sua conta de administrador
3. Siga o wizard de configuracao

---

## Dashboard

A tela inicial mostra:
- Posts recentes
- Acesso rapido a funcoes
- Estatisticas basicas

---

## Posts

### Criar Post
1. Clique em "New post" ou use o atalho `Ctrl+Alt+P`
2. Digite o titulo
3. Escreva o conteudo
4. Configure metadados (sidebar direita)

### Editor
O Ghost usa um editor de blocos:

| Bloco | Comando |
|-------|---------|
| Texto | Digite normalmente |
| Titulo | # ou ## |
| Lista | - ou 1. |
| Imagem | Arraste ou /image |
| Divisor | --- |
| Markdown | /markdown |
| HTML | /html |
| Bookmark | Cole URL |
| Embed | /embed |

### Atalhos do Editor
| Acao | Atalho |
|------|--------|
| Negrito | Ctrl+B |
| Italico | Ctrl+I |
| Link | Ctrl+K |
| Titulo | Ctrl+Alt+1 |
| Salvar | Ctrl+S |
| Publicar | Ctrl+Shift+P |

### Configuracoes do Post
Na sidebar direita:
- **URL:** Slug personalizado
- **Publish date:** Data de publicacao
- **Tags:** Categorias
- **Authors:** Autores
- **Feature image:** Imagem destaque
- **Excerpt:** Resumo customizado

### Status do Post
| Status | Descricao |
|--------|-----------|
| Draft | Rascunho, nao publicado |
| Published | Publicado e visivel |
| Scheduled | Agendado para data futura |

---

## Pages

Paginas estaticas (Sobre, Contato, etc.):

1. No menu, clique em "Pages"
2. "New page" para criar
3. Mesmas opcoes de posts
4. Toggle "Page" fica ativo

---

## Tags

### Gerenciar Tags
1. Clique em "Tags" no menu
2. Para criar: "New tag"
3. Para editar: Clique na tag

### Campos
- **Name:** Nome exibido
- **Slug:** URL amigavel (ex: /tag/politica/)
- **Description:** Descricao da categoria
- **Feature image:** Imagem da tag
- **Meta data:** SEO customizado

### Tags Internas
Tags que comecam com # sao internas:
- Nao aparecem no site publico
- Uteis para organizacao interna
- Ex: #destaque, #urgente

---

## Membros (Newsletter)

### Configurar Newsletter
1. Settings > Membership
2. Configure planos (free/paid)
3. Ative signup

### Gerenciar Membros
1. Clique em "Members"
2. Veja lista de inscritos
3. Importe/exporte CSV
4. Filtre por status

### Enviar Newsletter
1. Ao publicar post
2. Marque "Send by email"
3. Escolha destinatarios

---

## Staff (Equipe)

### Adicionar Usuario
1. Settings > Staff
2. "Invite people"
3. Insira email
4. Selecione role

### Niveis de Acesso Ghost
| Role | Permissoes |
|------|------------|
| Contributor | Criar rascunhos |
| Author | Publicar proprios posts |
| Editor | Gerenciar todos os posts |
| Administrator | Acesso total |
| Owner | Admin + billing |

---

## Design

### Trocar Tema
1. Settings > Design & branding
2. "Change theme"
3. Selecione tema instalado
4. "Activate"

### Customizar Tema
1. Settings > Design & branding
2. "Customize"
3. Altere cores, fontes, layout
4. Salve

### Code Injection
Para adicionar scripts globais:
1. Settings > Code injection
2. **Site Header:** Antes de </head>
3. **Site Footer:** Antes de </body>

Uteis para:
- Google Analytics
- Pixel do Facebook
- Scripts customizados

---

## Integracoes

### Criar Integracao
1. Settings > Integrations
2. "+ Add custom integration"
3. De um nome
4. Copie as API Keys

### Webhooks
Configure webhooks para:
- Notificar sistemas externos
- Automacoes com Zapier
- Integracoes customizadas

---

## Settings

### General
- Site title
- Site description
- Language
- Timezone

### Membership
- Precos de assinatura
- Signup/signin settings
- Portal settings

### Email
- Newsletter settings
- Email design
- From address

---

## Importar/Exportar

### Exportar Conteudo
1. Settings > Labs
2. "Export content"
3. Baixa JSON com todos os posts

### Importar
1. Settings > Labs
2. "Import content"
3. Selecione arquivo JSON

### Redirecionar URLs
1. Settings > Labs
2. "Redirects"
3. Upload arquivo redirects.json

---

## Atalhos Globais

| Acao | Atalho |
|------|--------|
| Novo post | Ctrl+Alt+P |
| Buscar | Ctrl+K |
| Dashboard | Ctrl+Alt+D |
| Settings | Ctrl+Alt+S |
| Preview | Ctrl+Alt+V |

---

## Mobile

O Ghost Admin funciona em tablets e celulares:
- Interface responsiva
- Funcionalidades principais disponiveis
- Para edicao complexa, prefira desktop

---

## Boas Praticas

### Conteudo
- Sempre adicione imagem de destaque
- Escreva excerpt atrativo
- Use tags relevantes
- Revise antes de publicar

### SEO
- Personalize meta title/description
- Use URLs amigaveis
- Adicione alt text em imagens

### Organizacao
- Mantenha tags consistentes
- Use tags internas para workflow
- Archive posts antigos

---

## Troubleshooting

### Post nao aparece no site
1. Verifique se esta publicado (nao draft)
2. Verifique a data de publicacao
3. Limpe cache do navegador

### Imagem nao carrega
1. Verifique tamanho (max 10MB)
2. Verifique formato (jpg, png, gif)
3. Tente fazer upload novamente

### Nao consigo publicar
1. Verifique sua role (Contributor nao pode)
2. Verifique conexao
3. Tente recarregar a pagina
