// Mock dependencies
jest.mock('../../services/ghostApi', () => ({
    listPosts: jest.fn(),
    getPost: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    listTags: jest.fn(),
    listAuthors: jest.fn(),
    createTag: jest.fn(),
    transformGhostPost: jest.fn((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        html: post.html
    })),
    ARTICLE_TYPES: {
        cronica: { name: '#Cronica', slug: 'hash-cronica', label: 'Cronica' },
        reportagem: { name: '#Reportagem', slug: 'hash-reportagem', label: 'Reportagem' },
        opiniao: { name: '#Opiniao', slug: 'hash-opiniao', label: 'Opiniao' }
    },
    getArticleTypeTag: jest.fn((type) => ({
        name: `#${type.charAt(0).toUpperCase() + type.slice(1)}`
    })),
    removeTypeTags: jest.fn((tags) => tags.filter((t) => !t.startsWith('#')))
}));

jest.mock('../../models', () => ({
    ArticleRevision: {
        findOne: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        cleanOldRevisions: jest.fn()
    }
}));

const ghostApi = require('../../services/ghostApi');
const { ArticleRevision } = require('../../models');
const articleController = require('../articleController');

describe('articleController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {},
            user: { id: 1, name: 'Test User' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should list articles with default parameters', async () => {
            const mockPosts = {
                posts: [
                    { id: '1', title: 'Test Article', slug: 'test-article', status: 'published' }
                ],
                meta: { pagination: { page: 1, limit: 15, total: 1 } }
            };

            ghostApi.listPosts.mockResolvedValue(mockPosts);

            await articleController.list(req, res);

            expect(ghostApi.listPosts).toHaveBeenCalledWith({
                status: 'all',
                search: '',
                page: 1,
                limit: 15
            });
            expect(res.json).toHaveBeenCalled();
        });

        it('should sanitize and apply query parameters', async () => {
            req.query = {
                status: 'published',
                search: 'test query',
                page: '2',
                limit: '20'
            };

            ghostApi.listPosts.mockResolvedValue({ posts: [], meta: {} });

            await articleController.list(req, res);

            expect(ghostApi.listPosts).toHaveBeenCalledWith({
                status: 'published',
                search: 'test query',
                page: 2,
                limit: 20
            });
        });

        it('should sanitize invalid status to "all"', async () => {
            req.query = { status: 'invalid_status' };
            ghostApi.listPosts.mockResolvedValue({ posts: [], meta: {} });

            await articleController.list(req, res);

            expect(ghostApi.listPosts).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'all' })
            );
        });

        it('should limit the limit parameter to 100', async () => {
            req.query = { limit: '500' };
            ghostApi.listPosts.mockResolvedValue({ posts: [], meta: {} });

            await articleController.list(req, res);

            expect(ghostApi.listPosts).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 100 })
            );
        });

        it('should filter by article type', async () => {
            req.query = { type: 'cronica' };
            ghostApi.listPosts.mockResolvedValue({ posts: [], meta: {} });

            await articleController.list(req, res);

            expect(ghostApi.listPosts).toHaveBeenCalledWith(
                expect.objectContaining({ filter: 'tag:hash-cronica' })
            );
        });

        it('should handle errors', async () => {
            ghostApi.listPosts.mockRejectedValue(new Error('API Error'));

            await articleController.list(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'API Error' });
        });
    });

    describe('get', () => {
        it('should return a single article', async () => {
            req.params = { id: 'abc123' };
            const mockPost = { id: 'abc123', title: 'Test', slug: 'test', status: 'published' };

            ghostApi.getPost.mockResolvedValue(mockPost);

            await articleController.get(req, res);

            expect(ghostApi.getPost).toHaveBeenCalledWith('abc123');
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if article not found', async () => {
            req.params = { id: 'notfound' };
            ghostApi.getPost.mockRejectedValue(new Error('Post not found'));

            await articleController.get(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Article not found' });
        });

        it('should handle other errors', async () => {
            req.params = { id: 'abc123' };
            ghostApi.getPost.mockRejectedValue(new Error('Server error'));

            await articleController.get(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('create', () => {
        it('should create an article successfully', async () => {
            req.body = { title: 'New Article', status: 'draft' };
            const mockPost = {
                id: 'new123',
                title: 'New Article',
                slug: 'new-article',
                status: 'draft'
            };

            ghostApi.createPost.mockResolvedValue(mockPost);

            await articleController.create(req, res);

            expect(ghostApi.createPost).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if title is missing', async () => {
            req.body = { status: 'draft' };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
        });

        it('should return 400 if title is empty', async () => {
            req.body = { title: '   ' };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
        });

        it('should return 400 if title is too long', async () => {
            req.body = { title: 'a'.repeat(256) };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Title must be less than 255 characters'
            });
        });

        it('should return 400 if slug is too long', async () => {
            req.body = { title: 'Test', slug: 'a'.repeat(192) };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Slug must be less than 191 characters'
            });
        });

        it('should return 400 for invalid status', async () => {
            req.body = { title: 'Test', status: 'invalid' };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid status. Must be: draft, published, or scheduled'
            });
        });

        it('should return 400 if scheduled without publish date', async () => {
            req.body = { title: 'Test', status: 'scheduled' };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Scheduled posts require a publish date'
            });
        });

        it('should return 400 for invalid visibility', async () => {
            req.body = { title: 'Test', visibility: 'invalid' };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid visibility. Must be: public, members, or paid'
            });
        });

        it('should return 400 for invalid article type', async () => {
            req.body = { title: 'Test', article_type: 'invalid_type' };

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid article type. Must be: cronica, reportagem, or opiniao'
            });
        });

        it('should add article type tag when specified', async () => {
            req.body = { title: 'Test', article_type: 'cronica' };
            ghostApi.createPost.mockResolvedValue({
                id: '1',
                title: 'Test',
                slug: 'test',
                status: 'draft'
            });

            await articleController.create(req, res);

            expect(ghostApi.createPost).toHaveBeenCalledWith(
                expect.objectContaining({ tags: expect.arrayContaining(['#Cronica']) })
            );
        });

        it('should handle API errors', async () => {
            req.body = { title: 'Test' };
            ghostApi.createPost.mockRejectedValue(new Error('API Error'));

            await articleController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            req.params = { id: 'abc123' };
            ArticleRevision.findOne.mockResolvedValue(null);
            ArticleRevision.create.mockResolvedValue({});
            ArticleRevision.cleanOldRevisions.mockResolvedValue();
        });

        it('should update an article successfully', async () => {
            req.body = { title: 'Updated Title' };
            const mockPost = {
                id: 'abc123',
                title: 'Updated Title',
                slug: 'test',
                status: 'draft'
            };

            ghostApi.getPost.mockResolvedValue(mockPost);
            ghostApi.updatePost.mockResolvedValue(mockPost);

            await articleController.update(req, res);

            expect(ghostApi.updatePost).toHaveBeenCalledWith('abc123', expect.any(Object));
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 400 if title is empty string', async () => {
            req.body = { title: '' };

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Title cannot be empty' });
        });

        it('should return 404 if article not found', async () => {
            req.body = { title: 'Test' };
            ghostApi.getPost.mockResolvedValue(null);
            ghostApi.updatePost.mockRejectedValue(new Error('not found'));

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 409 on update collision', async () => {
            req.body = { title: 'Test' };
            ghostApi.getPost.mockResolvedValue({ id: 'abc123', title: 'Old' });
            ghostApi.updatePost.mockRejectedValue(new Error('UpdateCollisionError'));

            await articleController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('should save revision before updating', async () => {
            req.body = { title: 'Updated' };
            const currentPost = {
                id: 'abc123',
                title: 'Original',
                html: '<p>Content</p>',
                status: 'draft'
            };

            ghostApi.getPost.mockResolvedValue(currentPost);
            ghostApi.updatePost.mockResolvedValue({ ...currentPost, title: 'Updated' });
            ArticleRevision.findOne.mockResolvedValue({ revisionNumber: 5 });

            await articleController.update(req, res);

            expect(ArticleRevision.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    articleId: 'abc123',
                    title: 'Original',
                    revisionNumber: 6
                })
            );
        });
    });

    describe('delete', () => {
        it('should delete an article successfully', async () => {
            req.params = { id: 'abc123' };
            ghostApi.deletePost.mockResolvedValue();

            await articleController.delete(req, res);

            expect(ghostApi.deletePost).toHaveBeenCalledWith('abc123');
            expect(res.json).toHaveBeenCalledWith({ message: 'Article deleted successfully' });
        });

        it('should return 400 if no ID provided', async () => {
            req.params = {};

            await articleController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Article ID is required' });
        });

        it('should return 404 if article not found', async () => {
            req.params = { id: 'notfound' };
            ghostApi.deletePost.mockRejectedValue(new Error('not found'));

            await articleController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getTags', () => {
        it('should return all tags', async () => {
            const mockTags = [
                {
                    id: '1',
                    name: 'News',
                    slug: 'news',
                    description: 'News articles',
                    count: { posts: 10 }
                },
                { id: '2', name: 'Sports', slug: 'sports', description: null, count: { posts: 5 } }
            ];

            ghostApi.listTags.mockResolvedValue(mockTags);

            await articleController.getTags(req, res);

            expect(res.json).toHaveBeenCalledWith([
                { id: '1', name: 'News', slug: 'news', description: 'News articles', count: 10 },
                { id: '2', name: 'Sports', slug: 'sports', description: null, count: 5 }
            ]);
        });

        it('should handle errors', async () => {
            ghostApi.listTags.mockRejectedValue(new Error('API Error'));

            await articleController.getTags(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getAuthors', () => {
        it('should return all authors', async () => {
            const mockAuthors = [
                {
                    id: '1',
                    name: 'John Doe',
                    slug: 'john',
                    email: 'john@test.com',
                    profile_image: 'img.jpg'
                }
            ];

            ghostApi.listAuthors.mockResolvedValue(mockAuthors);

            await articleController.getAuthors(req, res);

            expect(res.json).toHaveBeenCalledWith([
                {
                    id: '1',
                    name: 'John Doe',
                    slug: 'john',
                    email: 'john@test.com',
                    profile_image: 'img.jpg'
                }
            ]);
        });

        it('should handle errors', async () => {
            ghostApi.listAuthors.mockRejectedValue(new Error('API Error'));

            await articleController.getAuthors(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getTypes', () => {
        it('should return article types', async () => {
            await articleController.getTypes(req, res);

            expect(res.json).toHaveBeenCalledWith([
                {
                    value: 'cronica',
                    label: 'Cronica',
                    tagName: '#Cronica',
                    tagSlug: 'hash-cronica'
                },
                {
                    value: 'reportagem',
                    label: 'Reportagem',
                    tagName: '#Reportagem',
                    tagSlug: 'hash-reportagem'
                },
                { value: 'opiniao', label: 'Opiniao', tagName: '#Opiniao', tagSlug: 'hash-opiniao' }
            ]);
        });
    });

    describe('initTypes', () => {
        it('should create tags that do not exist', async () => {
            ghostApi.listTags.mockResolvedValue([]);
            ghostApi.createTag.mockResolvedValue({});

            await articleController.initTypes(req, res);

            expect(ghostApi.createTag).toHaveBeenCalledTimes(3);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Article type tags initialization complete',
                    results: expect.arrayContaining([
                        expect.objectContaining({ status: 'created' })
                    ])
                })
            );
        });

        it('should skip tags that already exist', async () => {
            ghostApi.listTags.mockResolvedValue([
                { slug: 'hash-cronica' },
                { slug: 'hash-reportagem' },
                { slug: 'hash-opiniao' }
            ]);

            await articleController.initTypes(req, res);

            expect(ghostApi.createTag).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    results: expect.arrayContaining([expect.objectContaining({ status: 'exists' })])
                })
            );
        });
    });

    describe('getRevisions', () => {
        it('should return revisions for an article', async () => {
            req.params = { id: 'abc123' };
            const mockRevisions = [
                {
                    id: 1,
                    revisionNumber: 2,
                    title: 'V2',
                    userName: 'User',
                    status: 'draft',
                    createdAt: new Date()
                },
                {
                    id: 2,
                    revisionNumber: 1,
                    title: 'V1',
                    userName: 'User',
                    status: 'draft',
                    createdAt: new Date()
                }
            ];

            ArticleRevision.findAll.mockResolvedValue(mockRevisions);

            await articleController.getRevisions(req, res);

            expect(ArticleRevision.findAll).toHaveBeenCalledWith({
                where: { articleId: 'abc123' },
                order: [['createdAt', 'DESC']],
                attributes: ['id', 'revisionNumber', 'title', 'userName', 'status', 'createdAt']
            });
            expect(res.json).toHaveBeenCalledWith(mockRevisions);
        });

        it('should handle errors', async () => {
            req.params = { id: 'abc123' };
            ArticleRevision.findAll.mockRejectedValue(new Error('DB Error'));

            await articleController.getRevisions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getRevision', () => {
        it('should return a specific revision', async () => {
            req.params = { id: 'abc123', revisionId: '1' };
            const mockRevision = {
                id: 1,
                articleId: 'abc123',
                title: 'Test',
                content: '<p>Test</p>'
            };

            ArticleRevision.findOne.mockResolvedValue(mockRevision);

            await articleController.getRevision(req, res);

            expect(ArticleRevision.findOne).toHaveBeenCalledWith({
                where: { id: '1', articleId: 'abc123' }
            });
            expect(res.json).toHaveBeenCalledWith(mockRevision);
        });

        it('should return 404 if revision not found', async () => {
            req.params = { id: 'abc123', revisionId: '999' };
            ArticleRevision.findOne.mockResolvedValue(null);

            await articleController.getRevision(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Revision not found' });
        });
    });

    describe('restoreRevision', () => {
        it('should restore an article to a previous revision', async () => {
            req.params = { id: 'abc123', revisionId: '1' };
            const mockRevision = {
                id: 1,
                articleId: 'abc123',
                title: 'Old Title',
                content: '<p>Old content</p>',
                excerpt: 'Old excerpt',
                featureImage: 'old.jpg'
            };
            const currentPost = {
                id: 'abc123',
                title: 'Current',
                html: '<p>Current</p>',
                status: 'draft'
            };
            const restoredPost = {
                id: 'abc123',
                title: 'Old Title',
                slug: 'test',
                status: 'draft'
            };

            ArticleRevision.findOne
                .mockResolvedValueOnce(mockRevision) // For initial check
                .mockResolvedValueOnce({ revisionNumber: 5 }); // For getting last revision number

            ghostApi.getPost.mockResolvedValue(currentPost);
            ghostApi.updatePost.mockResolvedValue(restoredPost);
            ArticleRevision.create.mockResolvedValue({});

            await articleController.restoreRevision(req, res);

            expect(ghostApi.updatePost).toHaveBeenCalledWith('abc123', {
                title: 'Old Title',
                html: '<p>Old content</p>',
                custom_excerpt: 'Old excerpt',
                feature_image: 'old.jpg'
            });
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Article restored successfully' })
            );
        });

        it('should return 404 if revision not found', async () => {
            req.params = { id: 'abc123', revisionId: '999' };
            ArticleRevision.findOne.mockResolvedValue(null);

            await articleController.restoreRevision(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
