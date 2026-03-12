# Deployment Guide - O Investigador

Este guia explica como configurar o deploy automático via GitHub Actions.

## Visão Geral

```
[Push para main] → [GitHub Actions] → [SSH para VPS] → [Deploy automático]
```

O sistema faz deploy automaticamente quando você dá push na branch `main`, **sem derrubar o banco de dados**.

---

## Setup Inicial (Uma vez só)

### 1. Configurar Secrets no GitHub

Vá em: **Repository → Settings → Secrets and variables → Actions → New repository secret**

Adicione os seguintes secrets:

| Secret Name | Descrição | Exemplo |
|-------------|-----------|---------|
| `VPS_HOST` | IP ou hostname da VPS | `192.168.1.100` ou `minha-vps.com` |
| `VPS_USER` | Usuário SSH | `root` ou `deploy` |
| `VPS_SSH_KEY` | Chave SSH privada completa | (ver abaixo) |
| `VPS_PORT` | Porta SSH (opcional, default: 22) | `22` |

### 2. Gerar Chave SSH para Deploy

Na sua máquina local ou na VPS:

```bash
# Gerar chave específica para deploy
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# Mostra a chave privada (copie TUDO para o secret VPS_SSH_KEY)
cat ~/.ssh/github_deploy

# Mostra a chave pública (adicione na VPS)
cat ~/.ssh/github_deploy.pub
```

### 3. Autorizar a Chave na VPS

Na VPS:

```bash
# Adicione a chave pública ao authorized_keys
echo "CONTEUDO_DA_CHAVE_PUBLICA" >> ~/.ssh/authorized_keys

# Ajuste permissões
chmod 600 ~/.ssh/authorized_keys
```

### 4. Configurar o Projeto na VPS

```bash
# Clone o repositório (primeira vez)
cd /opt
git clone https://github.com/SEU_USUARIO/o-investigador-ghost.git o-investigador
cd o-investigador

# Copie e configure o .env
cp .env.example .env
nano .env  # Configure todas as variáveis

# Dê permissão aos scripts
chmod +x infrastructure/scripts/*.sh

# Inicie o projeto pela primeira vez
docker compose -f docker-compose.prod.yml up -d
```

---

## Como Funciona

### Deploy Automático

1. Você faz `git push origin main`
2. GitHub Actions é acionado
3. Conecta via SSH na VPS
4. Executa `deploy-safe.sh`
5. Atualiza **apenas** os serviços da aplicação (api, admin, ghost, nginx)
6. **MySQL permanece rodando** - dados preservados!

### Serviços Atualizados no Deploy

| Serviço | Atualizado? | Motivo |
|---------|-------------|--------|
| `mysql` | **NÃO** | Preserva dados do banco |
| `ghost` | SIM | Código do tema atualizado |
| `api` | SIM | Backend Node.js |
| `admin` | SIM | Frontend React |
| `nginx` | SIM | Configurações de proxy |

---

## Comandos Úteis

### Na VPS

```bash
cd /opt/o-investigador

# Ver status dos containers
docker compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de um serviço específico
docker compose -f docker-compose.prod.yml logs -f api

# Reiniciar um serviço manualmente
docker compose -f docker-compose.prod.yml restart api

# Deploy manual
./infrastructure/scripts/deploy-safe.sh

# Rollback para commit anterior
./infrastructure/scripts/rollback.sh

# Rollback para commit específico
./infrastructure/scripts/rollback.sh abc1234
```

### Deploy Manual pelo GitHub

1. Vá em: **Repository → Actions → Deploy to VPS**
2. Clique em **Run workflow**
3. Selecione a branch `main`
4. Clique em **Run workflow**

---

## Troubleshooting

### Deploy falhou - como verificar?

```bash
# Na VPS, veja os logs recentes
cd /opt/o-investigador
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Serviço não está respondendo

```bash
# Verificar se está rodando
docker ps

# Reiniciar o serviço
docker compose -f docker-compose.prod.yml restart api

# Ver logs do serviço
docker compose -f docker-compose.prod.yml logs api
```

### Preciso reverter um deploy

```bash
cd /opt/o-investigador

# Voltar para o commit anterior
./infrastructure/scripts/rollback.sh

# Ou para um commit específico
git log --oneline -10  # Ver commits recentes
./infrastructure/scripts/rollback.sh abc1234
```

### MySQL não está conectando

```bash
# Verificar se MySQL está rodando
docker compose -f docker-compose.prod.yml ps mysql

# Ver logs do MySQL
docker compose -f docker-compose.prod.yml logs mysql

# Reiniciar apenas o MySQL (cuidado - pode demorar)
docker compose -f docker-compose.prod.yml restart mysql
```

---

## Estrutura de Arquivos

```
.github/
└── workflows/
    ├── ci.yml          # Testes automáticos
    └── deploy.yml      # Deploy automático

infrastructure/
└── scripts/
    ├── deploy-safe.sh  # Deploy sem derrubar o banco
    ├── rollback.sh     # Reverter para versão anterior
    └── backup.sh       # Backup do banco
```

---

## Segurança

- **Nunca** commite o arquivo `.env` (está no .gitignore)
- **Nunca** commite chaves SSH
- Use um usuário dedicado para deploy (não root, se possível)
- Mantenha a VPS atualizada: `apt update && apt upgrade`

---

## Backup

O banco de dados é preservado entre deploys, mas faça backups regulares.

### Backup Manual

```bash
# Backup manual
./infrastructure/scripts/backup.sh

# Backups são salvos em /opt/o-investigador/backups/
```

### Backup Automático (Recomendado)

Configure backups automáticos diários usando o script de setup:

```bash
# Instalar cron job para backup automático
sudo ./infrastructure/scripts/setup-cron.sh
```

Isso irá:
- Instalar cron job em `/etc/cron.d/o-investigador-backup`
- Executar backup diariamente às 3:00 AM
- Salvar logs em `/var/log/o-investigador-backup.log`

### Verificar Backup Automático

```bash
# Ver status do cron
systemctl status cron

# Ver cron jobs instalados
cat /etc/cron.d/o-investigador-backup

# Ver logs de backup
tail -f /var/log/o-investigador-backup.log

# Listar backups existentes
ls -lh /opt/o-investigador/backups/
```

### Configuração de Upload S3 (Opcional)

Para enviar backups para AWS S3, configure no `.env`:

```bash
AWS_BUCKET=seu-bucket-de-backup
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
```
