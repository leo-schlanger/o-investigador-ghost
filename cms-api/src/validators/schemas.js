/**
 * Joi Validation Schemas
 * Centralized validation schemas for all API endpoints
 */
const Joi = require('joi');

// Auth schemas
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email invalido',
        'any.required': 'Email e obrigatorio'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password deve ter pelo menos 6 caracteres',
        'any.required': 'Password e obrigatoria'
    })
});

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no maximo 100 caracteres',
        'any.required': 'Nome e obrigatorio'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email invalido',
        'any.required': 'Email e obrigatorio'
    }),
    password: Joi.string().min(6).max(128).required().messages({
        'string.min': 'Password deve ter pelo menos 6 caracteres',
        'string.max': 'Password deve ter no maximo 128 caracteres',
        'any.required': 'Password e obrigatoria'
    }),
    role: Joi.string().valid('admin', 'editor', 'author').default('author').messages({
        'any.only': 'Role invalida. Deve ser: admin, editor ou author'
    })
});

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).max(128).optional(),
    avatar: Joi.string().allow(null, '').max(500).optional()
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido'
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).max(128).optional(),
    role: Joi.string().valid('admin', 'editor', 'author').optional(),
    avatar: Joi.string().allow(null, '').max(500).optional()
});

// Article schemas
const articleQuerySchema = Joi.object({
    status: Joi.string().valid('all', 'draft', 'published', 'scheduled').default('all'),
    search: Joi.string().max(100).allow('').default(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(15),
    type: Joi.string().valid('cronica', 'reportagem', 'opiniao').optional()
});

// Media schemas
const mediaQuerySchema = Joi.object({
    folderId: Joi.string().allow('', 'null').optional(),
    tags: Joi.string().allow('').optional(),
    search: Joi.string().max(100).allow('').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50)
});

const bulkMoveSchema = Joi.object({
    mediaIds: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.min': 'Lista de media IDs e obrigatoria',
        'any.required': 'Lista de media IDs e obrigatoria'
    }),
    folderId: Joi.string().allow(null).optional()
});

const bulkAddTagsSchema = Joi.object({
    mediaIds: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.min': 'Lista de media IDs e obrigatoria'
    }),
    tagIds: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.min': 'Lista de tag IDs e obrigatoria'
    })
});

// Folder schemas
const createFolderSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Nome da pasta e obrigatorio',
        'any.required': 'Nome da pasta e obrigatorio'
    }),
    parentId: Joi.string().allow(null).optional()
});

// Tag schemas
const createTagSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Nome da tag e obrigatorio',
        'any.required': 'Nome da tag e obrigatorio'
    })
});

module.exports = {
    loginSchema,
    registerSchema,
    updateProfileSchema,
    updateUserSchema,
    articleQuerySchema,
    mediaQuerySchema,
    bulkMoveSchema,
    bulkAddTagsSchema,
    createFolderSchema,
    createTagSchema
};
