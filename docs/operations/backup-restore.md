# Backup e Restauracao

## Visao Geral

O sistema possui backup automatizado diario e suporte a backup manual.

---

## O que e Incluido no Backup

| Componente | Incluido | Metodo |
|------------|----------|--------|
| Banco MySQL | Sim | mysqldump |
| Imagens Ghost | Parcial | Volumes Docker |
| Configuracoes | Sim | Parte do banco |
| Codigo fonte | Nao | Git repository |

---

## Backup Automatico

### Configuracao
O cron job executa diariamente as 3:00 AM.

### Instalar/Verificar
```bash
# Instalar cron job
sudo ./infrastructure/scripts/setup-cron.sh

# Verificar instalacao
cat /etc/cron.d/o-investigador-backup

# Ver logs
tail -f /var/log/o-investigador-backup.log
```

### Localizacao dos Backups
```
/opt/o-investigador/backups/
├── db_backup_20240301_030000.sql.gz
├── db_backup_20240302_030000.sql.gz
└── ...
```

### Retencao
Por padrao, backups sao mantidos por 7 dias. Configure em .env:
```
RETENTION_DAYS=7
```

---

## Backup Manual

### Executar Backup
```bash
cd /opt/o-investigador
./infrastructure/scripts/backup.sh
```

### Saida Esperada
```
[INFO] Starting backup...
[INFO] Database: o_investigador
[INFO] Creating dump...
[INFO] Compressing backup...
[INFO] Backup created: backups/db_backup_20240315_143022.sql.gz (5.2M)
[INFO] Backup completed successfully!
```

---

## Backup para AWS S3

### Configurar
Adicione ao .env:
```
AWS_BUCKET=nome-do-seu-bucket
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
```

### Verificar Upload
```bash
aws s3 ls s3://nome-do-seu-bucket/backups/
```

---

## Restauracao

### Listar Backups Disponiveis
```bash
ls -la /opt/o-investigador/backups/
```

### Restaurar Backup

1. **Parar servicos que usam o banco**
```bash
docker compose -f docker-compose.prod.yml stop api ghost
```

2. **Descompactar backup**
```bash
gunzip -k backups/db_backup_20240315_143022.sql.gz
```

3. **Restaurar banco**
```bash
docker exec -i o-investigador-db mysql \
    -u ghost \
    -p"$DB_PASSWORD" \
    o_investigador < backups/db_backup_20240315_143022.sql
```

4. **Reiniciar servicos**
```bash
docker compose -f docker-compose.prod.yml start api ghost
```

5. **Verificar**
```bash
curl http://localhost:3001/health
curl http://localhost:2368
```

---

## Restaurar de S3

```bash
# Baixar do S3
aws s3 cp s3://bucket/backups/db_backup_20240315_143022.sql.gz ./

# Seguir passos de restauracao acima
```

---

## Backup de Emergencia

### Antes de Operacoes Arriscadas
```bash
# Backup rapido do banco
docker exec o-investigador-db mysqldump \
    -u ghost -p"$DB_PASSWORD" \
    --single-transaction \
    o_investigador > emergency_backup.sql
```

### Backup Completo de Volumes
```bash
# Parar containers
docker compose -f docker-compose.prod.yml down

# Criar tar dos volumes
sudo tar -czvf volumes_backup.tar.gz \
    /var/lib/docker/volumes/o-investigador-ghost_mysql_data \
    /var/lib/docker/volumes/o-investigador-ghost_ghost_content
```

---

## Verificar Integridade

### Testar Backup
```bash
# Verificar arquivo
gunzip -t backups/db_backup_20240315_143022.sql.gz
# Se nao retornar erro, arquivo esta integro

# Ver conteudo (primeiras linhas)
zcat backups/db_backup_20240315_143022.sql.gz | head -50
```

### Restaurar em Ambiente de Teste
Recomendado: Teste restauracao periodicamente em ambiente separado.

---

## Monitoramento de Backups

### Verificar Ultimo Backup
```bash
ls -lt /opt/o-investigador/backups/ | head -5
```

### Verificar Tamanho
```bash
du -sh /opt/o-investigador/backups/
```

### Alertas (Implementacao Futura)
Configurar alerta se backup nao for criado em 24h.

---

## Cronograma Recomendado

| Frequencia | Acao |
|------------|------|
| Diario | Backup automatico (cron) |
| Semanal | Verificar logs de backup |
| Mensal | Testar restauracao |
| Trimestral | Revisar politica de retencao |

---

## Troubleshooting

### Backup falha
```bash
# Ver logs detalhados
tail -100 /var/log/o-investigador-backup.log

# Verificar espaco em disco
df -h

# Verificar MySQL rodando
docker compose ps mysql
```

### Erro de permissao
```bash
chmod +x /opt/o-investigador/infrastructure/scripts/backup.sh
```

### MySQL nao conecta
```bash
# Verificar container
docker compose ps mysql
docker compose logs mysql

# Testar conexao manual
docker exec -it o-investigador-db mysql -u ghost -p
```

### Disco cheio
```bash
# Limpar backups antigos manualmente
find /opt/o-investigador/backups -name "*.gz" -mtime +7 -delete

# Verificar espaco
df -h
```

---

## Boas Praticas

1. **Multiplos Destinos**
   - Local + S3/Cloud
   - Diferentes regioes geograficas

2. **Teste Regular**
   - Restaure em staging mensalmente
   - Documente tempos de restauracao

3. **Encriptacao**
   - Considere encriptar backups sensiveis
   - Use AWS KMS para backups em S3

4. **Documentacao**
   - Mantenha runbook atualizado
   - Documente contatos de emergencia

5. **Automacao**
   - Nao dependa de backups manuais
   - Configure alertas para falhas
