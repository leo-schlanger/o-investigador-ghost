# Auditoria da Plataforma — O Investigador

Auditorias técnicas completas da aplicação, para acompanhamento de pendências e dívida técnica.

## Índice

| Documento | Descrição |
|-----------|-----------|
| [`2026-06-09-checkup.md`](2026-06-09-checkup.md) | **Relatório completo** — sumário executivo, top-riscos, quick-wins, roadmap e os 155 achados detalhados por dimensão |
| [`PENDENCIAS.md`](PENDENCIAS.md) | **Checklist acionável** — todos os achados como tarefas `[ ]` priorizadas (P0→P3) + TODOs do código |

## Resumo da auditoria 2026-06-09

- **Método:** workflow multi-agente (18 agentes, 8 dimensões, verificação adversarial)
- **Saúde geral:** boa base de engenharia, com riscos pontuais sérios a corrigir antes de produção ser considerada robusta
- **Achados:** 155 — 🔴 1 crítico · 🟠 12 altos · 🟡 58 médios · 🔵 66 baixos · ⚪ 18 info

### Prioridade imediata (P0/P1)
1. 🔴 **Rotacionar a Ghost Admin API key** que estava hardcoded em `tests/` (já protegida no `.gitignore`; nunca foi committed)
2. 🟠 Impor **RBAC no backend** (`authorize()` em `articles`, `pages`, `tags`, `reports`) — hoje só existe no frontend
3. 🟠 Alargar o **backup** para incluir media do Ghost e uploads da API (só cobre MySQL)
4. 🟠 Acoplar o **deploy ao sucesso do CI**
5. 🟠 Corrigir `reports.js` (import e coluna inexistentes — crasha em runtime)

> As correções de maior impacto são, na maioria, de baixo esforço. Ver `PENDENCIAS.md` para o checklist completo.
