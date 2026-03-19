/**
 * Tests for emailService
 */

// Store original env values
const originalEnv = { ...process.env };

// Import after resetting env
const emailService = require('../emailService');

describe('emailService', () => {
    beforeEach(() => {
        // Reset environment variables before each test
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        // Restore original env
        process.env = originalEnv;
    });

    describe('getContactEmail', () => {
        it('should return CONTACT_EMAIL when set', () => {
            process.env.CONTACT_EMAIL = 'contact@test.com';
            process.env.ADMIN_EMAIL = 'admin@test.com';

            const email = emailService.getContactEmail();

            expect(email).toBe('contact@test.com');
        });

        it('should fall back to ADMIN_EMAIL when CONTACT_EMAIL not set', () => {
            delete process.env.CONTACT_EMAIL;
            process.env.ADMIN_EMAIL = 'admin@test.com';

            const email = emailService.getContactEmail();

            expect(email).toBe('admin@test.com');
        });

        it('should return null when neither is set', () => {
            delete process.env.CONTACT_EMAIL;
            delete process.env.ADMIN_EMAIL;

            const email = emailService.getContactEmail();

            expect(email).toBeNull();
        });
    });

    describe('getSenderEmail', () => {
        it('should return SENDGRID_FROM_EMAIL when set', () => {
            process.env.SENDGRID_FROM_EMAIL = 'sender@test.com';
            process.env.CONTACT_EMAIL = 'contact@test.com';

            const email = emailService.getSenderEmail();

            expect(email).toBe('sender@test.com');
        });

        it('should fall back to CONTACT_EMAIL when SENDGRID_FROM_EMAIL not set', () => {
            delete process.env.SENDGRID_FROM_EMAIL;
            process.env.CONTACT_EMAIL = 'contact@test.com';

            const email = emailService.getSenderEmail();

            expect(email).toBe('contact@test.com');
        });

        it('should return default email when none are set', () => {
            delete process.env.SENDGRID_FROM_EMAIL;
            delete process.env.CONTACT_EMAIL;

            const email = emailService.getSenderEmail();

            expect(email).toBe('noreply@oinvestigador.com');
        });
    });

    describe('getEmailServiceStatus', () => {
        it('should return status object', () => {
            process.env.SENDGRID_API_KEY = 'test-key';
            process.env.CONTACT_EMAIL = 'contact@test.com';
            process.env.SENDGRID_FROM_EMAIL = 'sender@test.com';

            const status = emailService.getEmailServiceStatus();

            expect(status).toHaveProperty('sendgridInstalled');
            expect(status).toHaveProperty('apiKeyConfigured');
            expect(status).toHaveProperty('recipientConfigured');
            expect(status).toHaveProperty('senderEmail');
            expect(status).toHaveProperty('recipientEmail');
            expect(status.apiKeyConfigured).toBe(true);
            expect(status.recipientConfigured).toBe(true);
        });

        it('should show not configured when API key missing', () => {
            delete process.env.SENDGRID_API_KEY;

            const status = emailService.getEmailServiceStatus();

            expect(status.apiKeyConfigured).toBe(false);
        });

        it('should show recipient not configured when no email set', () => {
            delete process.env.CONTACT_EMAIL;
            delete process.env.ADMIN_EMAIL;

            const status = emailService.getEmailServiceStatus();

            expect(status.recipientConfigured).toBe(false);
        });
    });

    describe('initializeSendGrid', () => {
        it('should return false when API key not set', () => {
            delete process.env.SENDGRID_API_KEY;

            const result = emailService.initializeSendGrid();

            expect(result).toBe(false);
        });
    });

    describe('sendContactEmail', () => {
        it('should return error when API key not configured', async () => {
            delete process.env.SENDGRID_API_KEY;

            const result = await emailService.sendContactEmail({
                name: 'John',
                email: 'john@test.com',
                subject: 'Test',
                message: 'Test message'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should return error when recipient not configured', async () => {
            process.env.SENDGRID_API_KEY = 'test-key';
            delete process.env.CONTACT_EMAIL;
            delete process.env.ADMIN_EMAIL;

            const result = await emailService.sendContactEmail({
                name: 'John',
                email: 'john@test.com',
                subject: 'Test',
                message: 'Test message'
            });

            expect(result.success).toBe(false);
        });
    });
});
