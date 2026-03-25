# Monitoramento

## Visao Geral

Este documento descreve como monitorar a saude e performance do sistema.

---

## Health Checks

### API Backend
```bash
curl http://localhost:3001/health
# Resposta: {"status":"ok","timestamp":"..."}
```

### Ghost CMS
```bash
curl http://localhost:2368/ghost/api/v4/admin/site/
# Deve retornar informacoes do site
```

### Nginx
```bash
curl -I http://localhost
# Deve retornar HTTP 200
```

### MySQL
```bash
docker exec o-investigador-db mysqladmin -u ghost -p ping
# Resposta: mysqld is alive
```

---

## Status dos Containers

### Verificar Todos
```bash
docker compose ps
```

### Saida Esperada
```
NAME                    STATUS              PORTS
o-investigador-admin    Up (healthy)        5173
o-investigador-api      Up (healthy)        3001
o-investigador-ghost    Up                  2368
o-investigador-mysql    Up (healthy)        3306
o-investigador-nginx    Up                  80, 443
```

### Estados Importantes
| Status | Significado |
|--------|-------------|
| Up | Container rodando |
| Up (healthy) | Rodando e health check OK |
| Restarting | Tentando reiniciar |
| Exited | Parado |

---

## Uso de Recursos

### CPU e Memoria (Tempo Real)
```bash
docker stats
```

### Saida
```
CONTAINER           CPU %     MEM USAGE / LIMIT
o-investigador-api  0.50%     128MiB / 512MiB
o-investigador-mysql 1.00%    256MiB / 1GiB
...
```

### Alertas Sugeridos
| Recurso | Warning | Critico |
|---------|---------|---------|
| CPU | > 70% | > 90% |
| Memoria | > 80% | > 95% |
| Disco | > 80% | > 95% |

---

## Logs

### Todos os Servicos
```bash
docker compose logs -f
```

### Servico Especifico
```bash
docker compose logs -f api
docker compose logs -f ghost
docker compose logs -f mysql
docker compose logs -f nginx
```

### Ultimas N Linhas
```bash
docker compose logs --tail=100 api
```

### Filtrar por Tempo
```bash
docker compose logs --since="2024-03-15T10:00:00" api
```

---

## Metricas de Aplicacao

### Posts Mais Vistos
```bash
curl http://localhost:3001/api/public/most-viewed?limit=10
```

### Contagem de Registros
```sql
-- Via MySQL
docker exec -it o-investigador-db mysql -u ghost -p -e "
SELECT 'posts' as table_name, COUNT(*) as count FROM o_investigador.posts
UNION
SELECT 'members', COUNT(*) FROM o_investigador.members
UNION
SELECT 'post_views', COUNT(*) FROM o_investigador.post_views;
"
```

---

## Espaco em Disco

### Uso Geral
```bash
df -h
```

### Uso Docker
```bash
docker system df
```

### Tamanho dos Volumes
```bash
docker system df -v | grep -A 20 "VOLUME NAME"
```

### Tamanho dos Backups
```bash
du -sh /opt/o-investigador/backups/
```

---

## Rede

### Verificar Portas
```bash
netstat -tlnp | grep -E '80|443|2368|3001|3306'
```

### Testar Conectividade
```bash
# Interno (entre containers)
docker exec o-investigador-api ping mysql

# Externo
curl -I https://jornalinvestigador.pt
```

---

## SSL/Certificados

### Verificar Validade
```bash
echo | openssl s_client -servername jornalinvestigador.pt \
    -connect jornalinvestigador.pt:443 2>/dev/null | \
    openssl x509 -noout -dates
```

### Dias Restantes
```bash
certbot certificates
```

---

## Performance

### Tempo de Resposta
```bash
# API
time curl -s http://localhost:3001/health > /dev/null

# Site
time curl -s http://localhost:2368 > /dev/null
```

### Benchmark Simples
```bash
# 100 requisicoes, 10 concorrentes
ab -n 100 -c 10 http://localhost:3001/health
```

---

## Checklist Diario

- [ ] Containers rodando (docker compose ps)
- [ ] Health checks OK
- [ ] Logs sem erros criticos
- [ ] Disco com espaco livre > 20%
- [ ] Backup de ontem existe
- [ ] Site acessivel externamente

---

## Checklist Semanal

- [ ] Revisar logs de erro
- [ ] Verificar uso de recursos
- [ ] Conferir crescimento do disco
- [ ] Testar backup (integridade)
- [ ] Verificar certificados SSL

---

## Ferramentas Externas (Recomendadas)

### Uptime Monitoring
- UptimeRobot (gratuito)
- Pingdom
- Better Uptime

### Configurar Alerta
1. Adicionar URL: `https://jornalinvestigador.pt`
2. Intervalo: 5 minutos
3. Alerta via: Email, Slack, SMS

### APM (Application Performance)
- New Relic (gratuito tier)
- Datadog
- Sentry (erros)

---

## Alertas Criticos

