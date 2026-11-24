/**
 * httpOnly refresh cookie: end-to-end over the real middleware chain
 * (cors -> json -> cookie-parser -> csrfProtection -> auth router).
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../../models', () => ({
    User: { findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    AuditLog: { create: jest.fn().mockResolvedValue({}) }
}));
jest.mock('../../services/ghostApi', () => ({
    createGhostUserDirect: jest.fn().mockResolvedValue({}),
    findAuthorByEmail: jest.fn().mockResolvedValue(null),
    updateGhostUserDirect: jest.fn().mockResolvedValue({}),
    deleteGhostUserDirect: jest.fn().mockResolvedValue({})
}));

const { User } = require('../../models');
const { corsOptions } = require('../../config/cors');
const { csrfProtection } = require('../../middleware/csrfMiddleware');
const authRoutes = require('../auth');

const ADMIN = 'https://admin.example.pt';
const SITE = 'https://example.pt';
const EVIL = 'https://evil.test';
const SECRET = 'test_secret_key';
const USER = { id: 'u1', name: 'Ana', email: 'ana@example.pt', role: 'admin', avatar: null };

const buildApp = () => {
    const app = express();
    app.use(cors(corsOptions()));
    app.use(express.json());
    app.use(cookieParser());
    app.use(csrfProtection);
    app.use('/api/auth', authRoutes);
    return app;
};

const refreshJwt = (opts = {}) => jwt.sign({ id: USER.id, type: 'refresh' }, SECRET, { expiresIn: '7d', ...opts });
const accessJwt = () => jwt.sign({ id: USER.id, email: USER.email, role: USER.role }, SECRET, { expiresIn: '2h' });

const refreshCookie = (res) => (res.headers['set-cookie'] || []).find((c) => c.startsWith('refreshToken='));
const xhr = (req, origin = ADMIN) => req.set('Origin', origin).set('X-Requested-With', 'XMLHttpRequest');

// Any string in the body that decodes to a refresh JWT is a leak
const findRefreshJwtInBody = (body) =>
    JSON.stringify(body)
        .match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g)
        ?.map((t) => jwt.decode(t))
        .find((p) => p && p.type === 'refresh');

let app;
let savedEnv;

beforeAll(async () => {
    USER.password = await bcrypt.hash('segredo123', 4);
});

beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.CORS_ORIGIN = `${SITE},${ADMIN}`;
    process.env.ADMIN_ORIGIN = ADMIN;
    jest.clearAllMocks();
    User.findOne.mockImplementation(async ({ where }) =>
        where.email === USER.email ? { ...USER, update: jest.fn().mockResolvedValue() } : null
    );
    User.findByPk.mockImplementation(async (id) => (id === USER.id ? { ...USER } : null));
    User.create.mockImplementation(async (data) => ({ id: 'u2', ...data }));
    app = buildApp();
});

afterEach(() => {
    process.env = savedEnv;
});

// Every endpoint that issues a session
const issuers = {
    login: () => xhr(request(app).post('/api/auth/login')).send({ email: USER.email, password: 'segredo123' }),
    register: () => {
        User.findOne.mockResolvedValue(null);
        return xhr(request(app).post('/api/auth/register')).send({
            name: 'Novo Autor',
            email: 'novo@example.pt',
            password: 'segredo123'
        });
    },
    refresh: () => xhr(request(app).post('/api/auth/refresh')).set('Cookie', `refreshToken=${refreshJwt()}`).send({})
};

describe.each(Object.entries(issuers))('%s issues the refresh token only as an httpOnly cookie', (name, call) => {
    it('sets HttpOnly, SameSite=Strict, Path=/api/auth, host-only, 7 days, not Secure outside production', async () => {
        const res = await call();
        expect(res.status).toBeLessThan(300);
        const cookie = refreshCookie(res);
        expect(cookie).toBeDefined();
        expect(cookie).toMatch(/; HttpOnly/);
        expect(cookie).toMatch(/; SameSite=Strict/);
        expect(cookie).toMatch(/; Path=\/api\/auth(;|$)/);
        expect(cookie).not.toMatch(/; Domain=/i);
        expect(cookie).toMatch(/; Max-Age=604800/);
        expect(cookie).not.toMatch(/; Secure/);
        const value = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
        expect(jwt.verify(value, SECRET).type).toBe('refresh');
    });

    it('marks the cookie Secure in production', async () => {
        process.env.NODE_ENV = 'production';
        const res = await call();
        expect(refreshCookie(res)).toMatch(/; Secure/);
    });

    it('never returns a refresh token in the JSON body', async () => {
        const res = await call();
        expect(JSON.stringify(res.body)).not.toMatch(/refreshToken/);
        expect(findRefreshJwtInBody(res.body)).toBeUndefined();
        expect(res.body.data.token).toEqual(expect.any(String));
    });
});

describe('POST /api/auth/refresh', () => {
    it('returns a new access token from the cookie', async () => {
        const res = await issuers.refresh();
        expect(res.status).toBe(200);
        expect(jwt.verify(res.body.data.token, SECRET)).toMatchObject({ id: USER.id, role: USER.role });
    });

    it('ignores a refresh token sent in the body (cookie only)', async () => {
        const res = await xhr(request(app).post('/api/auth/refresh')).send({ refreshToken: refreshJwt() });
        expect(res.status).toBe(400);
        expect(refreshCookie(res)).toBeUndefined();
    });

    it('rejects an access token placed in the cookie', async () => {
        const res = await xhr(request(app).post('/api/auth/refresh')).set('Cookie', `refreshToken=${accessJwt()}`).send({});
        expect(res.status).toBe(400);
    });

    it.each([
        ['expired', () => refreshJwt({ expiresIn: -10 }), 401],
        ['bad signature', () => jwt.sign({ id: USER.id, type: 'refresh' }, 'other'), 401]
    ])('%s cookie -> rejected and the cookie is cleared', async (_label, make, status) => {
        const res = await xhr(request(app).post('/api/auth/refresh')).set('Cookie', `refreshToken=${make()}`).send({});
        expect(res.status).toBe(status);
        expect(refreshCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/);
    });
});

describe('CSRF and origin guards on cookie endpoints', () => {
    const endpoints = ['/api/auth/refresh', '/api/auth/logout'];
    const withCookie = (path) => request(app).post(path).set('Cookie', `refreshToken=${refreshJwt()}`);

    it.each(endpoints)('%s without X-Requested-With -> 403', async (path) => {
        const res = await withCookie(path).set('Origin', ADMIN).send({});
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('CSRF_HEADER_MISSING');
    });

    // EVIL is stopped by cors() itself (error -> server error handler); SITE passes CORS
    // (same-site public Ghost site) and must be stopped by adminOriginOnly
    it.each(endpoints.flatMap((p) => [[p, EVIL], [p, SITE]]))(
        '%s from origin %s -> rejected, no token issued',
        async (path, origin) => {
            const res = await withCookie(path).set('Origin', origin).set('X-Requested-With', 'XMLHttpRequest').send({});
            expect(res.status).toBeGreaterThanOrEqual(403);
            if (origin === SITE) expect(res.body.code).toBe('CSRF_ORIGIN_INVALID');
            expect(res.body.data).toBeUndefined();
            expect(refreshCookie(res)).toBeUndefined();
        }
    );

    it.each(endpoints)('%s without Origin -> 403', async (path) => {
        const res = await withCookie(path).set('X-Requested-With', 'XMLHttpRequest').send({});
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('CSRF_ORIGIN_INVALID');
        expect(refreshCookie(res)).toBeUndefined();
    });

    it.each(endpoints)('%s from the admin origin -> 200', async (path) => {
        const res = await xhr(withCookie(path)).send({});
        expect(res.status).toBe(200);
    });

    it('without ADMIN_ORIGIN falls back to CORS_ORIGIN', async () => {
        delete process.env.ADMIN_ORIGIN;
        const res = await xhr(withCookie('/api/auth/refresh'), SITE).send({});
        expect(res.status).toBe(200);
    });
});

describe('CORS with credentials', () => {
    it('preflight from the admin echoes the exact origin and allows credentials', async () => {
        const res = await request(app)
            .options('/api/auth/refresh')
            .set('Origin', ADMIN)
            .set('Access-Control-Request-Method', 'POST')
            .set('Access-Control-Request-Headers', 'content-type,x-requested-with');
        expect(res.status).toBe(204);
        expect(res.headers['access-control-allow-origin']).toBe(ADMIN);
        expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('preflight from an unknown origin gets no CORS headers', async () => {
        const res = await request(app)
            .options('/api/auth/refresh')
            .set('Origin', EVIL)
            .set('Access-Control-Request-Method', 'POST');
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
        expect(res.headers['access-control-allow-credentials']).toBeUndefined();
    });
});

describe('POST /api/auth/logout', () => {
    it('clears the cookie with the same attributes it was set with', async () => {
        const res = await xhr(request(app).post('/api/auth/logout')).send({});
        expect(res.status).toBe(200);
        const cookie = refreshCookie(res);
        expect(cookie).toMatch(/^refreshToken=;/);
        expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
        expect(cookie).toMatch(/; Path=\/api\/auth(;|$)/);
        expect(cookie).toMatch(/; HttpOnly/);
        expect(cookie).toMatch(/; SameSite=Strict/);
        expect(cookie).not.toMatch(/; Domain=/i);
    });
});

describe('protect middleware', () => {
    it('rejects a refresh token used as Bearer access token', async () => {
        const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${refreshJwt()}`);
        expect(res.status).toBe(401);
    });

    it('accepts a real access token', async () => {
        const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessJwt()}`);
        expect(res.status).toBe(200);
    });
});
