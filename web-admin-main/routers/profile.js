const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const profileController = require('../controllers/profile');

router.get('/profile/:id', isAuth, profileController.getIndex);
router.post('/profile', isAuth, profileController.postProfile);

module.exports = router;