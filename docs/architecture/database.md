# Banco de Dados - Estrutura

## Visao Geral

O sistema utiliza um unico banco de dados MySQL compartilhado entre Ghost CMS e a API customizada.

---

## Diagrama de Tabelas

```
+------------------------------------------------------------------+
|                    BANCO: o_investigador                          |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------------+        +------------------------+          |
|  |   GHOST TABLES    |        |     API TABLES         |          |
|  +-------------------+        +------------------------+          |
|  | posts             |        | users                  |          |
|  | users (ghost)     |        | settings               |          |
|  | tags              |        | media                  |          |
|  | posts_tags        |        | media_folders          |          |
|  | members           |        | media_tags             |          |
|  | newsletters       |        | media_tag_assignments  |          |
|  | ...               |        | post_views             |          |
|  +-------------------+        +------------------------+          |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Tabelas da API Customizada

### users
Usuarios administrativos do painel.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | INT AUTO_INCREMENT | Identificador unico |
| email | VARCHAR(255) UNIQUE | Email de login |
| password | VARCHAR(255) | Hash bcrypt |
| name | VARCHAR(255) | Nome exibido |
| role | ENUM | admin, editor, author |
| createdAt | DATETIME | Data de criacao |
| updatedAt | DATETIME | Ultima atualizacao |

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role ENUM('admin', 'editor', 'author') DEFAULT 'author',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### settings
Configuracoes do sistema (chave-valor).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | INT AUTO_INCREMENT | Identificador unico |
| key | VARCHAR(255) UNIQUE | Chave da configuracao |
| value | TEXT | Valor (pode ser JSON) |
| createdAt | DATETIME | Data de criacao |
| updatedAt | DATETIME | Ultima atualizacao |

**Chaves Conhecidas:**
| Key | Tipo de Valor | Descricao |
|-----|---------------|-----------|
| adsEnabled | "true"/"false" | Ativar anuncios |
| adsenseClientId | string | ID do AdSense |
| adSlots | JSON | Configuracao dos slots |

```sql
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### post_views
Rastreamento de visualizacoes de artigos.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | INT AUTO_INCREMENT | Identificador unico |
| postId | VARCHAR(255) UNIQUE | ID do post no Ghost |
| postSlug | VARCHAR(255) | Slug do post |
| postTitle | VARCHAR(500) | Titulo do post |
| viewCount | INT | Contador de views |
| lastViewedAt | DATETIME | Ultima visualizacao |
| createdAt | DATETIME | Data de criacao |
| updatedAt | DATETIME | Ultima atualizacao |

```sql
CREATE TABLE post_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(255) NOT NULL UNIQUE,
    postSlug VARCHAR(255),
    postTitle VARCHAR(500),
    viewCount INT DEFAULT 0,
    lastViewedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### media
Metadados de arquivos enviados via API.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| filename | VARCHAR(255) | Nome do arquivo |
| originalName | VARCHAR(255) | Nome original |
| mimeType | VARCHAR(100) | Tipo MIME |
| size | INT | Tamanho em bytes |
| url | VARCHAR(500) | URL publica |
| folderId | UUID | FK para MediaFolders (nullable) |
| createdAt | DATETIME | Data de upload |
| updatedAt | DATETIME | Ultima atualizacao |

```sql
CREATE TABLE media (
    id CHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    originalName VARCHAR(255),
    mimeType VARCHAR(100),
    size INT,
    url VARCHAR(500),
    folderId CHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (folderId) REFERENCES MediaFolders(id) ON DELETE SET NULL
);
```

---

### media_folders
Pastas para organizar midias (hierarquicas).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| name | VARCHAR(255) | Nome da pasta |
| parentId | UUID | FK para pasta pai (nullable) |
| createdAt | DATETIME | Data de criacao |
| updatedAt | DATETIME | Ultima atualizacao |

```sql
CREATE TABLE MediaFolders (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parentId CHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES MediaFolders(id) ON DELETE SET NULL
);
```

---

### media_tags
Tags para classificacao de midias.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| name | VARCHAR(255) | Nome da tag (unico) |
| slug | VARCHAR(255) | Slug URL-friendly (unico) |
| createdAt | DATETIME | Data de criacao |
| updatedAt | DATETIME | Ultima atualizacao |

```sql
CREATE TABLE MediaTags (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### media_tag_assignments
Tabela de juncao para relacao N:N entre Media e Tags.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| mediaId | UUID | FK para Media |
| tagId | UUID | FK para MediaTags |
| createdAt | DATETIME | Data de criacao |
| updatedAt | DATETIME | Ultima atualizacao |

```sql
CREATE TABLE MediaTagAssignments (
    mediaId CHAR(36) NOT NULL,
    tagId CHAR(36) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (mediaId, tagId),
    FOREIGN KEY (mediaId) REFERENCES Media(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES MediaTags(id) ON DELETE CASCADE
);
```

---

## Tabelas do Ghost (Principais)

O Ghost gerencia suas proprias tabelas. As mais relevantes sao:

### posts
| Coluna | Descricao |
|--------|-----------|
| id | UUID do post |
| uuid | UUID publico |
| title | Titulo |
| slug | URL amigavel |
| html | Conteudo HTML |
| plaintext | Conteudo texto |
| feature_image | Imagem destaque |
| status | draft, published, scheduled |
| visibility | public, members, paid |
| published_at | Data publicacao |

### tags
| Coluna | Descricao |
|--------|-----------|
| id | UUID da tag |
| name | Nome exibido |
| slug | URL amigavel |
| description | Descricao |

### members
| Coluna | Descricao |
|--------|-----------|
| id | UUID do membro |
| email | Email |
| name | Nome |
| status | free, paid |
| subscribed | Boolean |

---

## Backup e Restauracao

### Backup Manual
```bash
docker exec o-investigador-db mysqldump \
    -u ghost -p \
    --single-transaction \
    o_investigador > backup.sql
```

### Restauracao
```bash
docker exec -i o-investigador-db mysql \
    -u ghost -p \
    o_investigador < backup.sql
```

### Backup Automatizado
O script `infrastructure/scripts/backup.sh` realiza backup diario as 3h e mantem os ultimos 7 dias.

---

## Indices Recomendados

```sql
-- Settings: busca por chave
CREATE INDEX idx_settings_key ON settings(`key`);

-- Post Views: busca por postId e ordenacao
CREATE INDEX idx_post_views_postId ON post_views(postId);
CREATE INDEX idx_post_views_count ON post_views(viewCount DESC);

-- Media: busca por filename
CREATE INDEX idx_media_filename ON media(filename);
```

---

## Conexao

### Desenvolvimento
```
Host: localhost
Port: 3306
Database: o_investigador
User: ghost
Password: (ver .env)
```

### Producao (Docker)
```
Host: mysql (nome do container)
Port: 3306
Database: o_investigador
User: ghost
Password: (var de ambiente)
```

---

## Sequelize Models

Os modelos Sequelize estao em `cms-api/src/models/`:

```javascript
// Exemplo: User.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: DataTypes.STRING,
        role: {
            type: DataTypes.ENUM('admin', 'editor', 'author'),
            defaultValue: 'author'
        }
    });
    return User;
};
```

---

## Migracoes

Atualmente o sistema usa `sync({ alter: true })` para sincronizar o schema. Para producao, considere usar migracoes Sequelize:

```bash
# Criar migracao
npx sequelize migration:create --name add-column-example

# Rodar migracoes
npx sequelize db:migrate

# Reverter
npx sequelize db:migrate:undo
```
