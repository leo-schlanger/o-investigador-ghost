import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test-utils';
import UsersPage from '../Users';

vi.mock('../../../services/users', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn()
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

import { getUsers, createUser, deleteUser } from '../../../services/users';
import { useAuth } from '../../../context/AuthContext';

const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@test.com', role: 'admin', createdAt: '2026-01-01' },
  { id: '2', name: 'Editor User', email: 'editor@test.com', role: 'editor', createdAt: '2026-01-02' }
];

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUsers.mockResolvedValue(mockUsers);
    useAuth.mockReturnValue({ user: { id: '1', name: 'Admin User', role: 'admin' } });
  });

  it('should show loading state initially', () => {
    getUsers.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<UsersPage />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('should render users list after loading', async () => {
    renderWithRouter(<UsersPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Editor User').length).toBeGreaterThan(0);
  });

  it('should open create user modal', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UsersPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
    });

    const createBtns = screen.getAllByText('Novo Usuario');
    await user.click(createBtns[0]);
    await waitFor(() => {
      // Modal heading should change from initial list view
      const headings = screen.getAllByText('Novo Usuario');
      expect(headings.length).toBeGreaterThanOrEqual(2); // button + modal heading
    });
  });

  it('should handle fetch error', async () => {
    getUsers.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText(/falha|erro/i)).toBeInTheDocument();
    });
  });
});
