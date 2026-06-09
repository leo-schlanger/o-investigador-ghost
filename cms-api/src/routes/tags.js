const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Leitura: qualquer utilizador autenticado. Mutacoes: apenas admin/editor (espelha o RBAC do frontend)
router.get('/', protect, tagController.list);
router.post('/', protect, authorize('admin', 'editor'), tagController.create);
router.post('/init-categories', protect, authorize('admin', 'editor'), tagController.initCategories);
router.get('/:id', protect, tagController.get);
router.put('/:id', protect, authorize('admin', 'editor'), tagController.update);
router.delete('/:id', protect, authorize('admin', 'editor'), tagController.delete);

module.exports = router;
