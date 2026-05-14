// Mock the ghostApi
jest.mock('../../services/ghostApi', () => ({
    listTags: jest.fn(),
    getTag: jest.fn(),
    createTag: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn()
}));

const ghostApi = require('../../services/ghostApi');
const tagController = require('../tagController');

describe('tagController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should return all tags', async () => {
            const mockTags = [
                {
                    id: '1',
                    name: 'News',
                    slug: 'news',
                    description: 'News articles',
                    feature_image: 'news.jpg',
                    meta_title: 'News',
                    meta_description: 'News meta',
                    count: { posts: 10 },
                    created_at: '2024-01-01',
                    updated_at: '2024-01-02'
                },
                {
                    id: '2',
                    name: 'Sports',
                    slug: 'sports',
                    description: null,
                    feature_image: null,
                    meta_title: null,
                    meta_description: null,
                    count: null,
                    created_at: '2024-01-01',
                    updated_at: '2024-01-02'
                }
            ];

            ghostApi.listTags.mockResolvedValue(mockTags);

            await tagController.list(req, res);

            expect(ghostApi.listTags).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [
                    {
                        id: '1',
                        name: 'News',
                        slug: 'news',
                        description: 'News articles',
                        feature_image: 'news.jpg',
                        meta_title: 'News',
                        meta_description: 'News meta',
                        count: 10,
                        created_at: '2024-01-01',
                        updated_at: '2024-01-02'
                    },
                    {
                        id: '2',
                        name: 'Sports',
                        slug: 'sports',
                        description: null,
                        feature_image: null,
                        meta_title: null,
                        meta_description: null,
                        count: 0,
                        created_at: '2024-01-01',
                        updated_at: '2024-01-02'
                    }
                ]
            });
        });

        it('should handle errors', async () => {
            ghostApi.listTags.mockRejectedValue(new Error('API Error'));

            await tagController.list(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'API Error' } });
        });
    });

    describe('get', () => {
        it('should return a single tag', async () => {
            req.params = { id: '1' };
            const mockTag = {
                id: '1',
                name: 'News',
                slug: 'news',
                description: 'News articles',
                feature_image: 'news.jpg',
                meta_title: 'News',
                meta_description: 'News meta',
                count: { posts: 10 }
            };

            ghostApi.getTag.mockResolvedValue(mockTag);

            await tagController.get(req, res);

            expect(ghostApi.getTag).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: '1',
                    name: 'News',
                    slug: 'news',
                    description: 'News articles',
                    feature_image: 'news.jpg',
                    meta_title: 'News',
                    meta_description: 'News meta',
                    count: 10
                }
            });
        });

        it('should return 404 if tag not found', async () => {
            req.params = { id: 'notfound' };
            ghostApi.getTag.mockRejectedValue(new Error('Tag not found'));

            await tagController.get(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Tag not found' } });
        });

        it('should handle other errors', async () => {
            req.params = { id: '1' };
            ghostApi.getTag.mockRejectedValue(new Error('Server error'));

            await tagController.get(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Server error' } });
        });
    });

    describe('create', () => {
        it('should create a new tag', async () => {
            req.body = { name: 'New Tag', description: 'A new tag' };
            const mockTag = {
                id: 'new123',
                name: 'New Tag',
                slug: 'new-tag',
                description: 'A new tag',
                feature_image: null,
                meta_title: null,
                meta_description: null
            };

            ghostApi.createTag.mockResolvedValue(mockTag);

            await tagController.create(req, res);

            expect(ghostApi.createTag).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: mockTag.id,
                    name: mockTag.name,
                    slug: mockTag.slug,
                    description: mockTag.description,
                    feature_image: mockTag.feature_image,
                    meta_title: mockTag.meta_title,
                    meta_description: mockTag.meta_description
                }
            });
        });

        it('should return 400 if name is missing', async () => {
            req.body = { description: 'No name' };

            await tagController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Name is required' } });
            expect(ghostApi.createTag).not.toHaveBeenCalled();
        });

        it('should handle API errors', async () => {
            req.body = { name: 'Test' };
            ghostApi.createTag.mockRejectedValue(new Error('Duplicate slug'));

            await tagController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Duplicate slug' } });
        });
    });

    describe('update', () => {
        it('should update a tag', async () => {
            req.params = { id: '1' };
            req.body = { name: 'Updated Tag' };
            const mockTag = {
                id: '1',
                name: 'Updated Tag',
                slug: 'updated-tag',
                description: null,
                feature_image: null,
                meta_title: null,
                meta_description: null
            };

            ghostApi.updateTag.mockResolvedValue(mockTag);

            await tagController.update(req, res);

            expect(ghostApi.updateTag).toHaveBeenCalledWith('1', req.body);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    id: mockTag.id,
                    name: mockTag.name,
                    slug: mockTag.slug,
                    description: mockTag.description,
                    feature_image: mockTag.feature_image,
                    meta_title: mockTag.meta_title,
                    meta_description: mockTag.meta_description
                }
            });
        });

        it('should return 404 if tag not found', async () => {
            req.params = { id: 'notfound' };
            req.body = { name: 'Test' };
            ghostApi.updateTag.mockRejectedValue(new Error('Tag not found'));

            await tagController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Tag not found' } });
        });

        it('should handle other errors', async () => {
            req.params = { id: '1' };
            req.body = { name: 'Test' };
            ghostApi.updateTag.mockRejectedValue(new Error('Validation error'));

            await tagController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Validation error' } });
        });
    });

    describe('delete', () => {
        it('should delete a tag', async () => {
            req.params = { id: '1' };
            ghostApi.deleteTag.mockResolvedValue();

            await tagController.delete(req, res);

            expect(ghostApi.deleteTag).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { message: 'Tag deleted successfully' } });
        });

        it('should return 404 if tag not found', async () => {
            req.params = { id: 'notfound' };
            ghostApi.deleteTag.mockRejectedValue(new Error('Tag not found'));

            await tagController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Tag not found' } });
        });

        it('should handle other errors', async () => {
            req.params = { id: '1' };
            ghostApi.deleteTag.mockRejectedValue(new Error('Server error'));

            await tagController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Server error' } });
        });
    });
});
