/**
 * Email Service - SendGrid Integration
 * Handles sending contact form emails
 */

const logger = require('../utils/logger');

// Check if SendGrid is available (optional dependency)
let sgMail = null;
try {
    sgMail = require('@sendgrid/mail');
} catch (e) {
    logger.warn('SendGrid not installed. Email features will be disabled.');
}

/**
 * Initialize SendGrid with API key
 */
function initializeSendGrid() {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        logger.warn('SENDGRID_API_KEY not configured. Email sending disabled.');
        return false;
    }

    if (!sgMail) {
        logger.warn('SendGrid package not installed. Run: npm install @sendgrid/mail');
        return false;
    }

    sgMail.setApiKey(apiKey);
    return true;
}

/**
 * Get recipient email for contact form
 * Falls back to ADMIN_EMAIL if CONTACT_EMAIL not set
 */
function getContactEmail() {
    return process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || null;
}

/**
 * Get sender email address
 * SendGrid requires verified sender
 */
function getSenderEmail() {
    return (
        process.env.SENDGRID_FROM_EMAIL || process.env.CONTACT_EMAIL || 'noreply@oinvestigador.com'
    );
}

/**
 * Generate HTML email template for contact form
 */
function generateContactEmailHtml({ name, email, subject, message }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova mensagem de contato</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #1a365d;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        .field {
            margin-bottom: 20px;
        }
        .label {
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .value {
            background: white;
            padding: 12px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        .message-box {
            background: white;
            padding: 20px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Nova Mensagem de Contato</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">O Investigador</p>
    </div>
    <div class="content">
        <div class="field">
            <div class="label">Nome</div>
            <div class="value">${escapeHtml(name)}</div>
        </div>
        <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
        </div>
        <div class="field">
            <div class="label">Assunto</div>
            <div class="value">${escapeHtml(subject)}</div>
        </div>
        <div class="field">
            <div class="label">Mensagem</div>
            <div class="message-box">${escapeHtml(message)}</div>
        </div>
    </div>
    <div class="footer">
        Enviado via formulario de contato do site O Investigador<br>
        ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
    </div>
</body>
</html>
    `;
}

/**
 * Escape HTML to prevent XSS in email
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Send contact form email
 * @param {Object} data - Contact form data
 * @param {string} data.name - Sender's name
 * @param {string} data.email - Sender's email
 * @param {string} data.subject - Message subject
 * @param {string} data.message - Message content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendContactEmail({ name, email, subject, message }) {
    // Check if SendGrid is configured
    if (!sgMail) {
        return {
            success: false,
            error: 'Email service not available'
        };
    }

    if (!process.env.SENDGRID_API_KEY) {
        return {
            success: false,
            error: 'SendGrid API key not configured'
        };
    }

    const toEmail = getContactEmail();
    if (!toEmail) {
        return {
            success: false,
            error: 'Recipient email not configured'
        };
    }

    const fromEmail = getSenderEmail();

    const msg = {
        to: toEmail,
        from: {
            email: fromEmail,
            name: 'O Investigador - Contato'
        },
        replyTo: {
            email: email,
            name: name
        },
        subject: `[Contato] ${subject}`,
        text: `Nome: ${name}\nEmail: ${email}\nAssunto: ${subject}\n\nMensagem:\n${message}`,
        html: generateContactEmailHtml({ name, email, subject, message })
    };

    try {
        const [response] = await sgMail.send(msg);
        return {
            success: true,
            messageId: response.headers['x-message-id']
        };
    } catch (error) {
        logger.error('SendGrid error', { error: error.message });

        // Extract meaningful error message
        let errorMessage = 'Failed to send email';
        if (error.response) {
            const { body } = error.response;
            if (body && body.errors && body.errors.length > 0) {
                errorMessage = body.errors.map((e) => e.message).join(', ');
            }
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Check if email service is properly configured
 * @returns {Object} Configuration status
 */
function getEmailServiceStatus() {
    return {
        sendgridInstalled: !!sgMail,
        apiKeyConfigured: !!process.env.SENDGRID_API_KEY,
        recipientConfigured: !!getContactEmail(),
        senderEmail: getSenderEmail(),
        recipientEmail: getContactEmail()
    };
}

module.exports = {
    initializeSendGrid,
    sendContactEmail,
    getEmailServiceStatus,
    getContactEmail,
    getSenderEmail
};
