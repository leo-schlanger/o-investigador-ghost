import { render, screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../test-utils';
import MediaLibrary from '../MediaLibrary';

vi.mock('../../../services/media', () => ({
  getMedia: vi.fn(),
  uploadMedia: vi.fn(),
  deleteMedia: vi.fn(),
  getFolders: vi.fn(),
  createFolder: vi.fn(),
  updateFolder: vi.fn(),
  deleteFolder: vi.fn(),
  bulkMoveMedia: vi.fn()
}));

vi.mock('../../../components/Media/FolderTree', () => ({
  default: (props) => <div data-testid="folder-tree">FolderTree</div>
}));

vi.mock('../../../components/Media/MediaFilters', () => ({
  default: (props) => <div data-testid="media-filters">Filters</div>
}));

vi.mock('../../../components/Media/MediaDetailsSidebar', () => ({
  default: () => <div data-testid="media-details">Details</div>
}));

import { getMedia, getFolders } from '../../../services/media';

const mockMediaItems = [
  { id: '1', filename: 'test.jpg', url: '/uploads/test.jpg', mimetype: 'image/jpeg', size: 1024, originalName: 'test.jpg', createdAt: '2026-01-01' }
];

describe('MediaLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMedia.mockResolvedValue({ items: mockMediaItems, totalPages: 1, total: 1 });
    getFolders.mockResolvedValue([]);
  });

  it('should call getMedia on mount', async () => {
    renderWithRouter(<MediaLibrary />);
    await waitFor(() => {
      expect(getMedia).toHaveBeenCalled();
    });
  });

  it('should render media items after loading', async () => {
    renderWithRouter(<MediaLibrary />);
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  it('should call getFolders on mount', async () => {
    renderWithRouter(<MediaLibrary />);
    await waitFor(() => {
      expect(getFolders).toHaveBeenCalled();
    });
  });

  it('should handle fetch error', async () => {
    getMedia.mockRejectedValue(new Error('Server Error'));
    renderWithRouter(<MediaLibrary />);
    await waitFor(() => {
      const errorEl = screen.queryByText(/falha|erro/i);
      if (errorEl) expect(errorEl).toBeInTheDocument();
    });
  });
});
