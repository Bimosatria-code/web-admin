const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.get('/', authController.getIndex);
router.post('/login', authController.postLogin);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.post('/logout', authController.postLogout);

module.exports = router;