import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import { refreshToken, logout } from '../auth';

describe('auth service (httpOnly refresh cookie)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('api client sends cookies (withCredentials)', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('refreshToken posts an empty body (token comes from the cookie)', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { success: true, data: { token: 't' } } });
    const result = await refreshToken();
    expect(post).toHaveBeenCalledWith('/api/auth/refresh', {});
    expect(result).toEqual({ token: 't' });
  });

  it('logout calls the server and swallows errors', async () => {
    const post = vi.spyOn(api, 'post').mockRejectedValue(new Error('offline'));
    await expect(logout()).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith('/api/auth/logout', {});
  });
});
