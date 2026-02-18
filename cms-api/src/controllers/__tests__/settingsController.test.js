// Mock the models
jest.mock('../../models', () => ({
    Settings: {
        findAll: jest.fn(),
        findOrCreate: jest.fn()
    }
}));

const { Settings } = require('../../models');
const settingsController = require('../settingsController');

describe('settingsController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getSettings', () => {
        it('should return all settings as an object', async () => {
            const mockSettings = [
                { key: 'siteTitle', value: 'Test Site' },
                { key: 'siteDescription', value: 'A test description' }
            ];

            Settings.findAll.mockResolvedValue(mockSettings);

            await settingsController.getSettings(req, res);

            expect(Settings.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                siteTitle: 'Test Site',
                siteDescription: 'A test description'
            });
        });

        it('should return empty object when no settings exist', async () => {
            Settings.findAll.mockResolvedValue([]);

            await settingsController.getSettings(req, res);

            expect(res.json).toHaveBeenCalledWith({});
        });

        it('should handle errors', async () => {
            Settings.findAll.mockRejectedValue(new Error('Database error'));

            await settingsController.getSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('updateSettings', () => {
        it('should update settings successfully', async () => {
            req.body = {
                siteTitle: 'New Title',
                siteDescription: 'New Description'
            };

            const mockSetting = {
                key: 'siteTitle',
                value: 'Old Title',
                save: jest.fn().mockResolvedValue(true)
            };

            Settings.findOrCreate.mockResolvedValue([mockSetting, false]);
            Settings.findAll.mockResolvedValue([
                { key: 'siteTitle', value: 'New Title' },
                { key: 'siteDescription', value: 'New Description' }
            ]);

            await settingsController.updateSettings(req, res);

            expect(Settings.findOrCreate).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith({
                siteTitle: 'New Title',
                siteDescription: 'New Description'
            });
        });

        it('should return 400 for invalid input', async () => {
            req.body = null;

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid settings data' });
        });

        it('should create new settings if they do not exist', async () => {
            req.body = {
                newSetting: 'value'
            };

            const mockSetting = {
                key: 'newSetting',
                value: 'value',
                save: jest.fn()
            };

            Settings.findOrCreate.mockResolvedValue([mockSetting, true]);
            Settings.findAll.mockResolvedValue([
                { key: 'newSetting', value: 'value' }
            ]);

            await settingsController.updateSettings(req, res);

            expect(Settings.findOrCreate).toHaveBeenCalledWith({
                where: { key: 'newSetting' },
                defaults: { value: 'value' }
            });
            expect(res.json).toHaveBeenCalledWith({
                newSetting: 'value'
            });
        });

        it('should handle errors', async () => {
            req.body = { siteTitle: 'Test' };
            Settings.findOrCreate.mockRejectedValue(new Error('Database error'));

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
});
