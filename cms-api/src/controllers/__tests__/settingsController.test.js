// Mock the models
jest.mock('../../models', () => ({
    Settings: {
        findAll: jest.fn(),
        findOrCreate: jest.fn()
    }
}));

// Mock cacheService
jest.mock('../../services/cacheService', () => ({
    wrap: jest.fn((key, fn) => fn()),
    del: jest.fn().mockResolvedValue(true),
    keys: {
        settings: jest.fn(() => 'settings')
    },
    TTL: {
        SETTINGS: 300
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
                success: true,
                data: {
                    siteTitle: 'Test Site',
                    siteDescription: 'A test description'
                }
            });
        });

        it('should return empty object when no settings exist', async () => {
            Settings.findAll.mockResolvedValue([]);

            await settingsController.getSettings(req, res);

            expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
        });

        it('should handle errors', async () => {
            Settings.findAll.mockRejectedValue(new Error('Database error'));

            await settingsController.getSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Database error' } });
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
                success: true,
                data: {
                    siteTitle: 'New Title',
                    siteDescription: 'New Description'
                }
            });
        });

        it('should return 400 for invalid input', async () => {
            req.body = null;

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Invalid settings data' } });
        });

        it('should create new settings if they do not exist', async () => {
            req.body = {
                siteTitle: 'New Title'
            };

            const mockSetting = {
                key: 'siteTitle',
                value: 'New Title',
                save: jest.fn()
            };

            Settings.findOrCreate.mockResolvedValue([mockSetting, true]);
            Settings.findAll.mockResolvedValue([{ key: 'siteTitle', value: 'New Title' }]);

            await settingsController.updateSettings(req, res);

            expect(Settings.findOrCreate).toHaveBeenCalledWith({
                where: { key: 'siteTitle' },
                defaults: { value: 'New Title' }
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    siteTitle: 'New Title'
                }
            });
        });

        it('should handle errors', async () => {
            req.body = { siteTitle: 'Test' };
            Settings.findOrCreate.mockRejectedValue(new Error('Database error'));

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: { message: 'Erro ao salvar configuracoes' } });
        });

        it('should reject non-whitelisted settings', async () => {
            req.body = {
                invalidSetting: 'value'
            };

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false, error: { message: 'Setting "invalidSetting" is not allowed' }
            });
        });

        it('should validate setting value types', async () => {
            req.body = {
                siteTitle: 12345 // Should be string
            };

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false, error: { message: 'Setting "siteTitle" must be a string' }
            });
        });

        it('should validate enum settings', async () => {
            req.body = {
                adsEnabled: 'invalid' // Should be 'true' or 'false'
            };

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false, error: { message: 'Setting "adsEnabled" must be one of: true, false' }
            });
        });

        it('should validate JSON settings', async () => {
            req.body = {
                adSlots: 'not-valid-json{'
            };

            await settingsController.updateSettings(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false, error: { message: 'Setting "adSlots" must be valid JSON' }
            });
        });

        it('should accept valid JSON settings', async () => {
            req.body = {
                adSlots: '{"slot1": "123"}'
            };

            const mockSetting = {
                key: 'adSlots',
                value: '{"slot1": "123"}',
                save: jest.fn()
            };

            Settings.findOrCreate.mockResolvedValue([mockSetting, true]);
            Settings.findAll.mockResolvedValue([{ key: 'adSlots', value: '{"slot1": "123"}' }]);

            await settingsController.updateSettings(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    adSlots: '{"slot1": "123"}'
                }
            });
        });
    });
});
