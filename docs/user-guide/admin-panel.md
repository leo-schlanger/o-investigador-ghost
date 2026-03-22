# Guia do Painel Administrativo

## Acesso

### URL
- **Desenvolvimento:** http://localhost:5173
- **Producao:** https://admin.jornalinvestigador.pt

### Login
1. Acesse a URL do painel
2. Insira seu email e senha
3. Clique em "Entrar"

---

## Dashboard

A pagina inicial mostra um resumo do sistema:

- **Total de Artigos:** Numero de publicacoes
- **Usuarios:** Quantidade de usuarios admin
- **Visualizacoes:** Metricas de acesso
- **Artigos Recentes:** Ultimas publicacoes

---

## Menu Lateral

| Item | Funcao |
|------|--------|
| Dashboard | Pagina inicial |
| Artigos | Gerenciar publicacoes |
| Paginas | Paginas estaticas |
| Midia | Biblioteca de arquivos |
| Tags | Categorias e tags |
| Navegacao | Menus do site |
| Anuncios | Configurar AdSense |
| Usuarios | Gerenciar equipe |
| Configuracoes | Ajustes do sistema |

---

## Artigos

### Listar Artigos
1. Clique em "Artigos" no menu
2. Use filtros para encontrar:
   - Status (Rascunho, Publicado, Agendado)
   - Busca por titulo

### Criar Novo Artigo
1. Clique em "Novo Artigo"
2. Preencha:
   - **Titulo:** Titulo da publicacao
   - **Conteudo:** Use o editor visual
   - **Imagem de Capa:** Adicione imagem destaque
   - **Tags:** Selecione categorias
   - **Autor:** Selecione o autor
3. Opcoes:
   - **Salvar Rascunho:** Salva sem publicar
   - **Publicar:** Publica imediatamente
   - **Agendar:** Define data futura

### Editar Artigo
1. Na lista, clique no artigo desejado
2. Faca as alteracoes
3. Clique em "Atualizar"

### Excluir Artigo
1. Na lista, clique nos tres pontos (...)
2. Selecione "Excluir"
3. Confirme a acao

---

## Editor de Conteudo

O editor usa blocos para construir o artigo:

### Tipos de Blocos
| Bloco | Descricao |
|-------|-----------|
| Paragrafo | Texto normal |
| Titulo | H2, H3, H4 |
| Lista | Bullets ou numerada |
| Imagem | Foto ou ilustracao |
| Citacao | Texto destacado |
| Codigo | Bloco de codigo |
| Divisor | Linha separadora |

### Atalhos
| Acao | Atalho |
|------|--------|
| Negrito | Ctrl+B |
| Italico | Ctrl+I |
| Link | Ctrl+K |
| Salvar | Ctrl+S |

---

## Paginas

### Paginas Estaticas
Paginas que nao sao artigos, como:
- Sobre nos
- Contato
- Politica de Privacidade

### Criar Pagina
1. Clique em "Paginas" > "Nova Pagina"
2. Defina titulo e conteudo
3. Configure a URL (slug)
4. Publique

---

## Biblioteca de Midia

### Layout da Interface

A biblioteca de midia tem 3 paineis:

| Painel | Funcao |
|--------|--------|
| Sidebar Esquerda | Arvore de pastas |
| Area Central | Filtros + Grid de midias |
| Sidebar Direita | Detalhes do item selecionado |

### Upload de Arquivos
1. Clique em "Midia"
2. Arraste arquivos ou clique em "Enviar"
3. Formatos aceitos: JPG, PNG, GIF, WebP, PDF
4. Arquivos sao enviados para a pasta selecionada

### Pastas

#### Criar Pasta
1. No painel esquerdo, clique em "+"
2. Digite o nome da pasta
3. Clique em "Criar"

#### Criar Subpasta
1. Passe o mouse sobre uma pasta
2. Clique nos 3 pontos (...)
3. Selecione "Nova subpasta"

#### Renomear/Eliminar Pasta
1. Passe o mouse sobre a pasta
2. Clique nos 3 pontos (...)
3. Selecione "Renomear" ou "Eliminar"

> **Nota:** Ao eliminar uma pasta, os ficheiros sao movidos para a pasta pai.

