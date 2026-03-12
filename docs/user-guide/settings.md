# Guia de Configuracoes

## Visao Geral

Este guia explica todas as configuracoes disponiveis no sistema.

---

## Painel Administrativo

### Acesso
Menu lateral > Configuracoes

### Configuracoes Gerais

#### Informacoes do Site
| Campo | Descricao |
|-------|-----------|
| Nome do site | Titulo principal |
| Descricao | Tagline / slogan |
| Idioma | Idioma padrao |
| Timezone | Fuso horario |

#### Logo e Favicon
- **Logo:** Imagem principal (recomendado: PNG transparente)
- **Favicon:** Icone do navegador (32x32 pixels)

---

## Anuncios (AdSense)

### Ativar/Desativar
Toggle "Exibir Anuncios" para controle global.

### Configuracao do Publisher
1. Acesse sua conta Google AdSense
2. Copie o ID do Publisher (ca-pub-XXXXXXX)
3. Cole no campo "ID do Publisher"

### Slots de Anuncio

#### Header (Topo)
- **Posicao:** Acima do conteudo principal
- **Formato recomendado:** horizontal, leaderboard
- **Tamanho comum:** 728x90

#### Sidebar (Lateral)
- **Posicao:** Coluna lateral direita
- **Formato recomendado:** rectangle
- **Tamanho comum:** 300x250

#### In-Article (Dentro do Artigo)
- **Posicao:** Entre paragrafos
- **Formato recomendado:** auto
- **Adapta ao conteudo**

#### Footer (Rodape)
- **Posicao:** Final da pagina
- **Formato recomendado:** horizontal
- **Tamanho comum:** 728x90

### Campos por Slot
| Campo | Descricao |
|-------|-----------|
| Slot ID | ID unico do anuncio no AdSense |
| Formato | auto, rectangle, horizontal, vertical |
| Ativo | Liga/desliga individualmente |

---

## Navegacao

### Menu Principal
Itens exibidos no header do site.

### Editar Menu
1. Acesse Configuracoes > Navegacao
2. Arraste para reordenar
3. Edite label e URL
4. Adicione novos itens
5. Salve

### Formato de URL
| Tipo | Exemplo |
|------|---------|
| Interna | /politica/ |
| Externa | https://exemplo.com |
| Ancora | #secao |

---

## Usuarios

### Criar Usuario
1. Menu > Usuarios > Novo
2. Preencha dados
3. Selecione role
4. Enviar convite ou criar com senha

### Roles Disponiveis
| Role | Dashboard | Artigos | Usuarios | Config |
|------|-----------|---------|----------|--------|
| Admin | Total | Total | Total | Total |
| Editor | Ver | Todos | Nao | Nao |
| Autor | Ver | Proprios | Nao | Nao |

### Editar Usuario
1. Clique no usuario
2. Altere dados
3. Salve

### Desativar Usuario
1. Edite o usuario
2. Toggle "Ativo" para desligado
3. Usuario nao conseguira fazer login

---

## Ghost CMS Settings

### General
Acesse Ghost Admin > Settings > General

| Campo | Descricao |
|-------|-----------|
| Site title | Nome do site |
| Site description | Meta description padrao |
| Site timezone | Fuso horario |
| Publication language | Codigo do idioma (pt-BR) |

### Design & Branding
| Campo | Descricao |
|-------|-----------|
| Accent color | Cor principal |
| Publication icon | Favicon |
| Publication logo | Logo do site |
| Publication cover | Imagem de capa |

### Social Accounts
| Campo | Formato |
|-------|---------|
| Facebook | /nomedapagina |
| Twitter | @usuario |

---

## Newsletter (Ghost Members)

### Ativar Newsletter
Ghost Admin > Settings > Membership

1. Enable "Allow free signup"
2. Configure portal settings
3. Personalize signup page

### Email Settings
Ghost Admin > Settings > Email

| Campo | Descricao |
|-------|-----------|
| Newsletter name | Nome da newsletter |
| Sender email | Email remetente |
| Reply-to | Email para respostas |

### Design da Newsletter
Personalize:
- Cabecalho
- Rodape
- Cores
- Layout

---

## Integracao Ghost API

### Criar Integracao
Ghost Admin > Settings > Integrations

1. "+ Add custom integration"
2. Nome: "O Investigador API"
3. Copie Admin API Key

### Usar no Sistema
Adicione ao arquivo .env:
```
GHOST_API_KEY=sua_api_key_aqui
```

---

## Email (SendGrid)

### Configurar
Adicione ao .env da API:

```
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@seudominio.com
CONTACT_EMAIL=contato@seudominio.com
```

### Obter API Key
1. Acesse sendgrid.com
2. Crie conta ou faca login
3. Settings > API Keys
4. Create API Key
5. Copie a chave

---

## Backup

### Automatico
O sistema faz backup diario as 3h da manha.

### Verificar Backups
```bash
ls -la /opt/o-investigador/backups/
```

### Configurar Retencao
No .env:
```
RETENTION_DAYS=7  # Manter ultimos 7 dias
```

### Backup para S3
```
AWS_BUCKET=nome-do-bucket
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

---

## Cache

### Limpar Cache do Browser
- Chrome: Ctrl+Shift+Del
- Firefox: Ctrl+Shift+Del
- Safari: Cmd+Alt+E

### Limpar Cache do Site
```bash
# Reiniciar Nginx
docker compose restart nginx
```

---

## SSL/HTTPS

### Renovar Certificado
```bash
sudo certbot renew
```

### Verificar Validade
```bash
sudo certbot certificates
```

---

## Logs

### Ver Logs da API
```bash
docker compose logs -f api
```

### Ver Logs do Ghost
```bash
docker compose logs -f ghost
```

### Ver Logs de Backup
```bash
tail -f /var/log/o-investigador-backup.log
```

---

## Manutencao

### Reiniciar Servico
```bash
docker compose restart <servico>
```

### Atualizar Sistema
```bash
cd /opt/o-investigador
git pull
docker compose up -d --build
```

### Verificar Status
```bash
docker compose ps
curl localhost:3001/health
```

---

## Problemas Comuns

### Configuracao nao salva
1. Verifique conexao
2. Verifique permissoes de usuario
3. Veja logs do navegador (F12)

### Anuncios nao aparecem
1. Verifique se estao ativos
2. Verifique IDs corretos
3. Verifique se AdSense esta aprovado

### Email nao envia
1. Verifique SendGrid API key
2. Verifique email verificado no SendGrid
3. Veja logs da API
