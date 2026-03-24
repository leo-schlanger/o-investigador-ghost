import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../Settings';
import { renderWithRouter } from '../../../test-utils';

// Mock the settings service
vi.mock('../../../services/settings', () => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn()
}));

import { getSettings, updateSettings } from '../../../services/settings';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', async () => {
    getSettings.mockReturnValue(new Promise(() => {})); // Never resolves

    renderWithRouter(<SettingsPage />);

    expect(screen.getByText('Configuracoes')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Configuracoes' })).toBeInTheDocument();
  });

  it('should load and display settings', async () => {
    getSettings.mockResolvedValue({
      siteTitle: 'My Test Site',
      siteDescription: 'A great site'
    });

    renderWithRouter(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Titulo do Site')).toHaveValue('My Test Site');
    });

    expect(screen.getByLabelText('Descricao do Site')).toHaveValue('A great site');
  });

  it('should use default values when settings are empty', async () => {
    getSettings.mockResolvedValue({});

    renderWithRouter(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Titulo do Site')).toHaveValue('O Investigador');
    });

    expect(screen.getByLabelText('Descricao do Site')).toHaveValue(
      'Portal de Jornalismo Investigativo'
    );
  });

  it('should show error message when loading fails', async () => {
    getSettings.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Falha ao carregar configuracoes')).toBeInTheDocument();
    });
  });

  it('should update settings on form change', async () => {
    const user = userEvent.setup();
    getSettings.mockResolvedValue({
      siteTitle: 'Original Title',
      siteDescription: 'Original Description'
    });

    renderWithRouter(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Titulo do Site')).toHaveValue('Original Title');
    });

    const titleInput = screen.getByLabelText('Titulo do Site');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    expect(titleInput).toHaveValue('New Title');
  });

  it('should save settings successfully', async () => {
    const user = userEvent.setup();
    getSettings.mockResolvedValue({
      siteTitle: 'Original Title',
      siteDescription: 'Original Description'
    });
    updateSettings.mockResolvedValue({
      siteTitle: 'New Title',
      siteDescription: 'Original Description'
    });

    renderWithRouter(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Titulo do Site')).toHaveValue('Original Title');
    });

    const titleInput = screen.getByLabelText('Titulo do Site');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    const saveButton = screen.getByRole('button', { name: 'Salvar Alteracoes' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Configuracoes salvas com sucesso!')).toBeInTheDocument();
    });

    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        siteTitle: 'New Title',
        siteDescription: 'Original Description'
      })
    );
  });

  it('should show error message when save fails', async () => {
    const user = userEvent.setup();
    getSettings.mockResolvedValue({
      siteTitle: 'Title',
      siteDescription: 'Description'
    });
    updateSettings.mockRejectedValue(new Error('Save failed'));

    renderWithRouter(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Titulo do Site')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Salvar Alteracoes' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Falha ao salvar configuracoes')).toBeInTheDocument();
    });
  });

  it('should show saving state while saving', async () => {
    const user = userEvent.setup();
    getSettings.mockResolvedValue({
      siteTitle: 'Title',
      siteDescription: 'Description'
    });
    updateSettings.mockReturnValue(new Promise(() => {})); // Never resolves

    renderWithRouter(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Titulo do Site')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Salvar Alteracoes' });
    await user.click(saveButton);

    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeInTheDocument();
  });
});
