# Guia de Deploy para ISSCLOUD

Este guia mostra como fazer o deploy do O Investigador no ISSCLOUD VPS (Classic S).

## Pré-requisitos

1. **Servidor ISSCLOUD VPS** (Classic S ou superior)
   - 4-6 vCPU
   - 8-16 GB RAM
   - 200-400 GB SSD NVMe
   - Ubuntu 22.04 LTS ou similar

2. **Software instalado no servidor:**
   - Docker Engine (latest)
   - Docker Compose V2
   - Git
   - Nginx (para proxy reverso)

## Configuração Inicial do Servidor ISSCLOUD

### 1. Conectar ao servidor via SSH

```bash
ssh root@your-isscloud-server-ip
```

### 2. Instalar Docker

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose-plugin -y

# Verificar instalação
docker --version
docker compose version
```

### 3. Clonar o repositório

```bash
cd /opt
git clone <your-repository-url> o-investigador-ghost
cd o-investigador-ghost
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Preencha as variáveis de ambiente necessárias:
```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=investigador_prod
DB_USER=postgres
DB_PASSWORD=<senha-forte>

# Ghost
GHOST_API_KEY=<sua-ghost-api-key>

# JWT
JWT_SECRET=<secret-forte-aleatorio>

# AWS S3 (para media storage)
AWS_BUCKET=<seu-bucket>
AWS_ACCESS_KEY_ID=<sua-key>
AWS_SECRET_ACCESS_KEY=<seu-secret>

# Email
SENDGRID_API_KEY=<sua-sendgrid-key>

# Docker Registry (opcional - deixe vazio para build local)
DOCKER_REGISTRY=
```

## Deploy

### Opção A: Deploy Direto no Servidor

Se você estiver conectado via SSH no servidor ISSCLOUD:

```bash
cd /opt/o-investigador-ghost
chmod +x infrastructure/scripts/deploy.sh
./infrastructure/scripts/deploy.sh
```

### Opção B: Deploy Remoto (do seu computador local)

Edite `infrastructure/scripts/deploy.sh` e descomente a seção de deploy SSH:

```bash
# Linha 26: descomente e ajuste
ssh user@your-isscloud-server.com "cd /opt/o-investigador-ghost && git pull && docker-compose -f docker-compose.prod.yml up -d --build"
```

Depois execute localmente:

```bash
./infrastructure/scripts/deploy.sh
```

## Configuração do Nginx (Proxy Reverso)

No servidor ISSCLOUD, configure o Nginx para rotear o tráfego:

```bash
sudo nano /etc/nginx/sites-available/o-investigador
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name oInvestigador.pt www.oInvestigador.pt;
    
    # Redirect to HTTPS (Configure SSL with Let's Encrypt first)
    # return 301 https://$server_name$request_uri;

    # Ghost (Main Site)
    location / {
        proxy_pass http://localhost:2368;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Admin Panel
    location /admin/ {
        proxy_pass http://localhost:5173/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Ative o site e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/o-investigador /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d oInvestigador.pt -d www.oInvestigador.pt
```

## Manutenção

### Ver logs dos containers

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Reiniciar serviços

```bash
docker compose -f docker-compose.prod.yml restart
```

### Parar todos os serviços

```bash
docker compose -f docker-compose.prod.yml down
```

### Fazer backup do banco de dados

```bash
./infrastructure/scripts/backup.sh
```

## Monitoramento

Para monitorar recursos do ISSCLOUD VPS:

```bash
# CPU e memória
htop

# Uso de disco
df -h

# Logs do Docker
docker stats
```

## Troubleshooting

### Containers não iniciam

```bash
# Ver logs detalhados
docker compose -f docker-compose.prod.yml logs ghost
docker compose -f docker-compose.prod.yml logs api
```

### Sem espaço em disco

```bash
# Limpar imagens antigas
docker system prune -a

# Limpar volumes não utilizados
docker volume prune
```

### Postgres connection error

Verifique se o container postgres está rodando:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs postgres
```

## Atualizações

Para atualizar a aplicação:

```bash
cd /opt/o-investigador-ghost
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```
