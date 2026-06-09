const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Leitura: qualquer utilizador autenticado. Mutacoes: apenas admin/editor (espelha o RBAC do frontend)
router.get('/', protect, pageController.list);
router.post('/', protect, authorize('admin', 'editor'), pageController.create);
router.get('/:id', protect, pageController.get);
router.put('/:id', protect, authorize('admin', 'editor'), pageController.update);
router.delete('/:id', protect, authorize('admin', 'editor'), pageController.delete);

module.exports = router;
