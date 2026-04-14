import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test-utils';
import Profile from '../Profile';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../../services/auth', () => ({
  updateProfile: vi.fn()
}));

vi.mock('../../../services/api', () => ({
  default: { post: vi.fn() }
}));

import { useAuth } from '../../../context/AuthContext';
import { updateProfile } from '../../../services/auth';

const mockUser = { id: '1', name: 'Admin User', email: 'admin@test.com', avatar: null, role: 'admin' };

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  it('should render user data from context', async () => {
    renderWithRouter(<Profile />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('admin@test.com')).toBeInTheDocument();
    });
  });

  it('should update form fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Profile />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Admin User');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    expect(nameInput.value).toBe('New Name');
  });

  it('should show password mismatch error', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Profile />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
    });

    // Find password fields by type
    const passwordInputs = screen.getAllByDisplayValue('');
    const passwordFields = passwordInputs.filter(el => el.type === 'password');

    if (passwordFields.length >= 2) {
      await user.type(passwordFields[0], 'password1');
      await user.type(passwordFields[1], 'password2');

      const saveBtn = screen.getByText(/Salvar/i);
      await user.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('As senhas nao coincidem')).toBeInTheDocument();
      });
    }
  });

  it('should save profile successfully', async () => {
    updateProfile.mockResolvedValue({ name: 'Admin User', email: 'admin@test.com' });
    const user = userEvent.setup();
    renderWithRouter(<Profile />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
    });

    const saveBtn = screen.getByText(/Salvar/i);
    await user.click(saveBtn);

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
    });
  });
});
