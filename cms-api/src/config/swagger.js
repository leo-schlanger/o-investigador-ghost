const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'O Investigador API',
            version: '1.0.0',
            description: 'API para o sistema de gestão do jornal O Investigador',
            contact: {
                name: 'O Investigador',
                url: 'https://jornalinvestigador.pt'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server'
            },
            {
                url: 'https://api.jornalinvestigador.pt',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['admin', 'editor', 'author'] },
                        avatar: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Article: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        slug: { type: 'string' },
                        html: { type: 'string' },
                        status: { type: 'string', enum: ['draft', 'published', 'scheduled'] },
                        visibility: { type: 'string', enum: ['public', 'members', 'paid'] },
                        feature_image: { type: 'string', nullable: true },
                        published_at: { type: 'string', format: 'date-time', nullable: true },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Tag: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        description: { type: 'string', nullable: true }
                    }
                },
                Media: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        filename: { type: 'string' },
                        originalName: { type: 'string' },
                        mimeType: { type: 'string' },
                        size: { type: 'integer' },
                        url: { type: 'string' },
                        folderId: { type: 'integer', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Setting: {
                    type: 'object',
                    properties: {
                        key: { type: 'string' },
                        value: { type: 'string' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/*.js', './src/docs/*.yaml']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
