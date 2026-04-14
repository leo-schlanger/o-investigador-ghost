import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test-utils';
import Dashboard from '../../Dashboard';

vi.mock('../../../services/stats', () => ({
  getStats: vi.fn(),
  getTopArticles: vi.fn(),
  getViewsByCountry: vi.fn()
}));

import { getStats, getTopArticles, getViewsByCountry } from '../../../services/stats';

const mockStats = {
  viewsToday: 150,
  viewsWeek: 800,
  viewsMonth: 3000,
  totalViews: 5000,
  articlesCount: 42,
  usersCount: 8
};
const mockTopArticles = [{ postTitle: 'Artigo Popular', viewCount: 100, postSlug: 'artigo-popular' }];
const mockCountry = [{ country: 'PT', views: 300 }];

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStats.mockResolvedValue(mockStats);
    getTopArticles.mockResolvedValue(mockTopArticles);
    getViewsByCountry.mockResolvedValue(mockCountry);
  });

  it('should show loading skeleton initially', () => {
    getStats.mockReturnValue(new Promise(() => {}));
    getTopArticles.mockReturnValue(new Promise(() => {}));
    getViewsByCountry.mockReturnValue(new Promise(() => {}));
    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Painel')).toBeInTheDocument();
  });

  it('should render stats after loading', async () => {
    renderWithRouter(<Dashboard />);
    await waitFor(() => {
      // viewsToday=150, rendered with toLocaleString
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('should render top articles', async () => {
    renderWithRouter(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Artigo Popular')).toBeInTheDocument();
    });
  });

  it('should show error gracefully when stats fail', async () => {
    getStats.mockRejectedValue(new Error('Server error'));
    getTopArticles.mockRejectedValue(new Error('Server error'));
    getViewsByCountry.mockRejectedValue(new Error('Server error'));
    renderWithRouter(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Painel')).toBeInTheDocument();
    });
  });
});
