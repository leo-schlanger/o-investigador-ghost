// Mock the ghostApi
jest.mock('../../services/ghostApi', () => ({
    listPages: jest.fn(),
    getPage: jest.fn(),
    createPage: jest.fn(),
    updatePage: jest.fn(),
    deletePage: jest.fn(),
    transformGhostPost: jest.fn((page) => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status
    }))
}));

const ghostApi = require('../../services/ghostApi');
const pageController = require('../pageController');

describe('pageController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should return all pages', async () => {
            const mockPages = {
                pages: [{ id: '1', title: 'About', slug: 'about', status: 'published' }],
                meta: { pagination: { page: 1, total: 1 } }
            };

            ghostApi.listPages.mockResolvedValue(mockPages);

            await pageController.list(req, res);

            expect(ghostApi.listPages).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                pages: [{ id: '1', title: 'About', slug: 'about', status: 'published' }],
                meta: mockPages.meta
            });
        });

        it('should apply query parameters', async () => {
            req.query = { status: 'published', search: 'about', page: '2', limit: '10' };
            ghostApi.listPages.mockResolvedValue({ pages: [], meta: {} });

            await pageController.list(req, res);

            expect(ghostApi.listPages).toHaveBeenCalledWith({
                status: 'published',
                search: 'about',
                page: 2,
                limit: 10
            });
        });

        it('should handle errors', async () => {
            ghostApi.listPages.mockRejectedValue(new Error('API Error'));

            await pageController.list(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'API Error' });
        });
    });

    describe('get', () => {
        it('should return a single page', async () => {
            req.params = { id: '1' };
            const mockPage = { id: '1', title: 'About', slug: 'about', status: 'published' };

            ghostApi.getPage.mockResolvedValue(mockPage);

            await pageController.get(req, res);

            expect(ghostApi.getPage).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if page not found', async () => {
            req.params = { id: 'notfound' };
            ghostApi.getPage.mockRejectedValue(new Error('Page not found'));

            await pageController.get(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Page not found' });
        });

        it('should handle other errors', async () => {
            req.params = { id: '1' };
            ghostApi.getPage.mockRejectedValue(new Error('Server error'));

            await pageController.get(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('create', () => {
        it('should create a new page', async () => {
            req.body = { title: 'New Page', status: 'draft' };
            const mockPage = { id: 'new123', title: 'New Page', slug: 'new-page', status: 'draft' };

            ghostApi.createPage.mockResolvedValue(mockPage);

            await pageController.create(req, res);

            expect(ghostApi.createPage).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if title is missing', async () => {
            req.body = { status: 'draft' };

            await pageController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
        });

        it('should handle API errors', async () => {
            req.body = { title: 'Test' };
            ghostApi.createPage.mockRejectedValue(new Error('API Error'));

            await pageController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('update', () => {
        it('should update a page', async () => {
            req.params = { id: '1' };
            req.body = { title: 'Updated Page' };
            const mockPage = {
                id: '1',
                title: 'Updated Page',
                slug: 'updated-page',
                status: 'published'
            };

            ghostApi.updatePage.mockResolvedValue(mockPage);

            await pageController.update(req, res);

            expect(ghostApi.updatePage).toHaveBeenCalledWith('1', req.body);
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if page not found', async () => {
            req.params = { id: 'notfound' };
            req.body = { title: 'Test' };
            ghostApi.updatePage.mockRejectedValue(new Error('Page not found'));

            await pageController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should handle other errors', async () => {
            req.params = { id: '1' };
            req.body = { title: 'Test' };
            ghostApi.updatePage.mockRejectedValue(new Error('Validation error'));

            await pageController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('delete', () => {
        it('should delete a page', async () => {
            req.params = { id: '1' };
            ghostApi.deletePage.mockResolvedValue();

            await pageController.delete(req, res);

            expect(ghostApi.deletePage).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith({ message: 'Page deleted successfully' });
        });

        it('should return 404 if page not found', async () => {
            req.params = { id: 'notfound' };
            ghostApi.deletePage.mockRejectedValue(new Error('Page not found'));

            await pageController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should handle other errors', async () => {
            req.params = { id: '1' };
            ghostApi.deletePage.mockRejectedValue(new Error('Server error'));

            await pageController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
