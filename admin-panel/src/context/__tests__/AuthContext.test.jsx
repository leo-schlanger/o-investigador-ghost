import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the auth service
vi.mock('../../services/auth', () => ({
    login: vi.fn(),
    getMe: vi.fn()
}));

import { login as loginApi, getMe } from '../../services/auth';

// Test component to access auth context
const TestComponent = () => {
    const { user, login, logout, loading } = useAuth();

    return (
        <div>
            <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
            <span data-testid="user">{user ? user.email : 'none'}</span>
            <button onClick={() => login('test@example.com', 'password123')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.getItem.mockReturnValue(null);
    });

    it('should start with no user and eventually become ready', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready');
        });
        expect(screen.getByTestId('user')).toHaveTextContent('none');
    });

    it('should load user from token on mount', async () => {
        localStorage.getItem.mockReturnValue('valid-token');
        getMe.mockResolvedValue({ id: '1', email: 'test@example.com', name: 'Test User' });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready');
        });

        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    it('should clear token if getMe fails', async () => {
        localStorage.getItem.mockReturnValue('invalid-token');
        getMe.mockRejectedValue(new Error('Invalid token'));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready');
        });

        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(screen.getByTestId('user')).toHaveTextContent('none');
    });

    it('should login successfully', async () => {
        const user = userEvent.setup();
        loginApi.mockResolvedValue({
            token: 'new-token',
            user: { id: '1', email: 'test@example.com', name: 'Test User' }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready');
        });

        await user.click(screen.getByText('Login'));

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        });

        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    });

    it('should logout successfully', async () => {
        const user = userEvent.setup();
        localStorage.getItem.mockReturnValue('valid-token');
        getMe.mockResolvedValue({ id: '1', email: 'test@example.com', name: 'Test User' });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        });

        await user.click(screen.getByText('Logout'));

        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
});
