# Guia de Contribuicao

Obrigado por considerar contribuir para O Investigador! Este documento explica como participar do desenvolvimento.

---

## Codigo de Conduta

- Seja respeitoso e inclusivo
- Aceite criticas construtivas
- Foque no que e melhor para o projeto
- Mostre empatia com outros contribuidores

---

## Como Contribuir

### Reportar Bugs

1. Verifique se o bug ja foi reportado nas [Issues](https://github.com/.../issues)
2. Se nao, crie uma nova issue com:
   - Titulo claro e descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicavel
   - Ambiente (browser, OS, versao)

### Sugerir Melhorias

1. Verifique se ja existe uma sugestao similar
2. Crie uma issue com label "enhancement"
3. Descreva claramente a proposta
4. Explique o beneficio para usuarios

### Contribuir Codigo

1. Fork o repositorio
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Faca suas alteracoes
4. Commit (`git commit -m 'feat: adiciona nova feature'`)
5. Push (`git push origin feature/minha-feature`)
6. Abra um Pull Request

---

## Setup de Desenvolvimento

### Pre-requisitos
- Docker e Docker Compose
- Node.js 18+
- Git

### Configurar Ambiente
```bash
# Clonar repositorio
git clone <url>
cd o-investigador-ghost

# Copiar ambiente
cp .env.example .env

# Subir containers
docker compose up -d

# Verificar logs
docker compose logs -f
```

### Desenvolvimento Local
```bash
# Backend (com hot reload)
cd cms-api
npm install
npm run dev

# Frontend (com hot reload)
cd admin-panel
npm install
npm run dev

# Theme CSS (watch mode)
cd ghost-theme
npm install
npm run dev
```

---

## Padroes de Codigo

### JavaScript/Node.js
- ES6+ syntax
- Async/await (evitar callbacks)
- Nomes em ingles
- camelCase para variaveis e funcoes
- PascalCase para classes e componentes

### React
- Functional components com hooks
- Props destructuring
- Componentes pequenos e focados

### CSS (TailwindCSS)
- Usar classes utilitarias
- Evitar CSS custom
- Mobile-first

### Git
- Commits pequenos e focados
- Mensagens seguindo Conventional Commits:
  ```
  feat: adiciona sistema de busca
  fix: corrige erro de login
  docs: atualiza README
  refactor: reorganiza controllers
  test: adiciona testes para auth
  chore: atualiza dependencias
  ```

---

## Estrutura de Pastas

```
o-investigador-ghost/
├── admin-panel/       # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
├── cms-api/           # Backend Node.js
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── services/
├── ghost-theme/       # Tema Ghost
│   ├── assets/
│   └── partials/
├── infrastructure/    # DevOps
│   ├── nginx/
│   └── scripts/
└── docs/              # Documentacao
```

---

## Testes

### Backend
```bash
cd cms-api
npm test
npm run test:coverage
```

### Frontend
```bash
cd admin-panel
npm test
npm run test:coverage
```

### Antes do PR
- [ ] Todos os testes passam
- [ ] Cobertura nao diminuiu
- [ ] ESLint sem erros
- [ ] Build funciona

---

## Pull Requests

### Checklist
- [ ] Branch atualizada com main
- [ ] Codigo segue padroes do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentacao atualizada se necessario
- [ ] Sem arquivos desnecessarios (.env, logs)
- [ ] Commit messages corretas

### Template de PR
```markdown
## Descricao
Breve descricao das mudancas.

## Tipo de Mudanca
- [ ] Bug fix
- [ ] Nova feature
- [ ] Refatoracao
- [ ] Documentacao

## Como Testar
1. Passo 1
2. Passo 2
3. Verificar que...

## Screenshots (se aplicavel)

## Checklist
- [ ] Testes passando
- [ ] Documentacao atualizada
- [ ] Sem breaking changes
```

---

## Code Review

### O que Revisores Verificam
- Codigo limpo e legivel
- Testes adequados
- Sem vulnerabilidades de seguranca
- Performance aceitavel
- Documentacao clara

### Feedback
- Seja especifico e construtivo
- Sugira alternativas quando criticar
- Reconheca o esforco do contribuidor

---

## Releases

### Versionamento
Usamos [Semantic Versioning](https://semver.org/):
- MAJOR: Mudancas incompativeis
- MINOR: Novas features compativeis
- PATCH: Bug fixes

### Processo
1. Atualizar CHANGELOG.md
2. Bump versao nos package.json
3. Tag no Git
4. GitHub Release com notas

---

## Areas para Contribuir

### Bom para Iniciantes
- Melhorias na documentacao
- Traducoes
- Adicionar testes
- Corrigir bugs menores

### Intermediario
- Novas features menores
- Refatoracao de codigo
- Melhorias de performance

### Avancado
- Arquitetura do sistema
- Integracao de servicos
- Seguranca

---

## Duvidas

- Abra uma issue com label "question"
- Ou entre em contato com os mantenedores

---

## Licenca

Ao contribuir, voce concorda que suas contribuicoes serao licenciadas sob a mesma licenca do projeto.

---

## Reconhecimento

Contribuidores serao listados no README e em releases. Agradecemos todas as contribuicoes, grandes ou pequenas!
