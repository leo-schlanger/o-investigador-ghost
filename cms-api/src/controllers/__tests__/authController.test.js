const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the models
jest.mock('../../models', () => ({
    User: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn()
    }
}));

const { User } = require('../../models');
const authController = require('../authController');

describe('authController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { id: 'user-1' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            req.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'author'
            });

            await authController.register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(User.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({ email: 'test@example.com' }),
                    token: expect.any(String)
                })
            );
        });

        it('should return 400 if email already exists', async () => {
            req.body = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue({ id: 'existing-user' });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' });
        });
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            req.body = {
                email: 'test@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'author'
            });

            await authController.login(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({ email: 'test@example.com' }),
                    token: expect.any(String)
                })
            );
        });

        it('should return 401 for invalid email', async () => {
            req.body = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            User.findOne.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        it('should return 401 for invalid password', async () => {
            const hashedPassword = await bcrypt.hash('correctpassword', 10);
            req.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            User.findOne.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                password: hashedPassword
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });
    });

    describe('me', () => {
        it('should return current user data', async () => {
            User.findByPk.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'author'
            });

            await authController.me(req, res);

            expect(User.findByPk).toHaveBeenCalledWith('user-1', {
                attributes: { exclude: ['password'] }
            });
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ email: 'test@example.com' })
            );
        });

        it('should return 404 if user not found', async () => {
            User.findByPk.mockResolvedValue(null);

            await authController.me(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });

    describe('listUsers', () => {
        it('should return list of all users', async () => {
            const users = [
                { id: 'user-1', name: 'User 1', email: 'user1@example.com', role: 'admin' },
                { id: 'user-2', name: 'User 2', email: 'user2@example.com', role: 'author' }
            ];

            User.findAll.mockResolvedValue(users);

            await authController.listUsers(req, res);

            expect(User.findAll).toHaveBeenCalledWith({
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']]
            });
            expect(res.json).toHaveBeenCalledWith(users);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            req.params.id = 'user-2';
            const mockUser = {
                id: 'user-2',
                destroy: jest.fn().mockResolvedValue(true)
            };

            User.findByPk.mockResolvedValue(mockUser);

            await authController.deleteUser(req, res);

            expect(mockUser.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User deleted successfully' }));
        });

        it('should prevent self-deletion', async () => {
            req.params.id = 'user-1'; // Same as req.user.id

            await authController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete your own account' });
        });

        it('should return 404 if user not found', async () => {
            req.params.id = 'nonexistent';

            User.findByPk.mockResolvedValue(null);

            await authController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });
    });
});
