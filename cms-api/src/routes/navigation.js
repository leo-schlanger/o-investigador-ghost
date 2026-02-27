const express = require('express');
const router = express.Router();
const navigationController = require('../controllers/navigationController');

router.get('/', navigationController.get);
router.put('/', navigationController.update);

module.exports = router;
