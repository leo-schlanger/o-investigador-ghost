# Deploy em Producao

## Visao Geral

O deploy e automatizado via GitHub Actions quando ha push na branch `main`.

```
[Push main] -> [GitHub Actions] -> [SSH VPS] -> [Deploy Script]
```

---

## Pre-requisitos

### Servidor (VPS)
- Ubuntu 22.04 LTS ou superior
- 4 GB RAM minimo
- 50 GB SSD
- Docker e Docker Compose instalados
- Acesso SSH configurado

### GitHub
- Repositorio com Actions habilitado
- Secrets configurados

---

## Configurar Secrets no GitHub

Acesse: **Repository > Settings > Secrets and variables > Actions**

| Secret | Descricao | Exemplo |
|--------|-----------|---------|
| `VPS_HOST` | IP ou hostname | `192.168.1.100` |
| `VPS_USER` | Usuario SSH | `deploy` |
| `VPS_SSH_KEY` | Chave privada SSH | `-----BEGIN...` |
| `VPS_PORT` | Porta SSH (opcional) | `22` |

### Gerar Chave SSH
```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy      # Copiar para VPS_SSH_KEY
cat ~/.ssh/github_deploy.pub  # Adicionar na VPS
```

### Autorizar na VPS
```bash
echo "CHAVE_PUBLICA" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## Setup Inicial da VPS

### 1. Instalar Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Clonar Repositorio
```bash
cd /opt
sudo git clone <repo-url> o-investigador
sudo chown -R $USER:$USER o-investigador
cd o-investigador
```

### 3. Configurar Ambiente
```bash
cp .env.example .env
nano .env  # Configurar todas as variaveis
```

### 4. Primeira Execucao
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 5. Configurar SSL
```bash
sudo ./infrastructure/scripts/vps-setup.sh
```

---

## Processo de Deploy

### Automatico (Recomendado)

1. Fazer push para `main`
2. GitHub Actions e acionado
3. Conecta via SSH na VPS
4. Executa `deploy-safe.sh`
5. Atualiza servicos (exceto MySQL)
6. Verifica health checks

### Manual

```bash
ssh user@vps
cd /opt/o-investigador
./infrastructure/scripts/deploy-safe.sh
```

---

## Script deploy-safe.sh

O script realiza:

1. **Git Pull** - Baixa codigo mais recente
2. **Build** - Reconstroi imagens alteradas
3. **Update Seletivo** - Atualiza apenas:
   - ghost
   - api
   - admin
   - nginx
4. **Preserva MySQL** - Banco nunca e recriado
5. **Health Check** - Verifica se servicos estao ok

```bash
#!/bin/bash
set -e

cd /opt/o-investigador

# Pull latest
git fetch origin main
git reset --hard origin/main

# Build and update (exclude mysql)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build \
    ghost api admin nginx

# Health check
sleep 10
curl -f http://localhost:3001/health || exit 1

echo "Deploy completed!"
```

---

## Rollback

### Para Commit Anterior
```bash
./infrastructure/scripts/rollback.sh
```

### Para Commit Especifico
```bash
./infrastructure/scripts/rollback.sh abc1234
```

### Manual
```bash
cd /opt/o-investigador
git log --oneline -10  # Ver commits
git checkout abc1234
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Variaveis de Producao

### .env na VPS
```env
NODE_ENV=production

# URLs publicas
GHOST_URL=https://jornalinvestigador.pt
PUBLIC_API_URL=https://api.jornalinvestigador.pt
VITE_API_URL=https://api.jornalinvestigador.pt/api
VITE_GHOST_URL=https://jornalinvestigador.pt

# Banco
DB_HOST=mysql
DB_PORT=3306
DB_NAME=o_investigador
DB_USER=ghost
DB_PASSWORD=senha_muito_forte

# Auth
JWT_SECRET=chave_32_caracteres_ou_mais

# Ghost
GHOST_API_KEY=chave_da_integracao

# Email (opcional)
SENDGRID_API_KEY=SG.xxx
CONTACT_EMAIL=contato@jornalinvestigador.pt

# AWS (opcional)
AWS_BUCKET=backup-bucket
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

---

## Nginx em Producao

### Configuracao SSL
```nginx
server {
    listen 443 ssl http2;
    server_name jornalinvestigador.pt;

    ssl_certificate /etc/letsencrypt/live/jornalinvestigador.pt/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jornalinvestigador.pt/privkey.pem;

    # Rotas
    location / {
        proxy_pass http://ghost:2368;
    }

    location /api/ {
        proxy_pass http://api:3000/api/;
    }
}
```

### Renovar SSL
```bash
certbot renew --dry-run  # Testar
certbot renew            # Renovar
```

---

## Monitoramento

### Verificar Servicos
```bash
docker compose -f docker-compose.prod.yml ps
```

### Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f api --tail=100
```

### Health Checks
```bash
curl https://api.jornalinvestigador.pt/health
curl https://jornalinvestigador.pt
```

---

## Backup Automatico

### Configurar Cron
```bash
sudo ./infrastructure/scripts/setup-cron.sh
```

### Verificar
```bash
cat /etc/cron.d/o-investigador-backup
tail -f /var/log/o-investigador-backup.log
```

---

## Checklist de Deploy

### Antes
- [ ] Testes passando localmente
- [ ] Sem erros de lint
- [ ] Variaveis de ambiente configuradas
- [ ] Backup recente disponivel

### Durante
- [ ] Monitorar GitHub Actions
- [ ] Verificar logs da VPS

### Depois
- [ ] Testar site publico
- [ ] Testar admin panel
- [ ] Verificar health check da API
- [ ] Conferir se novos posts aparecem

---

## Troubleshooting

### Deploy Falhou
```bash
# Ver logs do Actions no GitHub
# Conectar na VPS e verificar
docker compose -f docker-compose.prod.yml logs --tail=50
```

### Servico Nao Inicia
```bash
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml logs api
```

### Reverter Urgente
```bash
./infrastructure/scripts/rollback.sh
```

Consulte [Troubleshooting](./troubleshooting.md) para mais casos.
