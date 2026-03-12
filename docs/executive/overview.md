# Visao Geral - O Investigador

## O que e o projeto?

**O Investigador** e uma plataforma digital de jornalismo investigativo, projetada para publicacao de noticias, reportagens e cronicas com foco em politica, economia e justica.

O sistema combina um CMS (Sistema de Gerenciamento de Conteudo) robusto com um painel administrativo personalizado, oferecendo controle total sobre publicacoes, anuncios e configuracoes do portal.

---

## Objetivos do Projeto

### Objetivo Principal
Criar uma plataforma de midia independente, moderna e escalavel, que permita a publicacao de conteudo jornalistico de alta qualidade.

### Objetivos Especificos

1. **Autonomia Editorial**
   - Controle total sobre o conteudo publicado
   - Independencia de plataformas de terceiros
   - Propriedade completa dos dados

2. **Experiencia do Leitor**
   - Site rapido e responsivo
   - Navegacao intuitiva por categorias
   - Sistema de busca eficiente
   - Compatibilidade mobile

3. **Monetizacao**
   - Sistema integrado de anuncios
   - Suporte a assinaturas (membros)
   - Newsletter para engajamento

4. **Operacao Eficiente**
   - Painel administrativo customizado
   - Automacao de backups
   - Deploy automatizado
   - Monitoramento de metricas

---

## Publico-Alvo

### Leitores
- Cidadaos interessados em jornalismo investigativo
- Profissionais que acompanham politica e economia
- Publico geral em busca de informacao de qualidade

### Equipe Interna
- **Editores:** Gerenciam publicacoes e revisam conteudo
- **Redatores:** Criam artigos e reportagens
- **Administradores:** Configuram sistema e gerenciam usuarios

---

## Diferenciais

| Aspecto | Beneficio |
|---------|-----------|
| **Infraestrutura Propria** | Dados sob controle, sem dependencia de terceiros |
| **Customizacao Total** | Sistema adaptado as necessidades especificas |
| **Escalabilidade** | Arquitetura preparada para crescimento |
| **Seguranca** | HTTPS, backups automaticos, protecao contra ataques |
| **Performance** | Otimizado para carregamento rapido |

---

## Componentes do Sistema

```
+------------------+     +------------------+     +------------------+
|   Site Publico   |     |   Painel Admin   |     |   Ghost CMS      |
|  (Leitores)      |     |  (Equipe)        |     |  (Conteudo)      |
+------------------+     +------------------+     +------------------+
         |                        |                       |
         +------------------------+-----------------------+
                                  |
                    +---------------------------+
                    |       API Backend         |
                    |    (Logica de Negocio)    |
                    +---------------------------+
                                  |
                    +---------------------------+
                    |      Banco de Dados       |
                    |        (MySQL)            |
                    +---------------------------+
```

---

## Metricas de Sucesso

- **Uptime:** Disponibilidade superior a 99.5%
- **Performance:** Carregamento da pagina < 3 segundos
- **SEO:** Indexacao adequada no Google
- **Engajamento:** Taxa de retorno de leitores
- **Seguranca:** Zero incidentes de seguranca

---

## Custos Operacionais

### Infraestrutura
- VPS (Servidor Virtual Privado)
- Dominio e certificado SSL
- Servicos opcionais (SendGrid, AWS S3)

### Manutencao
- Atualizacoes de seguranca
- Backup e monitoramento
- Suporte tecnico eventual

---

## Proximos Passos

Consulte o [Roadmap](./roadmap.md) para ver o planejamento de evolucao do projeto e as funcionalidades previstas para as proximas versoes.
