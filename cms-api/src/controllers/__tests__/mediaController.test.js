// Mock dependencies before importing the controller
jest.mock('fs', () => ({
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    unlinkSync: jest.fn()
}));

jest.mock('../../models', () => ({
    Media: {
        create: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn()
    }
}));

const fs = require('fs');
const { Media } = require('../../models');
const mediaController = require('../mediaController');

describe('mediaController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            file: null,
            get: jest.fn(() => 'localhost:3000'),
            protocol: 'http',
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('listMedia', () => {
        it('should return all media items', async () => {
            const mockMedia = [
                { id: 1, filename: 'test1.jpg', url: 'http://localhost/uploads/test1.jpg' },
                { id: 2, filename: 'test2.png', url: 'http://localhost/uploads/test2.png' }
            ];

            Media.findAll.mockResolvedValue(mockMedia);

            await mediaController.listMedia(req, res);

            expect(Media.findAll).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
            expect(res.json).toHaveBeenCalledWith(mockMedia);
        });

        it('should handle errors', async () => {
            Media.findAll.mockRejectedValue(new Error('Database error'));

            await mediaController.listMedia(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('deleteMedia', () => {
        it('should delete media successfully', async () => {
            req.params = { id: '1' };
            const mockMedia = {
                id: 1,
                filename: 'test.jpg',
                destroy: jest.fn().mockResolvedValue()
            };

            Media.findByPk.mockResolvedValue(mockMedia);
            fs.existsSync.mockReturnValue(true);

            await mediaController.deleteMedia(req, res);

            expect(Media.findByPk).toHaveBeenCalledWith('1');
            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(mockMedia.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Media deleted' });
        });

        it('should return 404 if media not found', async () => {
            req.params = { id: '999' };
            Media.findByPk.mockResolvedValue(null);

            await mediaController.deleteMedia(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Media not found' });
        });

        it('should handle delete when file does not exist on disk', async () => {
            req.params = { id: '1' };
            const mockMedia = {
                id: 1,
                filename: 'test.jpg',
                destroy: jest.fn().mockResolvedValue()
            };

            Media.findByPk.mockResolvedValue(mockMedia);
            fs.existsSync.mockReturnValue(false);

            await mediaController.deleteMedia(req, res);

            expect(fs.unlinkSync).not.toHaveBeenCalled();
            expect(mockMedia.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Media deleted' });
        });

        it('should handle errors', async () => {
            req.params = { id: '1' };
            Media.findByPk.mockRejectedValue(new Error('Database error'));

            await mediaController.deleteMedia(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
});
