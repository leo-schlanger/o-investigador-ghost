# Guia de Desenvolvimento

## Estrutura do Projeto

```
o-investigador-ghost/
├── admin-panel/          # Frontend React
├── cms-api/              # Backend Node.js
├── ghost-theme/          # Tema Ghost (Handlebars)
├── infrastructure/       # DevOps e scripts
├── docs/                 # Documentacao
├── docker-compose.yml    # Dev environment
├── docker-compose.prod.yml # Prod environment
└── .github/workflows/    # CI/CD
```

---

## Fluxo de Trabalho

### Branch Strategy
```
main          <- Producao (deploy automatico)
  └── develop <- Desenvolvimento
        └── feature/xxx <- Features individuais
        └── fix/xxx     <- Bug fixes
```

### Ciclo de Desenvolvimento
1. Criar branch a partir de `develop`
2. Desenvolver e testar localmente
3. Criar Pull Request para `develop`
4. Code review e aprovacao
5. Merge para `develop`
6. Testar em staging
7. Merge para `main` (deploy automatico)

---

## Backend (cms-api)

### Estrutura
```
cms-api/src/
├── config/
│   └── env.js           # Validacao de env vars
├── controllers/         # Logica de requisicoes
│   ├── authController.js
│   ├── articleController.js
│   ├── settingsController.js
│   └── ...
├── middleware/
│   └── authMiddleware.js # JWT verification
├── models/              # Sequelize models
│   ├── User.js
│   ├── Settings.js
│   └── index.js
├── routes/              # Express routes
│   ├── auth.js
│   ├── articles.js
│   └── index.js
└── services/            # Business logic
    ├── ghostApi.js
    └── emailService.js
```

### Criar Novo Endpoint

1. **Criar Controller** (`src/controllers/exemploController.js`)
```javascript
const exemploController = {
    async listar(req, res) {
        try {
            const dados = await buscarDados();
            res.json(dados);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async criar(req, res) {
        // Validacao com Joi
        const schema = Joi.object({
            nome: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ error: error.message });

        // Criar recurso
        const novo = await Exemplo.create(value);
        res.status(201).json(novo);
    }
};

module.exports = exemploController;
```

2. **Criar Rota** (`src/routes/exemplo.js`)
```javascript
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const controller = require('../controllers/exemploController');

router.get('/', authMiddleware, controller.listar);
router.post('/', authMiddleware, controller.criar);

module.exports = router;
```

3. **Registrar Rota** (`src/routes/index.js`)
```javascript
const exemploRoutes = require('./exemplo');
router.use('/exemplo', exemploRoutes);
```

### Criar Model Sequelize

```javascript
// src/models/Exemplo.js
module.exports = (sequelize, DataTypes) => {
    const Exemplo = sequelize.define('Exemplo', {
        nome: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'exemplos',
        timestamps: true
    });

    return Exemplo;
};
```

---

## Frontend (admin-panel)

### Estrutura
```
admin-panel/src/
├── components/          # Componentes reutilizaveis
│   ├── Layout/
│   │   ├── MainLayout.jsx
│   │   └── Sidebar.jsx
│   └── ui/              # Componentes UI basicos
├── context/
│   └── AuthContext.jsx  # Estado de autenticacao
├── pages/               # Paginas da aplicacao
│   ├── Dashboard.jsx
│   ├── Articles/
│   └── Settings/
├── services/
│   └── api.js           # Axios instance
└── utils/               # Funcoes utilitarias
```

### Criar Nova Pagina

1. **Criar Componente** (`src/pages/Exemplo/Exemplo.jsx`)
```jsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function Exemplo() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['exemplos'],
        queryFn: () => api.get('/exemplo').then(res => res.data)
    });

    if (isLoading) return <div>Carregando...</div>;
    if (error) return <div>Erro: {error.message}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Exemplos</h1>
            {/* Conteudo */}
        </div>
    );
}
```

