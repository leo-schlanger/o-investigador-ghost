# Setup Inicial - Ambiente de Desenvolvimento

## Pre-requisitos

### Software Necessario
| Software | Versao Minima | Download |
|----------|---------------|----------|
| Docker | 24.0+ | docker.com |
| Docker Compose | 2.20+ | Incluido no Docker Desktop |
| Node.js | 18 LTS | nodejs.org |
| Git | 2.40+ | git-scm.com |

### Verificar Instalacao
```bash
docker --version          # Docker version 24.x.x
docker compose version    # Docker Compose version v2.x.x
node --version            # v18.x.x ou v20.x.x
git --version             # git version 2.x.x
```

---

## Passo 1: Clonar Repositorio

```bash
git clone <url-do-repositorio> o-investigador-ghost
cd o-investigador-ghost
```

---

## Passo 2: Configurar Variaveis de Ambiente

### Copiar arquivo de exemplo
```bash
cp .env.example .env
```

### Editar .env
Abra o arquivo `.env` e configure:

```env
# === OBRIGATORIAS ===

# Banco de Dados
DB_HOST=mysql
DB_PORT=3306
DB_NAME=o_investigador
DB_USER=ghost
DB_PASSWORD=sua_senha_segura

# JWT (minimo 32 caracteres)
JWT_SECRET=gere_uma_chave_aleatoria_com_32_ou_mais_caracteres

# Ghost
GHOST_URL=http://localhost:2368
# GHOST_API_KEY sera gerado depois

# Admin
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=senha_admin_forte

# === OPCIONAIS ===

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:2368

# API
API_PORT=3001
```

### Gerar JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Passo 3: Iniciar Containers

### Subir todos os servicos
```bash
docker compose up -d --build
```

### Verificar status
```bash
docker compose ps
```

Todos devem estar "healthy" ou "running":
```
NAME                    STATUS
o-investigador-mysql    healthy
o-investigador-ghost    running
o-investigador-api      running
o-investigador-admin    running
o-investigador-nginx    running
```

---

## Passo 4: Configurar Ghost

### Acessar Ghost Admin
1. Abra: http://localhost:2368/ghost/
2. Crie sua conta de administrador Ghost
3. Siga o wizard de configuracao

### Obter API Key
1. Ghost Admin > Settings > Integrations
2. Clique em "Add custom integration"
3. Nome: "O Investigador API"
4. Copie a "Admin API Key"

### Adicionar ao .env
```env
GHOST_API_KEY=sua_admin_api_key_aqui
```

### Reiniciar API
```bash
docker compose restart api
```

---

## Passo 5: Instalar Tema

### O tema ja esta montado via volume
O docker-compose.yml monta `./ghost-theme` em `/var/lib/ghost/content/themes/o-investigador-theme`

### Ativar tema
1. Ghost Admin > Settings > Design
2. Selecione "o-investigador-theme"
3. Clique em "Activate"

---

## Passo 6: Verificar Funcionamento

### Site Publico
- URL: http://localhost:2368
- Deve exibir o tema do O Investigador

### Ghost Admin
- URL: http://localhost:2368/ghost/
- Login com credenciais criadas

### API Backend
- URL: http://localhost:3001/health
- Resposta: `{"status":"ok"}`

### Admin Panel
- URL: http://localhost:5173
- Login com ADMIN_EMAIL e ADMIN_PASSWORD do .env

---

## Estrutura de Portas

| Servico | Porta | URL |
|---------|-------|-----|
| Nginx | 80 | http://localhost |
| Ghost | 2368 | http://localhost:2368 |
| API | 3001 | http://localhost:3001 |
| Admin | 5173 | http://localhost:5173 |
| MySQL | 3306 | localhost:3306 |

---

## Comandos Uteis

### Logs
```bash
# Todos os servicos
docker compose logs -f

# Servico especifico
docker compose logs -f api
docker compose logs -f ghost
```

### Reiniciar
```bash
# Todos
docker compose restart

# Especifico
docker compose restart api
```

### Parar
```bash
docker compose down
```

### Rebuild
```bash
docker compose up -d --build
```

### Limpar tudo (cuidado!)
```bash
docker compose down -v  # Remove volumes (dados)
docker system prune -a  # Remove imagens nao usadas
```

---

## Desenvolvimento Local (Sem Docker)

### Backend (API)
```bash
cd cms-api
npm install
npm run dev  # Porta 3001, hot-reload
```

### Frontend (Admin)
```bash
cd admin-panel
npm install
npm run dev  # Porta 5173, hot-reload
```

### Ghost Theme (CSS)
```bash
cd ghost-theme
npm install
npm run dev  # Watch mode para Tailwind
```

---

## Problemas Comuns

### Porta ja em uso
```bash
# Verificar o que esta usando a porta
netstat -ano | findstr :3306  # Windows
lsof -i :3306                  # Linux/Mac

# Mudar porta no docker-compose
ports:
  - "3307:3306"  # Usa 3307 externamente
```

### MySQL nao inicia
```bash
# Ver logs
docker compose logs mysql

# Verificar volume
docker volume ls
docker volume inspect o-investigador-ghost_mysql_data
```

### Ghost nao conecta no MySQL
1. Verifique se MySQL esta healthy
2. Confira variaveis de ambiente
3. Aguarde 30-60 segundos na primeira vez

### API retorna 401
1. Verifique se GHOST_API_KEY esta correto
2. Reinicie o container da API
3. Gere nova chave no Ghost se necessario

---

## Proximos Passos

- [Guia de Desenvolvimento](./development.md)
- [Executar Testes](./testing.md)
- [Deploy em Producao](./deployment.md)
