import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test-utils';
import PagesList from '../PagesList';

vi.mock('../../../services/pages', () => ({
  getPages: vi.fn(),
  deletePage: vi.fn()
}));

import { getPages, deletePage } from '../../../services/pages';

const mockPages = {
  pages: [
    { id: '1', title: 'Sobre Nos', slug: 'sobre-nos', status: 'published', updated_at: '2026-01-15T10:00:00Z' },
    { id: '2', title: 'Contacto', slug: 'contacto', status: 'draft', updated_at: '2026-01-14T10:00:00Z' }
  ]
};

describe('PagesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPages.mockResolvedValue(mockPages);
  });

  it('should show heading', () => {
    getPages.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<PagesList />);
    expect(screen.getByText('Paginas')).toBeInTheDocument();
  });

  it('should render pages list after loading', async () => {
    renderWithRouter(<PagesList />);
    await waitFor(() => {
      expect(screen.getAllByText('Sobre Nos').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Contacto').length).toBeGreaterThan(0);
  });

  it('should navigate to create page', async () => {
    renderWithRouter(<PagesList />);
    await waitFor(() => {
      expect(screen.getAllByText('Sobre Nos').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Nova Pagina')).toBeInTheDocument();
  });

  it('should show delete confirmation', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PagesList />);
    await waitFor(() => {
      expect(screen.getAllByText('Sobre Nos').length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByTitle('Excluir');
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      await waitFor(() => {
        expect(screen.getByText(/Confirmar exclusao/i)).toBeInTheDocument();
      });
    }
  });

  it('should handle fetch error', async () => {
    getPages.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<PagesList />);
    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
  });
});