### Tags

#### Adicionar Tags a uma Imagem
1. Clique na imagem para abrir detalhes
2. No painel direito, em "Tags", comece a digitar
3. Selecione uma tag existente ou crie nova (Enter)

#### Remover Tags
1. No painel de detalhes, clique no "X" ao lado da tag

### Filtros e Pesquisa

#### Pesquisar por Nome
1. Use a barra de pesquisa no topo
2. Digite parte do nome do ficheiro

#### Filtrar por Tags
1. Clique em "Tags" ao lado da pesquisa
2. Marque as tags desejadas
3. Apenas midias com TODAS as tags selecionadas serao exibidas

#### Filtrar por Pasta
1. Clique na pasta no painel esquerdo
2. "Todas as Midias" mostra tudo
3. "Sem pasta" mostra apenas ficheiros na raiz

### Operacoes em Lote

#### Selecionar Multiplos
1. Clique em "Selecionar" no topo
2. Clique nas imagens desejadas
3. Ou use Ctrl+Click para selecao rapida

#### Mover Multiplos
1. Selecione varios ficheiros
2. Clique em "Mover para..."
3. Escolha a pasta destino

### Usar Imagem
1. No editor, insira bloco de imagem
2. Selecione da biblioteca ou envie nova
3. Adicione texto alternativo (alt)

### Limites
- Tamanho maximo: 10 MB por arquivo
- Resolucao recomendada: 1200x630px (destaque)

---

## Tags

### Gerenciar Tags
1. Clique em "Tags"
2. Veja todas as categorias existentes
3. Para criar: "Nova Tag"
4. Para editar: Clique na tag

### Campos da Tag
- **Nome:** Exibido no site
- **Slug:** URL amigavel
- **Descricao:** Texto sobre a categoria
- **Imagem:** Imagem da categoria

---

## Navegacao

### Editar Menu
1. Clique em "Navegacao"
2. Arraste itens para reordenar
3. Edite label e URL de cada item
4. Salve alteracoes

### Adicionar Item
1. Clique em "Adicionar Item"
2. Defina nome e link
3. Salve

---

## Anuncios

### Configurar AdSense
1. Clique em "Anuncios"
2. Ative "Exibir Anuncios"
3. Insira seu ID do Publisher (ca-pub-xxx)
4. Configure cada slot:
   - Header
   - Sidebar
   - Dentro do Artigo
   - Footer

### Campos por Slot
- **Slot ID:** ID do anuncio no AdSense
- **Formato:** auto, rectangle, horizontal, vertical
- **Ativo:** Ligar/desligar individualmente

---

## Usuarios

### Niveis de Acesso
| Role | Permissoes |
|------|------------|
| Admin | Acesso total |
| Editor | Artigos, paginas, midia |
| Autor | Apenas seus artigos |

### Criar Usuario
1. Clique em "Usuarios" > "Novo"
2. Preencha email, nome, senha
3. Selecione o nivel de acesso
4. Salve

### Editar Usuario
1. Clique no usuario
2. Altere dados necessarios
3. Para redefinir senha, use o campo de senha
4. Salve

---

## Configuracoes

### Geral
- Nome do site
- Descricao
- Idioma
- Timezone

### Integracao
- Ghost API Key
- Configuracoes de email

---

## Perfil

### Editar Seu Perfil
1. Clique no seu nome (canto superior direito)
2. Selecione "Perfil"
3. Altere nome, foto, bio
4. Salve

### Trocar Senha
1. No perfil, va para "Seguranca"
2. Insira senha atual
3. Defina nova senha
4. Confirme

---

## Dicas

### Produtividade
- Use rascunhos para artigos em progresso
- Agende publicacoes para horarios de pico
- Adicione sempre imagem de destaque

### Qualidade
- Revise antes de publicar
- Use tags relevantes
- Escreva resumos atrativos

### Seguranca
- Nao compartilhe sua senha
- Faca logout ao terminar
- Use senhas fortes

---

## Suporte

Se encontrar problemas:
1. Verifique sua conexao
2. Atualize a pagina
3. Limpe cache do navegador
4. Contate o administrador
