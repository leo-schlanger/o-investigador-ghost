import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the auth service
vi.mock('../../services/auth', () => ({
  login: vi.fn(),
  getMe: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined)
}));

import { login as loginApi, getMe, refreshToken as refreshTokenApi, logout as logoutApi } from '../../services/auth';

// Never persist a refresh token in localStorage (it lives in an httpOnly cookie)
const expectNoRefreshTokenStored = () => {
  const keys = localStorage.setItem.mock.calls.map(([k]) => k);
  expect(keys).not.toContain('refreshToken');
};

// Unsigned JWT with the given exp (seconds); AuthContext only decodes the payload
const fakeJwt = (exp) => `x.${btoa(JSON.stringify({ exp }))}.y`;

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

    expect(logoutApi).toHaveBeenCalledTimes(1); // server clears the httpOnly cookie
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('purges a legacy refreshToken from localStorage on boot', async () => {
    localStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  it('login stores only the access token, even if the API returns a refreshToken', async () => {
    const user = userEvent.setup();
    localStorage.getItem.mockReturnValue(null);
    loginApi.mockResolvedValue({
      token: 'new-token',
      refreshToken: 'must-not-be-stored',
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
    expectNoRefreshTokenStored();
  });

  it('expired access token on boot refreshes via cookie (no token argument) and stores only the access token', async () => {
    const expired = fakeJwt(Math.floor(Date.now() / 1000) - 60);
    const fresh = fakeJwt(Math.floor(Date.now() / 1000) + 7200);
    localStorage.getItem.mockImplementation((k) => (k === 'token' ? expired : null));
    refreshTokenApi.mockResolvedValue({ token: fresh, refreshToken: 'must-not-be-stored' });
    getMe.mockResolvedValue({ id: '1', email: 'test@example.com', name: 'Test User' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
    expect(refreshTokenApi).toHaveBeenCalledWith();
    expect(localStorage.setItem).toHaveBeenCalledWith('token', fresh);
    expectNoRefreshTokenStored();
  });
});
