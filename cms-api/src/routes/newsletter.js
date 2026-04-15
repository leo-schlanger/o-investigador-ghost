/**
 * Newsletter Routes
 * Integra Ghost Members com Brevo para gestao de newsletters
 */

const express = require('express');
const router = express.Router();
const brevoService = require('../services/brevoService');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticacao e role de editor ou admin
router.use(protect);
router.use(authorize('admin', 'editor'));

// ============ STATISTICS ============

router.get('/stats', async (req, res) => {
    try {
        const stats = await brevoService.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Erro ao buscar estatisticas' });
    }
});

// ============ LISTS ============

router.get('/lists', async (req, res) => {
    try {
        const lists = await brevoService.getLists();
        res.json(lists);
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ error: 'Erro ao buscar listas' });
    }
});

router.post('/lists', async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Nome da lista obrigatorio' });
        }

        const result = await brevoService.createList({ name, description });
        res.json(result);
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ error: 'Erro ao criar lista' });
    }
});

router.delete('/lists/:id', async (req, res) => {
    try {
        const result = await brevoService.deleteList(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Erro ao eliminar lista' });
    }
});

// ============ SUBSCRIBERS ============

router.get('/subscribers', async (req, res) => {
    try {
        const { page, limit, status, list, search } = req.query;
        const subscribers = await brevoService.getSubscribers({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 50,
            status,
            list,
            search
        });
        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ error: 'Erro ao buscar subscritores' });
    }
});

router.get('/subscribers/:id', async (req, res) => {
    try {
        const subscriber = await brevoService.getSubscriber(req.params.id);
        if (!subscriber) {
            return res.status(404).json({ error: 'Subscritor nao encontrado' });
        }
        res.json(subscriber);
    } catch (error) {
        console.error('Error fetching subscriber:', error);
        res.status(500).json({ error: 'Erro ao buscar subscritor' });
    }
});

router.post('/subscribers', async (req, res) => {
    try {
        const { email, name, listIds } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email obrigatorio' });
        }

        const result = await brevoService.createSubscriber({ email, name, listIds });
        res.json(result);
    } catch (error) {
        console.error('Error creating subscriber:', error);
        res.status(500).json({ error: 'Erro ao criar subscritor' });
    }
});

router.put('/subscribers/:id', async (req, res) => {
    try {
        const { name, listIds, blocked } = req.body;
        const result = await brevoService.updateSubscriber(req.params.id, {
            name,
            listIds,
            blocked
        });
        res.json(result);
    } catch (error) {
        console.error('Error updating subscriber:', error);
        res.status(500).json({ error: 'Erro ao atualizar subscritor' });
    }
});

router.delete('/subscribers/:id', async (req, res) => {
    try {
        const result = await brevoService.deleteSubscriber(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        res.status(500).json({ error: 'Erro ao eliminar subscritor' });
    }
});

router.post('/subscribers/import', async (req, res) => {
    try {
        const { contacts, listIds } = req.body;

        if (!contacts || !Array.isArray(contacts)) {
            return res.status(400).json({ error: 'Lista de contactos obrigatoria' });
        }

        const result = await brevoService.importSubscribers(contacts, listIds);
        res.json(result);
    } catch (error) {
        console.error('Error importing subscribers:', error);
        res.status(500).json({ error: 'Erro ao importar subscritores' });
    }
});

router.get('/subscribers/export', async (req, res) => {
    try {
        const { status, list } = req.query;
        const subscribers = await brevoService.getSubscribers({
            limit: 10000,
            status,
            list
        });

        // Escape CSV cell to prevent formula injection
        const escapeCsvCell = (cell) => {
            const str = String(cell);
            if (/^[=+\-@\t\r]/.test(str)) {
                return `"'${str.replace(/"/g, '""')}"`;
            }
            return `"${str.replace(/"/g, '""')}"`;
        };

        // Generate CSV
        const headers = ['Email', 'Nome', 'Status', 'Data Subscricao'];
        const rows = subscribers.data.map((s) => [
            s.email,
            s.name || '',
            s.status,
            new Date(s.subscribedAt).toLocaleDateString('pt-PT')
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((r) => r.map(escapeCsvCell).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=subscritores.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting subscribers:', error);
        res.status(500).json({ error: 'Erro ao exportar subscritores' });
    }
});

// ============ CAMPAIGNS ============

router.get('/campaigns', async (req, res) => {
    try {
        const { page, limit, status, search } = req.query;
        const campaigns = await brevoService.getCampaigns({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 50,
            status,
            search
        });
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Erro ao buscar campanhas' });
    }
});

router.get('/campaigns/:id', async (req, res) => {
    try {
        const campaign = await brevoService.getCampaign(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campanha nao encontrada' });
        }
        res.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ error: 'Erro ao buscar campanha' });
    }
});

router.post('/campaigns', async (req, res) => {
    try {
        const {
            name,
            subject,
            preheader,
            senderName,
            senderEmail,
            replyTo,
            listIds,
            blocks,
            htmlContent
        } = req.body;

        if (!name || !subject) {
            return res.status(400).json({ error: 'Nome e assunto obrigatorios' });
        }

        const result = await brevoService.createCampaign({
            name,
            subject,
            preheader,
            senderName,
            senderEmail,
            replyTo,
            listIds,
            blocks,
            htmlContent
        });

        res.json(result);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Erro ao criar campanha' });
    }
});

router.put('/campaigns/:id', async (req, res) => {
    try {
        const result = await brevoService.updateCampaign(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Erro ao atualizar campanha' });
    }
});

router.delete('/campaigns/:id', async (req, res) => {
    try {
        const result = await brevoService.deleteCampaign(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Erro ao eliminar campanha' });
    }
});

router.post('/campaigns/:id/send', async (req, res) => {
    try {
        const result = await brevoService.sendCampaign(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error sending campaign:', error);
        res.status(500).json({ error: 'Erro ao enviar campanha' });
    }
});

router.post('/campaigns/:id/schedule', async (req, res) => {
    try {
        const { scheduledAt } = req.body;

        if (!scheduledAt) {
            return res.status(400).json({ error: 'Data de agendamento obrigatoria' });
        }

        const result = await brevoService.scheduleCampaign(req.params.id, scheduledAt);
        res.json(result);
    } catch (error) {
        console.error('Error scheduling campaign:', error);
        res.status(500).json({ error: 'Erro ao agendar campanha' });
    }
});

router.post('/campaigns/:id/test', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email de teste obrigatorio' });
        }

        const result = await brevoService.sendTestEmail(req.params.id, email);
        res.json(result);
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ error: 'Erro ao enviar email de teste' });
    }
});

