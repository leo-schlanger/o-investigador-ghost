/**
 * Contact Controller
 * Handles contact form submissions
 */

const Joi = require('joi');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Validation schema for contact form
const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no maximo 100 caracteres',
        'any.required': 'Nome e obrigatorio'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email invalido',
        'any.required': 'Email e obrigatorio'
    }),
    subject: Joi.string().min(3).max(200).required().messages({
        'string.min': 'Assunto deve ter pelo menos 3 caracteres',
        'string.max': 'Assunto deve ter no maximo 200 caracteres',
        'any.required': 'Assunto e obrigatorio'
    }),
    message: Joi.string().min(10).max(5000).required().messages({
        'string.min': 'Mensagem deve ter pelo menos 10 caracteres',
        'string.max': 'Mensagem deve ter no maximo 5000 caracteres',
        'any.required': 'Mensagem e obrigatoria'
    }),
    // Honeypot field - should be empty
    website: Joi.string().allow('').max(0).messages({
        'string.max': 'Invalid submission'
    })
});

/**
 * Handle contact form submission
 */
async function submitContact(req, res) {
    try {
        // Validate input
        const { error, value } = contactSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map((d) => ({
                field: d.path[0],
                message: d.message
            }));
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors
            });
        }

        // Check honeypot (anti-spam)
        if (value.website && value.website.length > 0) {
            // Silently reject spam but return success to not reveal detection
            console.log('Honeypot triggered - spam detected');
            return res.json({
                success: true,
                message: 'Mensagem enviada com sucesso!'
            });
        }

        const { name, email, subject, message } = value;

        // Attempt to send email
        const result = await emailService.sendContactEmail({
            name,
            email,
            subject,
            message
        });

        if (!result.success) {
            logger.error('Email send failed:', result.error);

            // Check if it's a configuration issue
            const status = emailService.getEmailServiceStatus();
            if (!status.apiKeyConfigured || !status.recipientConfigured) {
                // Log the message for manual handling
                console.log('Contact form submission (email not configured):');
                console.log({ name, email, subject, message: message.substring(0, 100) + '...' });

                // Still return success to user - message is logged
                return res.json({
                    success: true,
                    message: 'Mensagem recebida! Entraremos em contato em breve.'
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Falha ao enviar mensagem. Tente novamente mais tarde.'
            });
        }

        // Success
        res.json({
            success: true,
            message: 'Mensagem enviada com sucesso! Responderemos em breve.',
            messageId: result.messageId
        });
    } catch (err) {
        logger.error('Contact submission error:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno. Tente novamente mais tarde.'
        });
    }
}

/**
 * Get email service status (for admin debugging)
 */
function getStatus(req, res) {
    const status = emailService.getEmailServiceStatus();
    res.json({
        configured: status.apiKeyConfigured && status.recipientConfigured,
        details: {
            sendgridInstalled: status.sendgridInstalled,
            apiKeyConfigured: status.apiKeyConfigured,
            recipientConfigured: status.recipientConfigured
        }
    });
}

module.exports = {
    submitContact,
    getStatus
};
