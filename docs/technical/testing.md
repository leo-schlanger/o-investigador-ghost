# Testes

## Visao Geral

O projeto utiliza testes automatizados em multiplas camadas:

| Camada | Framework | Localizacao |
|--------|-----------|-------------|
| Backend Unit | Jest | `cms-api/src/**/__tests__/` |
| Frontend Unit | Vitest | `admin-panel/src/**/*.test.jsx` |
| E2E | (Planejado) | - |

---

## Backend (Jest)

### Executar Testes

```bash
cd cms-api

# Todos os testes
npm test

# Watch mode (re-executa ao salvar)
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Estrutura de Testes

```
cms-api/src/
├── controllers/
│   ├── authController.js
│   └── __tests__/
│       └── authController.test.js
├── services/
│   ├── ghostApi.js
│   └── __tests__/
│       └── ghostApi.test.js
```

### Exemplo de Teste

```javascript
// authController.test.js
const request = require('supertest');
const app = require('../../server');

describe('Auth Controller', () => {
    describe('POST /api/auth/login', () => {
        it('deve retornar token com credenciais validas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email');
        });

        it('deve retornar 401 com credenciais invalidas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'senhaerrada'
                });

            expect(res.status).toBe(401);
        });
    });
});
```

### Configuracao Jest

```javascript
// jest.config.js
module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/__tests__/**'
    ],
    testMatch: ['**/__tests__/**/*.test.js']
};
```

### Mocks

```javascript
// Mock de servico externo
jest.mock('../services/ghostApi', () => ({
    getPosts: jest.fn().mockResolvedValue({ posts: [] }),
    createPost: jest.fn().mockResolvedValue({ id: '123' })
}));

// Mock de banco de dados
jest.mock('../models', () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));
```

---

## Frontend (Vitest)

### Executar Testes

```bash
cd admin-panel

# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com UI
npm run test:ui

# Cobertura
npm run test:coverage
```

### Estrutura de Testes

```
admin-panel/src/
├── components/
│   ├── Button.jsx
│   └── Button.test.jsx
├── pages/
│   ├── Login.jsx
│   └── Login.test.jsx
```

### Exemplo de Teste

```jsx
// Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';

// Mock do servico de API
vi.mock('../services/api', () => ({
    default: {
        post: vi.fn()
    }
}));

describe('Login Page', () => {
    const renderLogin = () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    it('deve renderizar formulario de login', () => {
        renderLogin();

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('deve mostrar erro com credenciais invalidas', async () => {
        const api = await import('../services/api');
        api.default.post.mockRejectedValue({ response: { status: 401 } });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@test.com' }
        });
        fireEvent.change(screen.getByLabelText(/senha/i), {
            target: { value: 'wrongpass' }
        });
        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText(/credenciais invalidas/i)).toBeInTheDocument();
        });
    });
});
```

### Configuracao Vitest

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.js',
        coverage: {
            reporter: ['text', 'html'],
            exclude: ['node_modules/', 'src/test/']
        }
    }
});
```

### Setup de Testes

```javascript
// src/test/setup.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn()
    }))
});
```

---

## CI/CD - Testes Automaticos

O GitHub Actions executa testes automaticamente:

```yaml
# .github/workflows/ci.yml
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd cms-api && npm ci
      - run: cd cms-api && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd admin-panel && npm ci
      - run: cd admin-panel && npm test
```

---

## Boas Praticas

### Nomenclatura
```javascript
describe('NomeDoModulo', () => {
    describe('metodoOuFuncao', () => {
        it('deve fazer X quando Y', () => {});
        it('deve retornar erro quando Z', () => {});
    });
});
```

### AAA Pattern
```javascript
it('deve calcular total corretamente', () => {
    // Arrange (preparar)
    const items = [{ price: 10 }, { price: 20 }];

    // Act (executar)
    const total = calculateTotal(items);

    // Assert (verificar)
    expect(total).toBe(30);
});
```

### Isolamento
- Cada teste deve ser independente
- Usar beforeEach/afterEach para setup/cleanup
- Mockar dependencias externas

---

## Cobertura de Testes

### Meta
- Backend: > 70% cobertura
- Frontend: > 60% cobertura

### Visualizar Relatorio
```bash
# Backend
cd cms-api && npm run test:coverage
open coverage/lcov-report/index.html

# Frontend
cd admin-panel && npm run test:coverage
open coverage/index.html
```

---

## Testes E2E (Futuro)

Planejado para implementacao futura com Playwright ou Cypress:

```javascript
// Exemplo Playwright
test('login flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
});
```
