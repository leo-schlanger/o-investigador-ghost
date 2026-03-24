const mediaController = require('../mediaController');

// Mock dependencies
jest.mock('../../models', () => ({
    Media: {
        findAndCountAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        create: jest.fn()
    },
    MediaFolder: {
        findByPk: jest.fn()
    },
    MediaTag: {},
    MediaTagAssignment: {
        findAll: jest.fn(),
        destroy: jest.fn(),
        bulkCreate: jest.fn()
    },
    sequelize: {
        literal: jest.fn((str) => str)
    },
    Sequelize: {
        Op: {
            like: Symbol('like'),
            or: Symbol('or'),
            in: Symbol('in')
        }
    }
}));

const { Media, MediaFolder, MediaTagAssignment } = require('../../models');

describe('mediaController', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = { query: {}, params: {}, body: {} };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('listMedia', () => {
        it('should list media with default pagination', async () => {
            const mockMedia = [{ id: 1, filename: 'test.jpg' }];
            Media.findAndCountAll.mockResolvedValue({ count: 1, rows: mockMedia });

            await mediaController.listMedia(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({ items: mockMedia, total: 1 })
            );
        });

        it('should filter by folder ID', async () => {
            mockReq.query = { folderId: '5' };
            Media.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

            await mediaController.listMedia(mockReq, mockRes);

            expect(Media.findAndCountAll).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            Media.findAndCountAll.mockRejectedValue(new Error('DB error'));

            await mediaController.listMedia(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getMedia', () => {
        it('should return media by ID', async () => {
            mockReq.params = { id: '1' };
            Media.findByPk.mockResolvedValue({ id: 1, filename: 'test.jpg' });

            await mediaController.getMedia(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalled();
        });

        it('should return 404 if not found', async () => {
            mockReq.params = { id: '999' };
            Media.findByPk.mockResolvedValue(null);

            await mediaController.getMedia(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateMedia', () => {
        it('should return 404 if media not found', async () => {
            mockReq.params = { id: '999' };
            mockReq.body = { folderId: 1 };
            Media.findByPk.mockResolvedValue(null);

            await mediaController.updateMedia(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('should return 404 if folder not found', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = { folderId: 999 };
            Media.findByPk.mockResolvedValue({ id: 1, save: jest.fn() });
            MediaFolder.findByPk.mockResolvedValue(null);

            await mediaController.updateMedia(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('bulkMove', () => {
        it('should move multiple media items', async () => {
            mockReq.body = { mediaIds: [1, 2], folderId: 5 };
            MediaFolder.findByPk.mockResolvedValue({ id: 5 });
            Media.update.mockResolvedValue([2]);

            await mediaController.bulkMove(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({ updatedCount: 2 })
            );
        });

        it('should return 400 if no media IDs', async () => {
            mockReq.body = { mediaIds: [], folderId: 5 };

            await mediaController.bulkMove(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('bulkAddTags', () => {
        it('should add tags to media', async () => {
            mockReq.body = { mediaIds: [1, 2], tagIds: [3] };
            MediaTagAssignment.bulkCreate.mockResolvedValue([]);

            await mediaController.bulkAddTags(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalled();
        });

        it('should return 400 if no media IDs', async () => {
            mockReq.body = { mediaIds: [], tagIds: [1] };

            await mediaController.bulkAddTags(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if no tag IDs', async () => {
            mockReq.body = { mediaIds: [1], tagIds: [] };

            await mediaController.bulkAddTags(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('deleteMedia', () => {
        it('should return 404 if not found', async () => {
            mockReq.params = { id: '999' };
            Media.findByPk.mockResolvedValue(null);

            await mediaController.deleteMedia(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });
});
