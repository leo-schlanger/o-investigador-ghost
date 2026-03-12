# Troubleshooting - Resolucao de Problemas

## Indice

1. [Problemas de Docker](#problemas-de-docker)
2. [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
3. [Problemas de API](#problemas-de-api)
4. [Problemas de Ghost](#problemas-de-ghost)
5. [Problemas de Frontend](#problemas-de-frontend)
6. [Problemas de Deploy](#problemas-de-deploy)
7. [Problemas de Performance](#problemas-de-performance)

---

## Problemas de Docker

### Container nao inicia
**Sintoma:** `docker compose up` falha ou container fica em restart loop

**Diagnostico:**
```bash
docker compose ps
docker compose logs <servico>
```

**Solucoes:**
1. Verificar se portas estao livres
```bash
netstat -tulpn | grep :3306
```

2. Verificar variaveis de ambiente
```bash
docker compose config
```

3. Rebuild forcado
```bash
docker compose down
docker compose up -d --build --force-recreate
```

---

### Porta ja em uso
**Sintoma:** `Bind for 0.0.0.0:3306 failed: port is already allocated`

**Solucao:**
1. Encontrar processo usando a porta
```bash
# Linux/Mac
lsof -i :3306 | grep LISTEN

# Windows
netstat -ano | findstr :3306
```

2. Parar processo ou mudar porta no docker-compose

---

### Disco cheio
**Sintoma:** Containers param, erros de "no space left"

**Solucao:**
```bash
# Ver uso de disco Docker
docker system df

# Limpar recursos nao usados
docker system prune -a

# Limpar volumes nao usados (CUIDADO com dados!)
docker volume prune
```

---

## Problemas de Banco de Dados

### MySQL nao conecta
**Sintoma:** `ECONNREFUSED` ou `Connection refused`

**Diagnostico:**
```bash
docker compose ps mysql
docker compose logs mysql
```

**Solucoes:**
1. Aguardar MySQL ficar healthy (pode levar 60s)
2. Verificar credenciais no .env
3. Reiniciar MySQL
```bash
docker compose restart mysql
```

---

### Tabelas nao existem
**Sintoma:** `Table doesn't exist`

**Solucao:**
```bash
# Reiniciar API para sync de schema
docker compose restart api
```

Ou forcar sync:
```bash
docker exec -it o-investigador-api sh
node -e "require('./src/models').sequelize.sync({force:true})"
# CUIDADO: force:true apaga dados!
```

---

### Dados corrompidos
**Sintoma:** MySQL nao inicia, erros de corrupcao

**Solucao:**
1. Restaurar backup
```bash
docker exec -i o-investigador-db mysql -u ghost -p o_investigador < backup.sql
```

2. Se nao tiver backup, recriar volume (perde dados!)
```bash
docker compose down -v
docker compose up -d
```

---

## Problemas de API

### 401 Unauthorized
**Sintoma:** API retorna 401 em todas as requisicoes

**Causas:**
1. Token JWT expirado
2. JWT_SECRET diferente entre restarts
3. GHOST_API_KEY invalida

**Solucoes:**
1. Fazer login novamente
2. Verificar JWT_SECRET no .env
3. Gerar nova API key no Ghost

---

### 500 Internal Server Error
**Sintoma:** API retorna erro 500

**Diagnostico:**
```bash
docker compose logs api --tail=100
```

**Causas comuns:**
- Banco de dados indisponivel
- Variavel de ambiente faltando
- Erro de codigo

---

### Rate Limit
**Sintoma:** `Too Many Requests` (429)

**Solucao:**
- Aguardar 15 minutos
- Em desenvolvimento, aumentar limite em `server.js`

---

## Problemas de Ghost

### Ghost nao inicia
**Sintoma:** Container ghost fica reiniciando

**Diagnostico:**
```bash
docker compose logs ghost
```

**Causas comuns:**
1. MySQL indisponivel
2. URL configurada incorretamente
3. Permissoes de arquivo

**Solucoes:**
```bash
# Verificar MySQL primeiro
docker compose ps mysql

# Verificar URL no env
echo $GHOST_URL

# Corrigir permissoes
docker exec -it o-investigador-ghost chown -R node:node /var/lib/ghost/content
```

---

### Tema nao aparece
**Sintoma:** Tema custom nao esta disponivel no Ghost

**Solucoes:**
1. Verificar volume mount no docker-compose
2. Reiniciar Ghost
```bash
docker compose restart ghost
```
3. Verificar estrutura do tema (deve ter package.json)

---

### Imagens nao carregam
**Sintoma:** Imagens 404 no site

**Causas:**
1. URL base incorreta
2. Volume nao montado
3. Permissoes

**Solucoes:**
```bash
# Verificar volume
docker exec -it o-investigador-ghost ls -la /var/lib/ghost/content/images

# Corrigir permissoes
docker exec -it o-investigador-ghost chown -R node:node /var/lib/ghost/content
```

---

## Problemas de Frontend

### Pagina em branco
**Sintoma:** Admin panel mostra tela branca

**Diagnostico:**
- Abrir DevTools (F12)
- Verificar Console e Network

**Causas comuns:**
1. Erro de JavaScript
2. API indisponivel
3. CORS bloqueando

---

### CORS Error
**Sintoma:** `Access-Control-Allow-Origin` error no console

**Solucoes:**
1. Verificar CORS_ORIGIN no .env da API
2. Incluir URL do frontend na lista
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:2368
```

---

### Login nao funciona
**Sintoma:** Login redireciona de volta ou da erro

**Diagnostico:**
1. Verificar Network tab
2. Ver resposta da API /auth/login

**Solucoes:**
1. Limpar localStorage
```javascript
localStorage.clear()
```
2. Verificar se API esta rodando
3. Verificar credenciais

---

## Problemas de Deploy

### Deploy falha no GitHub Actions
**Sintoma:** Workflow falha

**Diagnostico:**
1. Ver logs no GitHub Actions
2. Verificar secrets configurados

**Causas comuns:**
1. SSH key invalida
2. VPS inacessivel
3. Disco cheio na VPS

---

### Servico nao atualiza
**Sintoma:** Codigo antigo apos deploy

**Solucoes:**
```bash
# Na VPS
cd /opt/o-investigador
git status
git log --oneline -5

# Forcar rebuild
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

---

### SSL nao funciona
**Sintoma:** HTTPS nao carrega ou certificado invalido

**Solucoes:**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar
sudo certbot renew

# Reiniciar nginx
docker compose restart nginx
```

---

## Problemas de Performance

### Site lento
**Diagnostico:**
```bash
# Verificar recursos
docker stats

# Ver uso de disco
df -h

# Ver memoria
free -m
```

**Solucoes:**
1. Aumentar recursos da VPS
2. Otimizar queries
3. Implementar cache

---

### Container usando muita memoria
**Solucao:** Adicionar limites no docker-compose
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Comandos Uteis

### Diagnostico Geral
```bash
# Status de todos os containers
docker compose ps

# Logs de todos
docker compose logs -f

# Uso de recursos
docker stats

# Espaco em disco
docker system df
df -h
```

### Reiniciar Servicos
```bash
# Todos
docker compose restart

# Especifico
docker compose restart api

# Rebuild especifico
docker compose up -d --build api
```

### Acessar Container
```bash
docker exec -it o-investigador-api sh
docker exec -it o-investigador-db mysql -u ghost -p
```

### Backup de Emergencia
```bash
./infrastructure/scripts/backup.sh
```

---

## Quando Escalar

Se o problema persistir:
1. Documente o erro completo
2. Colete logs relevantes
3. Abra issue no repositorio
4. Contate equipe de suporte
