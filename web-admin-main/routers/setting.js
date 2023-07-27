const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const settingController = require('../controllers/setting');

router.get('/setting', isAuth, settingController.getIndex);
router.post('/create-parameter', isAuth, settingController.postParameter);

module.exports = router;