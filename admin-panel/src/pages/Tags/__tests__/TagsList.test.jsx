import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../test-utils';
import TagsList from '../TagsList';

vi.mock('../../../services/tags', () => ({
  getTags: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn()
}));

vi.mock('../../Media/MediaLibrary', () => ({
  default: () => <div data-testid="media-library">MediaLibrary Mock</div>
}));

import { getTags, createTag, deleteTag } from '../../../services/tags';

const mockTags = [
  { id: '1', name: 'Politica', slug: 'politica', description: 'Artigos de politica' },
  { id: '2', name: 'Economia', slug: 'economia', description: 'Artigos de economia' }
];

describe('TagsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTags.mockResolvedValue(mockTags);
  });

  it('should render after loading', async () => {
    renderWithRouter(<TagsList />);
    await waitFor(() => {
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  it('should render tags list after loading', async () => {
    renderWithRouter(<TagsList />);
    await waitFor(() => {
      expect(screen.getAllByText('Politica').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Economia').length).toBeGreaterThan(0);
  });

  it('should open create modal on button click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<TagsList />);
    await waitFor(() => {
      expect(screen.getAllByText('Politica').length).toBeGreaterThan(0);
    });

    const createBtn = screen.getByText(/Nova Tag/i);
    await user.click(createBtn);
    await waitFor(() => {
      expect(screen.getByText('Nome *')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    getTags.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<TagsList />);
    await waitFor(() => {
      expect(screen.getByText(/falha|erro/i)).toBeInTheDocument();
    });
  });
});
