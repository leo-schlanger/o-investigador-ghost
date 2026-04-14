import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test-utils';
import ArticlesList from '../ArticlesList';

vi.mock('../../../services/articles', () => ({
  getArticles: vi.fn(),
  deleteArticle: vi.fn(),
  ARTICLE_TYPES: [
    { value: 'cronica', label: 'Cronica' },
    { value: 'reportagem', label: 'Reportagem' },
    { value: 'opiniao', label: 'Opiniao' }
  ]
}));

import { getArticles, deleteArticle } from '../../../services/articles';

const mockArticles = {
  articles: [
    { id: '1', title: 'Artigo Teste', status: 'published', slug: 'artigo-teste', published_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
    { id: '2', title: 'Rascunho', status: 'draft', slug: 'rascunho', published_at: null, updated_at: '2026-01-14T10:00:00Z' }
  ],
  meta: { pagination: { page: 1, pages: 3, total: 25 } }
};

describe('ArticlesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getArticles.mockResolvedValue(mockArticles);
  });

  it('should show loading skeleton initially', () => {
    getArticles.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<ArticlesList />);
    expect(screen.getByText('Artigos')).toBeInTheDocument();
  });

  it('should render articles list after loading', async () => {
    renderWithRouter(<ArticlesList />);
    await waitFor(() => {
      expect(screen.getAllByText('Artigo Teste')[0]).toBeInTheDocument();
    });
    expect(screen.getAllByText('Rascunho').length).toBeGreaterThan(0);
  });

  it('should show error message on fetch failure', async () => {
    getArticles.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<ArticlesList />);
    await waitFor(() => {
      expect(screen.getByText(/Erro de conexao/i)).toBeInTheDocument();
    });
  });

  it('should call getArticles with search params', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesList />);
    await waitFor(() => {
      expect(screen.getAllByText('Artigo Teste')[0]).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar/i);
    await user.type(searchInput, 'teste');

    await waitFor(() => {
      expect(getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'teste' })
      );
    });
  });

  it('should show delete confirmation modal', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ArticlesList />);
    await waitFor(() => {
      expect(screen.getAllByText('Artigo Teste')[0]).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Excluir');
    await user.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Confirmar exclusao')).toBeInTheDocument();
    });
  });
});
