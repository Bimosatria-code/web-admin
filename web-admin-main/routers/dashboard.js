const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const dashboardController = require('../controllers/dashboard');

router.get('/home', isAuth, dashboardController.getIndex);

module.exports = router;