/**
 * Brevo (ex-Sendinblue) Newsletter Service
 * Integra com Ghost Members e gerencia campanhas de newsletter
 */

let SibApiV3Sdk = null;

// Tentar importar o SDK do Brevo (graceful degradation)
try {
    SibApiV3Sdk = require('@getbrevo/brevo');
} catch (e) {
    console.warn('Brevo SDK not installed. Newsletter features will be in demo mode.');
    console.warn('To enable: npm install @getbrevo/brevo');
}

class BrevoService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        this.configured = false;
        this.contactsApi = null;
        this.emailCampaignsApi = null;
        this.transactionalApi = null;
        this.sendersApi = null;

        if (SibApiV3Sdk && this.apiKey) {
            this.init();
        }
    }

    init() {
        try {
            const defaultClient = SibApiV3Sdk.ApiClient.instance;
            const apiKeyAuth = defaultClient.authentications['api-key'];
            apiKeyAuth.apiKey = this.apiKey;

            this.contactsApi = new SibApiV3Sdk.ContactsApi();
            this.emailCampaignsApi = new SibApiV3Sdk.EmailCampaignsApi();
            this.transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();
            this.sendersApi = new SibApiV3Sdk.SendersApi();
            this.configured = true;

            console.log('Brevo service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Brevo service:', error.message);
            this.configured = false;
        }
    }

    isConfigured() {
        return this.configured;
    }

    // ============ CONNECTION TEST ============

    async testConnection(apiKey = null) {
        if (!SibApiV3Sdk) {
            return { success: false, message: 'Brevo SDK nao instalado' };
        }

        try {
            const testClient = SibApiV3Sdk.ApiClient.instance;
            const apiKeyAuth = testClient.authentications['api-key'];
            apiKeyAuth.apiKey = apiKey || this.apiKey;

            const accountApi = new SibApiV3Sdk.AccountApi();
            const account = await accountApi.getAccount();

            return {
                success: true,
                message: 'Conexao estabelecida',
                account: {
                    email: account.email,
                    companyName: account.companyName,
                    plan: account.plan?.[0]?.type || 'free'
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.body?.message || 'Erro de conexao'
            };
        }
    }

    // ============ LISTS MANAGEMENT ============

    async getLists() {
        if (!this.configured) {
            return this.getMockLists();
        }

        try {
            const result = await this.contactsApi.getLists({ limit: 50, offset: 0 });
            return {
                data: result.lists.map(list => ({
                    id: list.id,
                    name: list.name,
                    subscribers: list.totalSubscribers,
                    description: list.folderId ? `Folder: ${list.folderId}` : ''
                })),
                total: result.count
            };
        } catch (error) {
            console.error('Error fetching lists:', error);
            throw error;
        }
    }

    async createList(data) {
        if (!this.configured) {
            return { success: true, id: Date.now(), isMock: true };
        }

        try {
            const createList = new SibApiV3Sdk.CreateList();
            createList.name = data.name;
            createList.folderId = data.folderId || 1;

            const result = await this.contactsApi.createList(createList);
            return { success: true, id: result.id };
        } catch (error) {
            console.error('Error creating list:', error);
            throw error;
        }
    }

    async deleteList(id) {
        if (!this.configured) {
            return { success: true, isMock: true };
        }

        try {
            await this.contactsApi.deleteList(id);
            return { success: true };
        } catch (error) {
            console.error('Error deleting list:', error);
            throw error;
        }
    }

    // ============ SUBSCRIBERS/CONTACTS ============

    async getSubscribers(params = {}) {
        if (!this.configured) {
            return this.getMockSubscribers(params);
        }

        try {
            const options = {
                limit: params.limit || 50,
                offset: ((params.page || 1) - 1) * (params.limit || 50)
            };

            if (params.list) {
                options.listIds = [parseInt(params.list)];
            }

            const result = await this.contactsApi.getContacts(options);

            return {
                data: result.contacts.map(contact => ({
                    id: contact.id,
                    email: contact.email,
                    name: contact.attributes?.NOME || contact.attributes?.FIRSTNAME || '',
                    status: contact.emailBlacklisted ? 'blocked' : 'active',
                    lists: contact.listIds || [],
                    subscribedAt: contact.createdAt,
                    modifiedAt: contact.modifiedAt
                })),
                total: result.count,
                page: params.page || 1,
                limit: params.limit || 50
            };
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            throw error;
        }
    }

    async getSubscriber(identifier) {
        if (!this.configured) {
            return null;
        }

        try {
            const contact = await this.contactsApi.getContactInfo(identifier);
            return {
                id: contact.id,
                email: contact.email,
                name: contact.attributes?.NOME || contact.attributes?.FIRSTNAME || '',
                status: contact.emailBlacklisted ? 'blocked' : 'active',
                lists: contact.listIds || [],
                subscribedAt: contact.createdAt
            };
        } catch (error) {
            if (error.status === 404) return null;
            throw error;
        }
    }

    async createSubscriber(data) {
        if (!this.configured) {
            return { success: true, isMock: true };
        }

        try {
            const createContact = new SibApiV3Sdk.CreateContact();
            createContact.email = data.email;
            createContact.attributes = {
                NOME: data.name || '',
                FIRSTNAME: data.name?.split(' ')[0] || '',
                LASTNAME: data.name?.split(' ').slice(1).join(' ') || ''
            };

            if (data.listIds && data.listIds.length > 0) {
                createContact.listIds = data.listIds.map(id => parseInt(id));
            }

            createContact.updateEnabled = true;

            const result = await this.contactsApi.createContact(createContact);
            return { success: true, id: result.id };
        } catch (error) {
            console.error('Error creating subscriber:', error);
            throw error;
        }
    }

    async updateSubscriber(identifier, data) {
        if (!this.configured) {
            return { success: true, isMock: true };
        }

        try {
            const updateContact = new SibApiV3Sdk.UpdateContact();

            if (data.name) {
                updateContact.attributes = {
                    NOME: data.name,
                    FIRSTNAME: data.name.split(' ')[0] || '',
                    LASTNAME: data.name.split(' ').slice(1).join(' ') || ''
                };
            }

            if (data.listIds) {
                updateContact.listIds = data.listIds.map(id => parseInt(id));
            }

            if (data.blocked !== undefined) {
                updateContact.emailBlacklisted = data.blocked;
            }

            await this.contactsApi.updateContact(identifier, updateContact);
            return { success: true };
        } catch (error) {
            console.error('Error updating subscriber:', error);
            throw error;
        }
    }

    async deleteSubscriber(identifier) {
        if (!this.configured) {
            return { success: true, isMock: true };
        }

        try {
            await this.contactsApi.deleteContact(identifier);
            return { success: true };
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            throw error;
        }
    }

    async importSubscribers(contacts, listIds = []) {
        if (!this.configured) {
            return { success: true, imported: 0, isMock: true };
        }

        try {
            const requestContactImport = new SibApiV3Sdk.RequestContactImport();
            requestContactImport.jsonBody = contacts.map(c => ({
                email: c.email,
                attributes: { NOME: c.name || '' }
            }));

            if (listIds.length > 0) {
                requestContactImport.listIds = listIds.map(id => parseInt(id));
            }

            await this.contactsApi.importContacts(requestContactImport);
            return { success: true, imported: contacts.length };
        } catch (error) {
            console.error('Error importing subscribers:', error);
            throw error;
        }
    }

    // ============ CAMPAIGNS ============

    async getCampaigns(params = {}) {
        if (!this.configured) {
            return this.getMockCampaigns(params);
        }

        try {
            const options = {
                limit: params.limit || 50,
                offset: ((params.page || 1) - 1) * (params.limit || 50)
            };

            if (params.status && params.status !== 'all') {
                options.status = params.status;
            }

            const result = await this.emailCampaignsApi.getEmailCampaigns(options);

            return {
                data: result.campaigns.map(campaign => ({
                    id: campaign.id,
                    name: campaign.name,
                    subject: campaign.subject,
                    status: campaign.status,
                    sentAt: campaign.sentDate,
                    scheduledAt: campaign.scheduledAt,
                    createdAt: campaign.createdAt,
                    recipients: campaign.statistics?.sent || 0,
                    opens: campaign.statistics?.uniqueOpens || 0,
                    clicks: campaign.statistics?.uniqueClicks || 0,
                    openRate: campaign.statistics?.sent > 0
                        ? ((campaign.statistics?.uniqueOpens || 0) / campaign.statistics.sent * 100)
                        : 0,
                    clickRate: campaign.statistics?.sent > 0
                        ? ((campaign.statistics?.uniqueClicks || 0) / campaign.statistics.sent * 100)
                        : 0
                })),
                total: result.count
            };
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            throw error;
        }
    }

    async getCampaign(id) {
        if (!this.configured) {
            return this.getMockCampaign(id);
        }

        try {
            const campaign = await this.emailCampaignsApi.getEmailCampaign(id);
            return {
                id: campaign.id,
                name: campaign.name,
                subject: campaign.subject,
                preheader: campaign.previewText,
                status: campaign.status,
                sentAt: campaign.sentDate,
                scheduledAt: campaign.scheduledAt,
                createdAt: campaign.createdAt,
                senderName: campaign.sender?.name,
                senderEmail: campaign.sender?.email,
                replyTo: campaign.replyTo,
                htmlContent: campaign.htmlContent,
                recipients: campaign.recipients,
                statistics: campaign.statistics
            };
        } catch (error) {
            if (error.status === 404) return null;
            throw error;
        }
    }

    async createCampaign(data) {
        if (!this.configured) {
            return { success: true, id: Date.now(), isMock: true };
        }

        try {
            const emailCampaign = new SibApiV3Sdk.CreateEmailCampaign();
            emailCampaign.name = data.name;
            emailCampaign.subject = data.subject;
            emailCampaign.previewText = data.preheader || '';
            emailCampaign.sender = {
                name: data.senderName || process.env.BREVO_SENDER_NAME || 'O Investigador',
                email: data.senderEmail || process.env.BREVO_SENDER_EMAIL
            };
            emailCampaign.replyTo = data.replyTo || process.env.BREVO_REPLY_TO;
            emailCampaign.htmlContent = data.htmlContent || this.generateHtmlFromBlocks(data.blocks);

            if (data.listIds && data.listIds.length > 0) {
                emailCampaign.recipients = {
                    listIds: data.listIds.map(id => parseInt(id))
                };
            }

            const result = await this.emailCampaignsApi.createEmailCampaign(emailCampaign);
            return { success: true, id: result.id };
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    }

    async updateCampaign(id, data) {
        if (!this.configured) {
            return { success: true, isMock: true };
        }

        try {
            const updateCampaign = new SibApiV3Sdk.UpdateEmailCampaign();

            if (data.name) updateCampaign.name = data.name;
            if (data.subject) updateCampaign.subject = data.subject;
            if (data.preheader) updateCampaign.previewText = data.preheader;
            if (data.htmlContent || data.blocks) {
                updateCampaign.htmlContent = data.htmlContent || this.generateHtmlFromBlocks(data.blocks);
            }
            if (data.senderName || data.senderEmail) {
                updateCampaign.sender = {
                    name: data.senderName,
                    email: data.senderEmail
                };
            }
            if (data.replyTo) updateCampaign.replyTo = data.replyTo;
            if (data.listIds) {
                updateCampaign.recipients = {
                    listIds: data.listIds.map(id => parseInt(id))
                };
            }

            await this.emailCampaignsApi.updateEmailCampaign(id, updateCampaign);
            return { success: true };
        } catch (error) {
            console.error('Error updating campaign:', error);
            throw error;
        }
    }

    async deleteCampaign(id) {
        if (!this.configured) {
            return { success: true, isMock: true };
        }

        try {
            await this.emailCampaignsApi.deleteEmailCampaign(id);
            return { success: true };
        } catch (error) {
            console.error('Error deleting campaign:', error);
            throw error;
        }
    }

    async sendCampaign(id) {
        if (!this.configured) {
            return {
                success: false,
                message: 'Brevo nao configurado. Configure a API key nas configuracoes.',
                isMock: true
            };
        }

        try {
            await this.emailCampaignsApi.sendEmailCampaignNow(id);
            return { success: true };
        } catch (error) {
            console.error('Error sending campaign:', error);
            throw error;
        }
    }

    async scheduleCampaign(id, scheduledAt) {
        if (!this.configured) {
            return { success: true, isMock: true };
        }

        try {
            const scheduleData = new SibApiV3Sdk.ScheduleSmtpEmail();
            scheduleData.scheduledAt = new Date(scheduledAt).toISOString();

            await this.emailCampaignsApi.scheduleEmailCampaign(id, scheduleData);
            return { success: true };
        } catch (error) {
            console.error('Error scheduling campaign:', error);
            throw error;
        }
    }

    async sendTestEmail(id, testEmail) {
        if (!this.configured) {
            return {
                success: false,
                message: 'Brevo nao configurado.',
                isMock: true
            };
        }

        try {
            const testData = new SibApiV3Sdk.SendTestEmail();
            testData.emailTo = [testEmail];

            await this.emailCampaignsApi.sendTestEmail(id, testData);
            return { success: true };
        } catch (error) {
            console.error('Error sending test email:', error);
            throw error;
        }
    }

    async getCampaignStats(id) {
        if (!this.configured) {
            return this.getMockCampaignStats(id);
        }

        try {
            const campaign = await this.emailCampaignsApi.getEmailCampaign(id, { statistics: 'globalStats' });
            const stats = campaign.statistics?.globalStats || {};

            return {
                sent: stats.sent || 0,
                delivered: stats.delivered || 0,
                opens: stats.uniqueOpens || 0,
                clicks: stats.uniqueClicks || 0,
                bounces: stats.hardBounces + stats.softBounces || 0,
                unsubscribes: stats.unsubscriptions || 0,
                complaints: stats.complaints || 0,
                openRate: stats.sent > 0 ? (stats.uniqueOpens / stats.sent * 100) : 0,
                clickRate: stats.sent > 0 ? (stats.uniqueClicks / stats.sent * 100) : 0
            };
        } catch (error) {
            console.error('Error fetching campaign stats:', error);
            throw error;
        }
    }

    // ============ GHOST MEMBERS SYNC ============

    async syncGhostMembers(ghostMembers, listId) {
        if (!this.configured) {
            return { success: true, synced: 0, isMock: true };
        }

        try {
            const contacts = ghostMembers.map(member => ({
                email: member.email,
                name: member.name || ''
            }));

            const result = await this.importSubscribers(contacts, [listId]);
            return { success: true, synced: contacts.length };
        } catch (error) {
            console.error('Error syncing Ghost members:', error);
            throw error;
        }
    }

    // ============ STATISTICS ============

    async getStats() {
        if (!this.configured) {
            return this.getMockStats();
        }

        try {
            // Get contacts count
            const contacts = await this.contactsApi.getContacts({ limit: 1 });

            // Get recent campaigns
            const campaigns = await this.emailCampaignsApi.getEmailCampaigns({
                limit: 10,
                status: 'sent'
            });

            let totalOpens = 0;
            let totalClicks = 0;
            let totalSent = 0;

            campaigns.campaigns.forEach(c => {
                if (c.statistics) {
                    totalOpens += c.statistics.uniqueOpens || 0;
                    totalClicks += c.statistics.uniqueClicks || 0;
                    totalSent += c.statistics.sent || 0;
                }
            });

            return {
                totalSubscribers: contacts.count,
                activeSubscribers: contacts.count, // Brevo doesn't give this directly
                totalCampaigns: campaigns.count,
                avgOpenRate: totalSent > 0 ? (totalOpens / totalSent * 100) : 0,
                avgClickRate: totalSent > 0 ? (totalClicks / totalSent * 100) : 0,
                lastCampaignDate: campaigns.campaigns[0]?.sentDate || null
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }

    // ============ HTML GENERATION ============

    generateHtmlFromBlocks(blocks = []) {
        // Cores do projeto
        const colors = {
            brand: '#0d345e',
            brandLight: '#1a4f8a',
            brandDark: '#071d38',
            accent: '#c0392b',
            text: '#1a1a1a',
            textMuted: '#666666',
            bgLight: '#f8f9fa',
            border: '#e5e7eb'
        };

        let html = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter O Investigador</title>
</head>
<body style="margin:0;padding:0;background-color:#e5e7eb;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e5e7eb;">
        <tr>
            <td align="center" style="padding:20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;max-width:600px;">
`;

        blocks.forEach(block => {
            html += this.renderBlockToHtml(block, colors);
        });

        html += `
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        return html;
    }

    renderBlockToHtml(block, colors) {
        switch (block.type) {
            case 'header':
                return `
                    <tr>
                        <td style="background-color:${colors.brandDark};padding:24px 32px;text-align:center;">
                            <h1 style="font-family:Georgia,serif;color:#ffffff;font-size:32px;margin:0;text-transform:uppercase;">
                                ${block.content?.siteName || 'O Investigador'}
                            </h1>
                            <p style="color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:3px;margin:4px 0 0 0;">
                                ${block.content?.tagline || 'Jornal Online'}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:${colors.accent};height:4px;"></td>
                    </tr>`;

            case 'hero':
                return `
                    <tr>
                        <td style="padding:24px;">
                            ${block.content?.category ? `
                                <span style="background-color:${colors.accent};color:#ffffff;font-size:11px;font-weight:bold;padding:4px 12px;text-transform:uppercase;">
                                    ${block.content.category}
                                </span>
                            ` : ''}
                            <h2 style="font-family:Georgia,serif;font-size:28px;color:${colors.text};line-height:1.2;margin:12px 0;">
                                ${block.content?.title || 'Titulo da Noticia'}
                            </h2>
                            ${block.content?.imageUrl ? `
                                <img src="${block.content.imageUrl}" alt="" style="width:100%;height:auto;display:block;margin-bottom:16px;border-radius:4px;">
                            ` : ''}
                            <p style="font-size:16px;color:${colors.textMuted};line-height:1.6;margin:0 0 20px 0;">
                                ${block.content?.excerpt || ''}
                            </p>
                            ${block.content?.link ? `
                                <a href="${block.content.link}" style="display:inline-block;background-color:${colors.brand};color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:4px;text-transform:uppercase;">
                                    Ler Artigo Completo
                                </a>
                            ` : ''}
                        </td>
                    </tr>`;

            case 'article':
                return `
                    <tr>
                        <td style="padding:12px 24px;border-bottom:1px solid ${colors.border};">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="120" valign="top" style="padding-right:16px;">
                                        ${block.content?.imageUrl ? `
                                            <img src="${block.content.imageUrl}" alt="" style="width:120px;height:80px;object-fit:cover;border-radius:4px;">
                                        ` : `
                                            <div style="width:120px;height:80px;background-color:${colors.bgLight};border-radius:4px;"></div>
                                        `}
                                    </td>
                                    <td valign="top">
                                        ${block.content?.category ? `
                                            <span style="color:${colors.accent};font-size:11px;font-weight:bold;text-transform:uppercase;">
                                                ${block.content.category}
                                            </span>
                                        ` : ''}
                                        <h3 style="font-family:Georgia,serif;font-size:16px;color:${colors.text};margin:4px 0 8px 0;line-height:1.3;">
                                            <a href="${block.content?.link || '#'}" style="color:${colors.text};text-decoration:none;">
                                                ${block.content?.title || 'Titulo do Artigo'}
                                            </a>
                                        </h3>
                                        <p style="font-size:14px;color:${colors.textMuted};margin:0;line-height:1.4;">
                                            ${block.content?.excerpt || ''}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`;

            case 'text':
                return `
                    <tr>
                        <td style="padding:24px;">
                            <p style="font-size:16px;color:${colors.text};line-height:1.7;margin:0;">
                                ${block.content?.content || ''}
                            </p>
                        </td>
                    </tr>`;

            case 'quote':
                return `
                    <tr>
                        <td style="padding:24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-left:4px solid ${colors.accent};padding:20px;background-color:${colors.bgLight};">
                                        <p style="font-family:Georgia,serif;font-size:18px;font-style:italic;color:${colors.text};line-height:1.5;margin:0 0 12px 0;">
                                            "${block.content?.text || ''}"
                                        </p>
                                        ${block.content?.author ? `
                                            <p style="font-size:14px;color:${colors.textMuted};margin:0;">
                                                — ${block.content.author}
                                            </p>
                                        ` : ''}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`;

            case 'button':
                const btnStyle = block.content?.style === 'outline'
                    ? `background-color:transparent;color:${colors.brand};border:2px solid ${colors.brand};`
                    : `background-color:${colors.brand};color:#ffffff;border:none;`;
                return `
                    <tr>
                        <td align="center" style="padding:24px;">
                            <a href="${block.content?.url || '#'}" style="display:inline-block;${btnStyle}font-size:14px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:4px;text-transform:uppercase;">
                                ${block.content?.text || 'Ver Mais'}
                            </a>
                        </td>
                    </tr>`;

            case 'divider':
                return `
                    <tr>
                        <td style="padding:8px 24px;">
                            <hr style="border:none;border-top:1px solid ${colors.border};margin:0;">
                        </td>
                    </tr>`;

            case 'footer':
                return `
                    <tr>
                        <td style="background-color:${colors.brand};padding:16px;text-align:center;">
                            <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">
                                Siga-nos nas redes sociais
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:${colors.brandDark};padding:32px;text-align:center;">
                            <h2 style="font-family:Georgia,serif;color:#ffffff;font-size:24px;margin:0 0 16px 0;">
                                O Investigador
                            </h2>
                            <p style="font-size:12px;color:rgba(255,255,255,0.6);margin:0 0 16px 0;">
                                ${block.content?.copyright || `© ${new Date().getFullYear()} O Investigador`}
                            </p>
                            <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0;">
                                <a href="{{mirror}}" style="color:rgba(255,255,255,0.7);text-decoration:underline;">Ver no browser</a> |
                                <a href="{{unsubscribe}}" style="color:rgba(255,255,255,0.7);text-decoration:underline;">${block.content?.unsubscribeText || 'Cancelar subscricao'}</a>
                            </p>
                        </td>
                    </tr>`;

            default:
                return '';
        }
    }

    // ============ MOCK DATA ============

    getMockLists() {
        return {
            data: [
                { id: 1, name: 'Geral', subscribers: 1280, description: 'Lista principal de subscritores' },
                { id: 2, name: 'Premium', subscribers: 245, description: 'Subscritores premium' },
                { id: 3, name: 'Alertas', subscribers: 890, description: 'Alertas de noticias urgentes' }
            ],
            total: 3,
            isMock: true
        };
    }

    getMockSubscribers(params = {}) {
        const mockData = [
            { id: 1, email: 'joao.silva@email.pt', name: 'Joao Silva', status: 'active', lists: [1], subscribedAt: '2026-01-15T10:30:00Z' },
            { id: 2, email: 'maria.santos@email.pt', name: 'Maria Santos', status: 'active', lists: [1, 2], subscribedAt: '2026-01-20T14:22:00Z' },
            { id: 3, email: 'pedro.costa@email.pt', name: 'Pedro Costa', status: 'active', lists: [1], subscribedAt: '2026-02-01T09:15:00Z' }
        ];

        return {
            data: mockData,
            total: mockData.length,
            page: params.page || 1,
            limit: params.limit || 50,
            isMock: true
        };
    }

    getMockCampaigns(params = {}) {
        const mockData = [
            { id: 1, name: 'Briefing Semanal', subject: 'As noticias da semana', status: 'sent', sentAt: '2026-03-08T08:00:00Z', recipients: 1250, opens: 487, clicks: 89, openRate: 38.96, clickRate: 7.12 },
            { id: 2, name: 'Alerta Eleicoes', subject: 'URGENTE: Resultados', status: 'sent', sentAt: '2026-03-10T20:30:00Z', recipients: 1250, opens: 892, clicks: 234, openRate: 71.36, clickRate: 18.72 }
        ];

        return {
            data: mockData,
            total: mockData.length,
            isMock: true
        };
    }

    getMockCampaign(id) {
        return {
            id: parseInt(id),
            name: 'Campanha Exemplo',
            subject: 'Assunto da campanha',
            status: 'draft',
            blocks: [],
            isMock: true
        };
    }

    getMockCampaignStats(id) {
        return {
            sent: 1250,
            delivered: 1220,
            opens: 487,
            clicks: 89,
            bounces: 30,
            unsubscribes: 5,
            openRate: 38.96,
            clickRate: 7.12,
            isMock: true
        };
    }

    getMockStats() {
        return {
            totalSubscribers: 1280,
            activeSubscribers: 1215,
            totalCampaigns: 24,
            avgOpenRate: 42.5,
            avgClickRate: 8.3,
            lastCampaignDate: '2026-03-10T20:30:00Z',
            isMock: true
        };
    }
}

// Singleton instance
const brevoService = new BrevoService();

module.exports = brevoService;
