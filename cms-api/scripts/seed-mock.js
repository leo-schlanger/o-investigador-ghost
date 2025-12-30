const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'mysql', // Default to container name
    user: process.env.DB_USER || 'ghost',
    password: process.env.DB_PASSWORD || 'changeme',
    database: process.env.DB_NAME || 'o_investigador',
    port: process.env.DB_PORT || 3306
};

// Mock Data
const sections = ['Politica', 'Economia', 'Mundo', 'Desporto', 'Cultura', 'Tecnologia'];
const images = [
    'https://images.unsplash.com/photo-1529101091760-6149d4c46b4d?w=800&q=80', // Politica
    'https://images.unsplash.com/photo-1611974765270-ca12586343bb?w=800&q=80', // Economia
    'https://images.unsplash.com/photo-1526304640152-d4619684e484?w=800&q=80', // Mundo
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', // Desporto
    'https://images.unsplash.com/photo-1499364668198-44850fa3dad2?w=800&q=80', // Cultura
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80', // Tech
];

const titles = [
    "Governo aprova novo orçamento com foco na redução da dívida pública",
    "Mercados reagem com otimismo à descida da inflação na Zona Euro",
    "Eleições nos EUA: Sondagens mostram empate técnico nos estados decisivos",
    "Benfica e Porto empatam em clássico intenso no Dragão",
    "Exposição de Joana Vasconcelos bate recorde de visitantes em Serralves",
    "Inteligência Artificial: Nova regulamentação europeia entra em vigor",
    "Crise na habitação obriga governo a medidas extraordinárias",
    "TAP anuncia novas rotas para a América do Sul e Ásia",
    "Guerra na Ucrânia: Negociações de paz avançam mas com cautela",
    "Sporting sagra-se campeão de inverno após vitória difícil",
    "Cinema português premiado em festival internacional de Berlim",
    "Apple lança novos dispositivos com foco na realidade aumentada",
    "Reforma do SNS: Médicos em greve por melhores condições",
    "Bolsa de Lisboa fecha em alta impulsionada pela energia",
    "Alterações climáticas: Cimeira termina com acordo histórico",
    "Seleção nacional prepara amigável com a França",
    "Concerto dos Coldplay esgota em minutos em Coimbra",
    "Startups portuguesas captam investimento recorde este ano"
];

const authors = ["Ana Silva", "Carlos Santos", "Maria Ferreira", "João Costa", "Sofia Martins"];

async function seed() {
    console.log('🌱 Starting Seeder...');
    let connection;
    let i = 0; // consistent counter

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to DB');

        // Create Tags
        console.log('🏷️ Creating Tags...');
        for (const section of sections) {
            const slug = section.toLowerCase();
            await connection.execute(`
                INSERT INTO tags (
                    id, name, slug, description, feature_image, visibility, 
                    og_image, og_title, og_description, 
                    twitter_image, twitter_title, twitter_description, 
                    meta_title, meta_description, 
                    codeinjection_head, codeinjection_foot, canonical_url, accent_color,
                    created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, NULL, 'public',
                    '', '', '',
                    '', '', '',
                    '', '',
                    '', '', '', '',
                    NOW(), NOW()
                )
                ON DUPLICATE KEY UPDATE name=name
            `, [(i + 1).toString(), section, slug, `Notícias sobre ${section}`]); // Simple ID generation
        }

        // Create Posts
        console.log('📝 Creating Posts...');
        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            const sectionIndex = i % sections.length;
            const section = sections[sectionIndex];
            const image = images[sectionIndex];
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const excerpt = `Esta é uma breve descrição para a notícia sobre ${title}. O lide jornalístico deve ser curto e direto.`;
            const html = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p><h3>Análise Profunda</h3><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>`;

            // Insert Post
            const [postResult] = await connection.execute(`
                INSERT INTO posts (
                    id, uuid, title, slug, html, plaintext, feature_image, 
                    featured, status, visibility, created_at, updated_at, published_at, 
                    custom_excerpt, type
                ) VALUES (
                    ?, UUID(), ?, ?, ?, ?, ?, 
                    ?, 'published', 'public', NOW(), NOW(), NOW(), 
                    ?, 'post'
                )
            `, [
                (i + 1000).toString(), // ID hack to avoid collision
                title,
                slug + '-' + i, // Ensure unique slug
                html,
                html.replace(/<[^>]*>?/gm, ''),
                image,
                i < 3 ? 1 : 0, // First 3 are featured
                excerpt
            ]);

            // Link Tag
            const [tagResult] = await connection.execute('SELECT id FROM tags WHERE slug = ?', [section.toLowerCase()]);
            if (tagResult.length > 0) {
                await connection.execute(`
                    INSERT INTO posts_tags (post_id, tag_id, sort_order)
                    VALUES (?, ?, 0)
                `, [(i + 1000).toString(), tagResult[0].id]);
            }
        }

        console.log('✨ Seeding complete!');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.sqlMessage);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
