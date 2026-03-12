# Arquitetura do Sistema - Visao Geral

## Arquitetura de Microsservicos

O Investigador utiliza uma arquitetura de microsservicos containerizada, onde cada componente tem uma responsabilidade especifica e se comunica via APIs REST.

---

## Diagrama Geral

```
                                    INTERNET
                                        |
                                        v
                    +-----------------------------------+
                    |          NGINX PROXY              |
                    |    (SSL, Routing, Cache)          |
                    +-----------------------------------+
                         |          |           |
           +-------------+          |           +-------------+
           |                        |                         |
           v                        v                         v
+------------------+    +------------------+    +------------------+
|   GHOST CMS      |    |   CMS API        |    |   ADMIN PANEL    |
|   Port: 2368     |    |   Port: 3001     |    |   Port: 5173     |
|   (Conteudo)     |    |   (Backend)      |    |   (Frontend)     |
+------------------+    +------------------+    +------------------+
           |                   |
           |                   |
           +-------+   +-------+
                   |   |
                   v   v
            +------------------+
            |     MYSQL        |
            |   Port: 3306     |
            |   (Database)     |
            +------------------+
```

---

## Componentes Principais

### 1. Nginx (Reverse Proxy)
**Funcao:** Ponto de entrada unico para todas as requisicoes

**Responsabilidades:**
- Terminacao SSL/TLS
- Roteamento de requisicoes
- Cache de assets estaticos
- Rate limiting
- Compressao gzip
- Headers de seguranca

**Rotas:**
```
/                    -> Ghost CMS (site publico)
/ghost/              -> Ghost Admin (editor)
/api/                -> CMS API (backend customizado)
/admin/              -> Admin Panel (painel React)
```

---

### 2. Ghost CMS
**Funcao:** Sistema de gerenciamento de conteudo

**Responsabilidades:**
- Armazenamento de artigos
- Renderizacao do tema publico
- Sistema de membros/newsletter
- API Content e Admin
- Editor de posts nativo

**Tecnologias:**
- Ghost 5.x
- Node.js
- Handlebars (templates)
- MySQL (storage)

---

### 3. CMS API (Backend)
**Funcao:** Logica de negocio customizada

**Responsabilidades:**
- Autenticacao de usuarios admin
- Gerenciamento de configuracoes
- Upload de midias
- Analytics de visualizacoes
- Integracao Ghost via API
- Endpoint de contato

**Tecnologias:**
- Node.js 18 LTS
- Express.js
- Sequelize ORM
- JWT Authentication
- Multer (uploads)

---

### 4. Admin Panel (Frontend)
**Funcao:** Interface administrativa

**Responsabilidades:**
- Dashboard de metricas
- Gerenciamento de conteudo
- Configuracao de anuncios
- Gestao de usuarios
- Biblioteca de midia

**Tecnologias:**
- React 18
- Vite
- TailwindCSS
- React Router
- React Query
- EditorJS

---

### 5. MySQL Database
**Funcao:** Persistencia de dados

**Responsabilidades:**
- Armazenamento Ghost (posts, users, tags)
- Armazenamento API (settings, views, media)
- Transacoes ACID
- Backup e recuperacao

**Configuracao:**
- MySQL 8.0
- UTF8MB4 encoding
- InnoDB engine

---

## Fluxo de Dados

### Leitura de Artigo (Leitor)
```
1. Usuario acessa URL do artigo
2. Nginx roteia para Ghost
3. Ghost busca dados no MySQL
4. Ghost renderiza template Handlebars
5. JavaScript carrega ads e tracking
6. API registra visualizacao
```

### Criacao de Artigo (Editor)
```
1. Editor acessa Admin Panel
2. Frontend autentica via API (JWT)
3. Editor escreve conteudo
4. API envia para Ghost via Admin API
5. Ghost salva no MySQL
6. Artigo disponivel no site
```

### Configuracao de Anuncios (Admin)
```
1. Admin acessa configuracoes
2. Frontend busca settings da API
3. Admin altera configuracoes
4. API salva no MySQL
5. Site publico le novas configs
6. Anuncios atualizados dinamicamente
```

---

## Comunicacao entre Servicos

| Origem | Destino | Protocolo | Autenticacao |
|--------|---------|-----------|--------------|
| Nginx | Ghost | HTTP | - |
| Nginx | API | HTTP | - |
| Nginx | Admin | HTTP | - |
| API | Ghost | HTTP | Ghost Admin API Key |
| API | MySQL | TCP | User/Password |
| Ghost | MySQL | TCP | User/Password |
| Admin | API | HTTP | JWT Bearer Token |
| Theme JS | API | HTTP | - (public endpoints) |

---

## Rede Docker

Todos os servicos rodam na mesma rede Docker:
```
Network: o-investigador-network
Type: bridge
```

### DNS Interno
- `mysql` -> Container MySQL
- `ghost` -> Container Ghost
- `api` -> Container API
- `admin` -> Container Admin
- `nginx` -> Container Nginx

---

## Volumes Persistentes

| Volume | Conteudo | Backup |
|--------|----------|--------|
| `mysql_data` | Banco de dados | Critico |
| `ghost_content` | Imagens Ghost | Importante |
| `api_uploads` | Uploads via API | Importante |

---

## Escalabilidade

### Horizontal (Multiplas Instancias)
- Ghost: Suporta multiplas instancias com MySQL compartilhado
- API: Stateless, pode escalar livremente
- Admin: Estatico, pode usar CDN

### Vertical (Mais Recursos)
- MySQL: Pode aumentar RAM/CPU
- Ghost: Memoria para cache
- Nginx: Conexoes simultaneas

---

## Proximos Passos

Para detalhes de cada servico, consulte:
- [Servicos Detalhados](./services.md)
- [Banco de Dados](./database.md)
- [API Endpoints](./api-endpoints.md)
