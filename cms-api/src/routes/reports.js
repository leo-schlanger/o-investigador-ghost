const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { PostView, ViewLog, User, Article } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const ghostApi = require('../services/ghostApi');

// Optional dependencies for exports
let PDFDocument = null;
let ExcelJS = null;
try {
    PDFDocument = require('pdfkit');
} catch (err) {
    console.warn('pdfkit not available, PDF export disabled');
}
try {
    ExcelJS = require('exceljs');
} catch (err) {
    console.warn('exceljs not available, Excel export disabled');
}

// Helper: Get date range
const getDateRange = (period) => {
    const now = new Date();
    let startDate = new Date(0); // Beginning of time

    switch (period) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        case 'all':
        default:
            startDate = new Date(0);
    }

    return startDate;
};

// Helper: Format date for display
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Get available report types
router.get('/types', protect, (req, res) => {
    res.json([
        {
            id: 'views',
            name: 'Visualizacoes',
            description: 'Relatorio de visualizacoes por artigo'
        },
        { id: 'articles', name: 'Artigos', description: 'Relatorio de artigos publicados' },
        {
            id: 'users',
            name: 'Atividade de Usuarios',
            description: 'Relatorio de atividade da equipe'
        }
    ]);
});

// Get report preview data
router.get('/preview/:type', protect, async (req, res) => {
    try {
        const { type } = req.params;
        const { period = 'month' } = req.query;
        const startDate = getDateRange(period);

        let data = [];

        switch (type) {
            case 'views':
                const views = await PostView.findAll({
                    where: {
                        lastViewedAt: { [Op.gte]: startDate }
                    },
                    order: [['viewCount', 'DESC']],
                    limit: 20
                });
                data = views.map((v) => ({
                    title: v.postTitle || 'Sem titulo',
                    views: v.viewCount,
                    lastViewed: formatDate(v.lastViewedAt)
                }));
                break;

            case 'articles':
                const result = await ghostApi.listPosts({ status: 'all', limit: 100 });
                const articles = result.posts.filter((p) => new Date(p.created_at) >= startDate);
                data = articles.map((a) => ({
                    title: a.title,
                    status:
                        a.status === 'published'
                            ? 'Publicado'
                            : a.status === 'scheduled'
                              ? 'Agendado'
                              : 'Rascunho',
                    author: a.primary_author?.name || 'Desconhecido',
                    createdAt: formatDate(a.created_at),
                    publishedAt: a.published_at ? formatDate(a.published_at) : '-'
                }));
                break;

            case 'users':
                const users = await User.findAll({
                    attributes: ['id', 'name', 'email', 'role', 'createdAt', 'lastLogin']
                });
                data = users.map((u) => ({
                    name: u.name,
                    email: u.email,
                    role:
                        u.role === 'admin'
                            ? 'Administrador'
                            : u.role === 'editor'
                              ? 'Editor'
                              : 'Autor',
                    createdAt: formatDate(u.createdAt),
                    lastLogin: u.lastLogin ? formatDate(u.lastLogin) : 'Nunca'
                }));
                break;

            default:
                return res.status(400).json({ error: 'Tipo de relatorio invalido' });
        }

        res.json({
            type,
            period,
            generatedAt: new Date().toISOString(),
            count: data.length,
            data
        });
    } catch (err) {
        console.error('Report preview error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Export report as Excel
router.get('/export/excel/:type', protect, async (req, res) => {
    try {
        if (!ExcelJS) {
            return res.status(503).json({ error: 'Excel export not available' });
        }

        const { type } = req.params;
        const { period = 'month' } = req.query;
        const startDate = getDateRange(period);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'O Investigador';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Relatorio');

        // Style for header
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } },
            alignment: { horizontal: 'center' }
        };

        switch (type) {
            case 'views':
                sheet.columns = [
                    { header: 'Artigo', key: 'title', width: 50 },
                    { header: 'Visualizacoes', key: 'views', width: 15 },
                    { header: 'Ultima Visualizacao', key: 'lastViewed', width: 20 }
                ];

                const views = await PostView.findAll({
                    where: { lastViewedAt: { [Op.gte]: startDate } },
                    order: [['viewCount', 'DESC']]
                });

                views.forEach((v) => {
                    sheet.addRow({
                        title: v.postTitle || 'Sem titulo',
                        views: v.viewCount,
                        lastViewed: formatDate(v.lastViewedAt)
                    });
                });
                break;

            case 'articles':
                sheet.columns = [
                    { header: 'Titulo', key: 'title', width: 50 },
                    { header: 'Status', key: 'status', width: 15 },
                    { header: 'Autor', key: 'author', width: 25 },
                    { header: 'Criado em', key: 'createdAt', width: 15 },
                    { header: 'Publicado em', key: 'publishedAt', width: 15 }
                ];

                const result = await ghostApi.listPosts({ status: 'all', limit: 500 });
                const articles = result.posts.filter((p) => new Date(p.created_at) >= startDate);

                articles.forEach((a) => {
                    sheet.addRow({
                        title: a.title,
                        status:
                            a.status === 'published'
                                ? 'Publicado'
                                : a.status === 'scheduled'
                                  ? 'Agendado'
                                  : 'Rascunho',
                        author: a.primary_author?.name || 'Desconhecido',
                        createdAt: formatDate(a.created_at),
                        publishedAt: a.published_at ? formatDate(a.published_at) : '-'
                    });
                });
                break;

            case 'users':
                sheet.columns = [
                    { header: 'Nome', key: 'name', width: 30 },
                    { header: 'Email', key: 'email', width: 35 },
                    { header: 'Funcao', key: 'role', width: 15 },
                    { header: 'Criado em', key: 'createdAt', width: 15 },
                    { header: 'Ultimo Login', key: 'lastLogin', width: 15 }
                ];

                const users = await User.findAll({
                    attributes: ['id', 'name', 'email', 'role', 'createdAt', 'lastLogin']
                });

                users.forEach((u) => {
                    sheet.addRow({
                        name: u.name,
                        email: u.email,
                        role:
                            u.role === 'admin'
                                ? 'Administrador'
                                : u.role === 'editor'
                                  ? 'Editor'
                                  : 'Autor',
                        createdAt: formatDate(u.createdAt),
                        lastLogin: u.lastLogin ? formatDate(u.lastLogin) : 'Nunca'
                    });
                });
                break;

            default:
                return res.status(400).json({ error: 'Tipo de relatorio invalido' });
        }

        // Apply header style
        sheet.getRow(1).eachCell((cell) => {
            cell.font = headerStyle.font;
            cell.fill = headerStyle.fill;
            cell.alignment = headerStyle.alignment;
        });

        // Set response headers
        const filename = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Excel export error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Export report as PDF
router.get('/export/pdf/:type', protect, async (req, res) => {
    try {
        if (!PDFDocument) {
            return res.status(503).json({ error: 'PDF export not available' });
        }

        const { type } = req.params;
        const { period = 'month' } = req.query;
        const startDate = getDateRange(period);

        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        const filename = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('O Investigador', { align: 'center' });
        doc.fontSize(14)
            .font('Helvetica')
            .text(
                'Relatorio de ' +
                    (type === 'views'
                        ? 'Visualizacoes'
                        : type === 'articles'
                          ? 'Artigos'
                          : type === 'users'
                            ? 'Atividade de Usuarios'
                            : type),
                { align: 'center' }
            );
        doc.fontSize(10).text(`Gerado em: ${formatDate(new Date())}`, { align: 'center' });
        doc.moveDown(2);

        let data = [];

        switch (type) {
            case 'views':
                const views = await PostView.findAll({
                    where: { lastViewedAt: { [Op.gte]: startDate } },
                    order: [['viewCount', 'DESC']],
                    limit: 50
                });

                doc.fontSize(12).font('Helvetica-Bold').text('Top 50 Artigos Mais Vistos');
                doc.moveDown();

                views.forEach((v, index) => {
                    doc.fontSize(10)
                        .font('Helvetica')
                        .text(`${index + 1}. ${v.postTitle || 'Sem titulo'}`)
                        .text(
                            `   Visualizacoes: ${v.viewCount} | Ultima: ${formatDate(v.lastViewedAt)}`,
                            { color: 'gray' }
                        );
                    doc.moveDown(0.5);
                });
                break;

            case 'articles':
                const result = await ghostApi.listPosts({ status: 'all', limit: 500 });
                const articles = result.posts.filter((p) => new Date(p.created_at) >= startDate);

                // Summary
                const published = articles.filter((a) => a.status === 'published').length;
                const draft = articles.filter((a) => a.status === 'draft').length;
                const scheduled = articles.filter((a) => a.status === 'scheduled').length;

                doc.fontSize(12).font('Helvetica-Bold').text('Resumo');
                doc.fontSize(10)
                    .font('Helvetica')
                    .text(`Total de artigos: ${articles.length}`)
                    .text(`Publicados: ${published}`)
                    .text(`Rascunhos: ${draft}`)
                    .text(`Agendados: ${scheduled}`);
                doc.moveDown(2);

                doc.fontSize(12).font('Helvetica-Bold').text('Lista de Artigos');
                doc.moveDown();

                articles.slice(0, 50).forEach((a, index) => {
                    doc.fontSize(10)
                        .font('Helvetica')
                        .text(`${index + 1}. ${a.title}`)
                        .text(
                            `   Status: ${a.status} | Autor: ${a.primary_author?.name || 'N/A'} | Criado: ${formatDate(a.created_at)}`,
                            { color: 'gray' }
                        );
                    doc.moveDown(0.5);
                });
                break;

            case 'users':
                const users = await User.findAll({
                    attributes: ['id', 'name', 'email', 'role', 'createdAt', 'lastLogin']
                });

                doc.fontSize(12).font('Helvetica-Bold').text('Equipe');
                doc.moveDown();

                users.forEach((u, index) => {
                    const role =
                        u.role === 'admin'
                            ? 'Administrador'
                            : u.role === 'editor'
                              ? 'Editor'
                              : 'Autor';
                    doc.fontSize(10)
                        .font('Helvetica')
                        .text(`${index + 1}. ${u.name} (${role})`)
                        .text(`   Email: ${u.email}`)
                        .text(
                            `   Ultimo login: ${u.lastLogin ? formatDate(u.lastLogin) : 'Nunca'}`,
                            { color: 'gray' }
                        );
                    doc.moveDown(0.5);
                });
                break;

            default:
                doc.text('Tipo de relatorio invalido');
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).text('© O Investigador - Jornal Online', { align: 'center' });

        doc.end();
    } catch (err) {
        console.error('PDF export error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