### Quando Escalar Imediatamente
1. Site fora do ar > 5 minutos
2. MySQL nao responde
3. Disco > 95%
4. Certificado SSL expirado
5. Backup falhou por 2+ dias

### Contatos
- Administrador Sistema: [definir]
- Desenvolvedor: [definir]
- Suporte VPS: [definir]

---

## Stack de Monitoramento (Grafana + Loki + Promtail)

> **Implementado em:** 25 Marco 2026

### Visao Geral

O sistema utiliza a stack Grafana/Loki/Promtail para agregacao e visualizacao de logs de todos os containers.

| Componente | Versao | Funcao |
|------------|--------|--------|
| Loki | 3.1.0 | Armazenamento e indexacao de logs |
| Promtail | 3.1.0 | Coleta de logs dos containers Docker |
| Grafana | 10.2.0 | Visualizacao e dashboards |

### Acesso ao Grafana

- **URL:** https://admin.jornalinvestigador.pt/grafana/
- **Usuario:** admin
- **Senha:** Definida em `GRAFANA_ADMIN_PASSWORD`

### Dashboard Pre-configurado

O dashboard "O Investigador - Logs Overview" inclui:

1. **Log Volume by Service** - Grafico de volume de logs por servico
2. **Log Distribution** - Distribuicao percentual entre servicos
3. **Total Errors** - Contador de erros no periodo
4. **Total Warnings** - Contador de warnings no periodo
5. **Live Logs** - Stream de logs em tempo real com filtros
6. **Error Logs** - Logs de erro de todos os servicos

### Queries LogQL Uteis

```logql
# Logs de um servico especifico
{compose_service="api"}

# Buscar erros em todos os servicos
{compose_service=~".+"} |~ "(?i)error"

# Logs do Ghost
{compose_service="ghost"}

# Filtrar por texto especifico
{compose_service="api"} |= "POST /api"

# Logs com erros ou excecoes
{compose_service=~".+"} |~ "(?i)(error|exception|fatal|panic)"

# Logs do nginx com status 5xx
{compose_service="nginx"} |~ "\" 5[0-9]{2} "

# Logs de autenticacao
{compose_service="api"} |= "auth" or |= "login"
```

### Filtros no Dashboard

- **Service:** Selecionar servicos especificos (api, ghost, nginx, mysql, etc.)
- **Search:** Busca por texto livre nos logs
- **Time Range:** Selecionar periodo de tempo

### Retencao de Logs

- **Periodo:** 30 dias
- **Configuravel em:** `infrastructure/monitoring/loki-config.yml`
- **Parametro:** `limits_config.retention_period`

### Arquivos de Configuracao

```
infrastructure/monitoring/
├── loki-config.yml           # Configuracao do Loki
├── promtail-config.yml       # Configuracao do Promtail
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── loki.yml      # Datasource Loki
    │   └── dashboards/
    │       └── dashboard.yml # Provider de dashboards
    └── dashboards/
        └── logs-overview.json # Dashboard pre-configurado
```

### Troubleshooting

#### Grafana nao carrega (503)
```bash
# Verificar se grafana esta rodando
docker ps | grep grafana

# Verificar logs do nginx
docker logs o-investigador-nginx-1 | tail -20

# Pode ser rate limiting - aguardar alguns segundos
```

#### Logs nao aparecem no Grafana
```bash
# Verificar se Promtail esta coletando
docker logs o-investigador-promtail-1 | tail -20

# Verificar se Loki esta recebendo
docker logs o-investigador-loki-1 | tail -20

# Testar Loki diretamente
curl http://localhost:3100/ready
```

#### Resetar senha do Grafana
```bash
docker exec o-investigador-grafana-1 grafana-cli admin reset-admin-password NOVA_SENHA
```

#### Promtail nao descobre containers
- Verificar versao do Promtail (requer 3.x+ para Docker 29+)
- Verificar montagem do docker.sock

---

## Automacao Futura

### Melhorias Planejadas
- [x] Dashboard Grafana (Implementado 25 Mar 2026)
- [x] Log aggregation Loki (Implementado 25 Mar 2026)
- [ ] Alertas automaticos via Slack/Email
- [ ] Metricas Prometheus
- [ ] APM integrado

### Scripts de Monitoramento
```bash
#!/bin/bash
# health-check.sh

# Verificar API
if ! curl -sf http://localhost:3001/health > /dev/null; then
    echo "API DOWN" | mail -s "ALERTA: API" admin@exemplo.com
fi

# Verificar Ghost
if ! curl -sf http://localhost:2368 > /dev/null; then
    echo "GHOST DOWN" | mail -s "ALERTA: Ghost" admin@exemplo.com
fi

# Verificar disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Disco em $DISK_USAGE%" | mail -s "ALERTA: Disco" admin@exemplo.com
fi
```

Adicionar ao cron:
```cron
*/5 * * * * /opt/o-investigador/scripts/health-check.sh
```
