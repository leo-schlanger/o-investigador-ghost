#!/bin/bash
# =============================================================================
# SSL Renewal Setup (Webroot, Zero-Downtime) - O Investigador
# =============================================================================
# Migra a renovacao Let's Encrypt de `standalone` (precisa de PARAR o nginx para
# libertar a porta 80 -> ~20s de downtime a cada ~60 dias) para `webroot`
# (zero downtime: o nginx serve o desafio ACME a partir de um volume partilhado
# e e' apenas recarregado graciosamente apos a renovacao).
#
# Pre-requisitos (ja' configurados no repo):
#   - docker-compose.prod.yml monta /var/www/certbot no container nginx
#   - nginx-prod.conf serve /.well-known/acme-challenge/ a partir de /var/www/certbot
#
# Uso (como root na VPS):  sudo ./infrastructure/scripts/setup-ssl-renewal.sh
# Idempotente: seguro re-executar. NAO reemite o certificado atual.
# =============================================================================
set -euo pipefail

PROJECT_DIR="/opt/o-investigador"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
WEBROOT="/var/www/certbot"
CERT_NAME="jornalinvestigador.pt"
DOMAINS=(jornalinvestigador.pt www.jornalinvestigador.pt admin.jornalinvestigador.pt api.jornalinvestigador.pt)

GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[SSL]${NC} $1"; }
fail() { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

[ "$EUID" -eq 0 ] || fail "Executar como root (sudo)."
DOCKER_BIN="$(command -v docker)" || fail "docker nao encontrado no PATH."
RELOAD_CMD="$DOCKER_BIN compose -f $COMPOSE_FILE exec -T nginx nginx -s reload"

# 1. Criar o diretorio webroot do desafio ACME -------------------------------
log "A garantir o webroot em $WEBROOT ..."
mkdir -p "$WEBROOT/.well-known/acme-challenge"
chmod -R 755 "$WEBROOT"

# 2. Garantir que o nginx corre com o mount do webroot -----------------------
log "A (re)criar o nginx para apanhar o mount do webroot ..."
"$DOCKER_BIN" compose -f "$COMPOSE_FILE" up -d nginx
sleep 3

# 3. Verificar que o nginx serve o desafio sobre HTTP (prova o webroot) -------
TOKEN="setup-check-$(date +%s)"
echo "$TOKEN" > "$WEBROOT/.well-known/acme-challenge/$TOKEN"
log "A verificar http://${DOMAINS[0]}/.well-known/acme-challenge/$TOKEN ..."
if curl -fsS "http://${DOMAINS[0]}/.well-known/acme-challenge/$TOKEN" | grep -q "$TOKEN"; then
    log "Webroot acessivel sobre HTTP - OK"
else
    rm -f "$WEBROOT/.well-known/acme-challenge/$TOKEN"
    fail "Desafio ACME nao acessivel. Abortado ANTES de tocar no certbot (config segura)."
fi
rm -f "$WEBROOT/.well-known/acme-challenge/$TOKEN"

# 4. Mudar o autenticador para webroot SEM reemitir o cert -------------------
# `reconfigure` reescreve o renewal.conf (authenticator=webroot) e guarda o
# deploy-hook, validando a nova config com um dry-run real. O certificado em
# vigor NAO e' reemitido (mantem a validade atual).
log "A reconfigurar a renovacao para webroot (sem reemitir) ..."
certbot reconfigure --cert-name "$CERT_NAME" \
    --authenticator webroot --webroot-path "$WEBROOT" \
    --deploy-hook "$RELOAD_CMD" --non-interactive

# 5. Instalar/substituir o cron de renovacao (zero-downtime) -----------------
# O deploy-hook fica guardado no renewal.conf e corre em qualquer renovacao;
# o cron fica simples. Remove qualquer linha certbot antiga (ex.: standalone).
log "A instalar o cron de renovacao ..."
CRON_LINE="0 3 * * * certbot renew --quiet >> /var/log/certbot-renew.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'certbot renew' ; echo "$CRON_LINE" ) | crontab -
log "Cron instalado:"
crontab -l | grep certbot || true

# 6. Validar a renovacao ponta-a-ponta (desafio webroot real em staging) -----
log "A correr dry-run final da renovacao ..."
certbot renew --dry-run

log "Concluido. Renovacao agora e' zero-downtime (webroot + reload do nginx)."
