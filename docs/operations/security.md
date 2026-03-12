# Seguranca

## Visao Geral

Este documento descreve as praticas de seguranca implementadas e recomendacoes.

---

## Medidas Implementadas

### Infraestrutura

| Medida | Status | Descricao |
|--------|--------|-----------|
| HTTPS/SSL | Ativo | Let's Encrypt, renovacao automatica |
| Firewall | Ativo | UFW configurado |
| Rate Limiting | Ativo | Nginx + Express |
| Isolamento Docker | Ativo | Rede bridge isolada |

### Aplicacao

| Medida | Status | Descricao |
|--------|--------|-----------|
| JWT Auth | Ativo | Tokens com expiracao |
| Password Hashing | Ativo | bcrypt |
| CORS | Ativo | Origins restritas |
| Helmet.js | Ativo | Headers de seguranca |
| Input Validation | Ativo | Joi validation |

---

## Autenticacao

### JWT Tokens
- Algoritmo: HS256
- Expiracao: 24 horas
- Secret: Minimo 32 caracteres

### Senhas
- Hash: bcrypt
- Salt rounds: 10
- Requisitos minimos recomendados:
  - 8+ caracteres
  - Letras e numeros
  - Caractere especial

### Rate Limiting de Login
```
5 tentativas por 15 minutos por IP
```

---

## Headers de Seguranca

### Configurados via Helmet.js
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Content Security Policy (Recomendado)
Adicionar ao Nginx ou aplicacao:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; ...
```

---

## Firewall (UFW)

### Portas Abertas
| Porta | Servico | Acesso |
|-------|---------|--------|
| 22 | SSH | IP especifico (recomendado) |
| 80 | HTTP | Publico (redireciona para HTTPS) |
| 443 | HTTPS | Publico |

### Verificar Status
```bash
sudo ufw status verbose
```

### Regras Recomendadas
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## SSL/TLS

### Certificados
- Provider: Let's Encrypt
- Renovacao: Automatica (certbot timer)
- Validade: 90 dias

### Verificar
```bash
certbot certificates
```

### Configuracao Nginx
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...
```

---

## Variaveis Sensiveis

### Nunca Commitar
- `.env` (arquivo de ambiente)
- Chaves de API
- Senhas
- Tokens de acesso
- Certificados SSL privados

### .gitignore
```
.env
*.pem
*.key
node_modules/
```

### Verificar Exposicao
```bash
# Buscar por padroes sensiveis no historico
git log -p | grep -i "password\|secret\|api_key"
```

---

## Banco de Dados

### Acesso Restrito
- MySQL so aceita conexoes da rede Docker
- Porta 3306 nao exposta externamente
- Usuario com privilegios minimos

### Backup Seguro
- Backups comprimidos (.gz)
- Armazenados fora do webroot
- Opcional: Encriptacao

---

## Protecao contra Ataques

### SQL Injection
- Sequelize com queries parametrizadas
- Validacao de input

### XSS (Cross-Site Scripting)
- Sanitizacao de output no Ghost
- Content Security Policy
- X-XSS-Protection header

### CSRF (Cross-Site Request Forgery)
- Tokens JWT (stateless)
- SameSite cookies

### DDoS
- Rate limiting no Nginx
- Rate limiting na API
- Cloudflare (opcional)

---

## Atualizacoes

### Sistema Operacional
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Reiniciar se necessario
sudo reboot
```

### Docker Images
```bash
docker compose pull
docker compose up -d
```

### Node.js Dependencies
```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente
npm audit fix
```

---

## Logs de Seguranca

### Monitorar Tentativas de Login
```bash
docker compose logs api | grep -i "login\|auth\|401"
```

### Logs de Acesso Nginx
```bash
docker exec o-investigador-nginx cat /var/log/nginx/access.log
```

### Tentativas SSH
```bash
sudo tail -100 /var/log/auth.log
```

---

## Checklist de Seguranca

### Inicial (Setup)
- [ ] Firewall configurado
- [ ] SSH com chave (sem senha)
- [ ] SSL/HTTPS ativo
- [ ] Senhas fortes definidas
- [ ] .env nao no Git

### Periodico (Mensal)
- [ ] Atualizar sistema operacional
- [ ] Atualizar dependencias (npm audit)
- [ ] Revisar logs de acesso
- [ ] Verificar usuarios ativos
- [ ] Testar backups

### Anual
- [ ] Rotacionar senhas
- [ ] Rotacionar API keys
- [ ] Revisar permissoes de usuarios
- [ ] Pentest (se aplicavel)

---

## Resposta a Incidentes

### Se Detectar Invasao

1. **Isolar**
   ```bash
   # Desconectar servidor da rede se possivel
   # Ou bloquear IPs suspeitos
   sudo ufw deny from IP_SUSPEITO
   ```

2. **Preservar Evidencias**
   ```bash
   # Copiar logs
   cp -r /var/log /backup/logs_$(date +%Y%m%d)
   docker compose logs > /backup/docker_logs.txt
   ```

3. **Analisar**
   - Revisar logs de acesso
   - Verificar arquivos modificados
   - Identificar vetor de ataque

4. **Remediar**
   - Corrigir vulnerabilidade
   - Rotacionar credenciais
   - Restaurar de backup limpo

5. **Documentar**
   - Timeline do incidente
   - Acoes tomadas
   - Licoes aprendidas

---

## Contatos de Emergencia

Em caso de incidente de seguranca:

1. Administrador do Sistema: [definir]
2. Desenvolvedor Principal: [definir]
3. Provedor de Hospedagem: [definir]

---

## Recursos

### Ferramentas de Scan
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Security Headers](https://securityheaders.com/)

### Referencias
- OWASP Top 10
- CIS Benchmarks
- Docker Security Best Practices