2. **Adicionar Rota** (`src/App.jsx`)
```jsx
import Exemplo from './pages/Exemplo/Exemplo';

// Dentro das rotas
<Route path="/exemplo" element={<Exemplo />} />
```

3. **Adicionar ao Menu** (`src/components/Layout/Sidebar.jsx`)
```jsx
{ label: 'Exemplo', path: '/exemplo', icon: ExemploIcon }
```

### Padrao de Estilos
- Usar TailwindCSS para estilizacao
- Classes utilitarias direto no JSX
- Nao criar CSS customizado exceto quando necessario

---

## Ghost Theme

### Estrutura
```
ghost-theme/
├── assets/
│   ├── css/
│   │   ├── index.css    # Source Tailwind
│   │   └── screen.css   # Compiled output
│   └── js/
│       ├── search.js
│       └── ads-integrator.js
├── partials/            # Componentes reutilizaveis
│   ├── header.hbs
│   ├── footer.hbs
│   └── post-card.hbs
├── default.hbs          # Layout base
├── index.hbs            # Homepage
├── post.hbs             # Artigo individual
└── package.json         # Theme metadata
```

### Desenvolver CSS
```bash
cd ghost-theme
npm run dev  # Watch mode
```

### Criar Partial

1. Criar arquivo `partials/meu-partial.hbs`
```handlebars
<div class="meu-componente">
    {{#if titulo}}
        <h2>{{titulo}}</h2>
    {{/if}}
    <p>{{conteudo}}</p>
</div>
```

2. Usar no template
```handlebars
{{> meu-partial titulo="Exemplo" conteudo="Texto aqui"}}
```

### Helpers Ghost Uteis
```handlebars
{{!-- Loop de posts --}}
{{#foreach posts}}
    <article>{{title}}</article>
{{/foreach}}

{{!-- Condicional --}}
{{#if feature_image}}
    <img src="{{feature_image}}">
{{/if}}

{{!-- Data formatada --}}
{{date published_at format="DD/MM/YYYY"}}

{{!-- Buscar posts --}}
{{#get "posts" limit="5" filter="tag:destaque"}}
    {{#foreach posts}}...{{/foreach}}
{{/get}}
```

---

## Boas Praticas

### Codigo
- [ ] ESLint sem erros
- [ ] Sem console.log em commits
- [ ] Funcoes pequenas e focadas
- [ ] Nomes descritivos (ingles)
- [ ] Comentarios quando necessario

### Commits
```
feat: adiciona sistema de busca
fix: corrige login no mobile
refactor: reorganiza controllers
docs: atualiza README
chore: atualiza dependencias
```

### Pull Requests
- Titulo descritivo
- Descricao do que foi feito
- Screenshots se visual
- Testes passando

---

## Debugging

### Backend
```javascript
// Log detalhado
console.log('Debug:', JSON.stringify(objeto, null, 2));

// Breakpoint
debugger;
```

### Frontend
```javascript
// React DevTools
// React Query DevTools (ja incluido)

// Network tab do browser
// Console do browser
```

### Docker
```bash
# Entrar no container
docker exec -it o-investigador-api sh

# Ver logs em tempo real
docker compose logs -f api

# Inspecionar container
docker inspect o-investigador-api
```

---

## Hot Reload

| Servico | Metodo |
|---------|--------|
| API | nodemon (automatico) |
| Admin | Vite HMR (automatico) |
| Theme CSS | `npm run dev` watch |
| Theme HBS | Reiniciar Ghost |

### Forcar reload do Ghost
```bash
docker compose restart ghost
```

---

## Variaveis de Ambiente

### Desenvolvimento (.env)
```env
NODE_ENV=development
DEBUG=true
```

### Producao
- Nunca commitar .env
- Usar secrets do servidor
- Variaveis injetadas via Docker

---

## Proximos Passos

- [Executar Testes](./testing.md)
- [Deploy](./deployment.md)
- [Troubleshooting](./troubleshooting.md)
