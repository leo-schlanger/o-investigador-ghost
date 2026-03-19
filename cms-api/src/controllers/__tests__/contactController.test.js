// Mock the emailService
jest.mock('../../services/emailService', () => ({
    sendContactEmail: jest.fn(),
    getEmailServiceStatus: jest.fn()
}));

const emailService = require('../../services/emailService');
const contactController = require('../contactController');

describe('contactController', () => {
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

    describe('submitContact', () => {
        it('should submit contact form successfully', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@test.com',
                subject: 'Test Subject',
                message: 'This is a test message that is long enough.'
            };

            emailService.sendContactEmail.mockResolvedValue({
                success: true,
                messageId: 'msg123'
            });

            await contactController.submitContact(req, res);

            expect(emailService.sendContactEmail).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@test.com',
                subject: 'Test Subject',
                message: 'This is a test message that is long enough.'
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Mensagem enviada com sucesso! Responderemos em breve.',
                messageId: 'msg123'
            });
        });

        it('should return validation error for missing name', async () => {
            req.body = {
                email: 'john@test.com',
                subject: 'Test Subject',
                message: 'This is a test message that is long enough.'
            };

            await contactController.submitContact(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Validation failed'
                })
            );
        });

        it('should return validation error for invalid email', async () => {
            req.body = {
                name: 'John Doe',
                email: 'invalid-email',
                subject: 'Test Subject',
                message: 'This is a test message that is long enough.'
            };

            await contactController.submitContact(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return validation error for short subject', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@test.com',
                subject: 'Hi',
                message: 'This is a test message that is long enough.'
            };

            await contactController.submitContact(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return validation error for short message', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@test.com',
                subject: 'Test Subject',
                message: 'Too short'
            };

            await contactController.submitContact(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should reject honeypot trap submissions as validation error', async () => {
            req.body = {
                name: 'Spammer',
                email: 'spam@test.com',
                subject: 'Buy now!!!',
                message: 'This is spam message that is long enough.',
                website: 'http://spam.com'
            };

            await contactController.submitContact(req, res);

            // Honeypot field triggers validation error since website must be empty
            expect(emailService.sendContactEmail).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should handle email service failure when not configured', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@test.com',
                subject: 'Test Subject',
                message: 'This is a test message that is long enough.'
            };

            emailService.sendContactEmail.mockResolvedValue({
                success: false,
                error: 'Not configured'
            });

            emailService.getEmailServiceStatus.mockReturnValue({
                apiKeyConfigured: false,
                recipientConfigured: false
            });

            await contactController.submitContact(req, res);

            // Should still return success (message logged)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Mensagem recebida! Entraremos em contato em breve.'
            });
        });

        it('should handle email service failure when configured', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@test.com',
                subject: 'Test Subject',
                message: 'This is a test message that is long enough.'
            };

            emailService.sendContactEmail.mockResolvedValue({
                success: false,
                error: 'Send failed'
            });

            emailService.getEmailServiceStatus.mockReturnValue({
                apiKeyConfigured: true,
                recipientConfigured: true
            });

            await contactController.submitContact(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Falha ao enviar mensagem. Tente novamente mais tarde.'
            });
        });

        it('should handle internal errors', async () => {
            req.body = {
                name: 'John Doe',
                email: 'john@test.com',
                subject: 'Test Subject',
                message: 'This is a test message that is long enough.'
            };

            emailService.sendContactEmail.mockRejectedValue(new Error('Internal error'));

            await contactController.submitContact(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Erro interno. Tente novamente mais tarde.'
            });
        });
    });

    describe('getStatus', () => {
        it('should return email service status when configured', () => {
            emailService.getEmailServiceStatus.mockReturnValue({
                sendgridInstalled: true,
                apiKeyConfigured: true,
                recipientConfigured: true
            });

            contactController.getStatus(req, res);

            expect(res.json).toHaveBeenCalledWith({
                configured: true,
                details: {
                    sendgridInstalled: true,
                    apiKeyConfigured: true,
                    recipientConfigured: true
                }
            });
        });

        it('should return email service status when not configured', () => {
            emailService.getEmailServiceStatus.mockReturnValue({
                sendgridInstalled: false,
                apiKeyConfigured: false,
                recipientConfigured: false
            });

            contactController.getStatus(req, res);

            expect(res.json).toHaveBeenCalledWith({
                configured: false,
                details: {
                    sendgridInstalled: false,
                    apiKeyConfigured: false,
                    recipientConfigured: false
                }
            });
        });
    });
});