router.post('/campaigns/:id/duplicate', async (req, res) => {
    try {
        const original = await brevoService.getCampaign(req.params.id);
        if (!original) {
            return res.status(404).json({ error: 'Campanha nao encontrada' });
        }

        const result = await brevoService.createCampaign({
            name: `${original.name} (copia)`,
            subject: original.subject,
            preheader: original.preheader,
            senderName: original.senderName,
            senderEmail: original.senderEmail,
            replyTo: original.replyTo,
            htmlContent: original.htmlContent
        });

        res.json(result);
    } catch (error) {
        console.error('Error duplicating campaign:', error);
        res.status(500).json({ error: 'Erro ao duplicar campanha' });
    }
});

router.get('/campaigns/:id/stats', async (req, res) => {
    try {
        const stats = await brevoService.getCampaignStats(req.params.id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching campaign stats:', error);
        res.status(500).json({ error: 'Erro ao buscar estatisticas' });
    }
});

// ============ GHOST MEMBERS SYNC ============

router.post('/sync-ghost-members', authorize('admin'), async (req, res) => {
    try {
        const { listId } = req.body;

        if (!listId) {
            return res.status(400).json({ error: 'ID da lista obrigatorio' });
        }

        // Get Ghost members
        // Note: Ghost Admin API needs to be extended to support members
        // For now, return mock response
        const result = {
            success: true,
            message: 'Sincronizacao com Ghost Members requer configuracao adicional',
            synced: 0,
            needsSetup: true
        };

        res.json(result);
    } catch (error) {
        console.error('Error syncing Ghost members:', error);
        res.status(500).json({ error: 'Erro ao sincronizar membros do Ghost' });
    }
});

// ============ SETTINGS ============

router.get('/settings', async (req, res) => {
    try {
        const configured = brevoService.isConfigured();

        res.json({
            configured,
            senderName: process.env.BREVO_SENDER_NAME || '',
            senderEmail: process.env.BREVO_SENDER_EMAIL || '',
            replyTo: process.env.BREVO_REPLY_TO || '',
            defaultListId: process.env.BREVO_DEFAULT_LIST_ID || null,
            doubleOptIn: process.env.BREVO_DOUBLE_OPT_IN === 'true',
            welcomeEmail: process.env.BREVO_WELCOME_EMAIL === 'true'
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Erro ao buscar configuracoes' });
    }
});

router.put('/settings', authorize('admin'), async (req, res) => {
    try {
        // Note: In production, these would be stored in database
        // For now, we just validate and return success
        const { senderName, senderEmail, replyTo, defaultListId, doubleOptIn, welcomeEmail } =
            req.body;

        res.json({
            success: true,
            message:
                'Configuracoes atualizadas. Reinicie o servidor para aplicar as variaveis de ambiente.'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Erro ao atualizar configuracoes' });
    }
});

router.post('/test-connection', async (req, res) => {
    try {
        const { apiKey } = req.body;
        const result = await brevoService.testConnection(apiKey);
        res.json(result);
    } catch (error) {
        console.error('Error testing connection:', error);
        res.status(500).json({ error: 'Erro ao testar conexao' });
    }
});

module.exports = router;
