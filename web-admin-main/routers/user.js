const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const userController = require('../controllers/user');

router.get('/user', isAuth, userController.getIndex);
router.post('/create-user', isAuth, userController.postUser);
router.get('/delete-user/:id', isAuth, userController.deleteUser);
router.get('/edit-user/:id', isAuth, userController.getUser);
router.post('/update-user', isAuth, userController.updateUser);
router.get('/reset-pass/:id', isAuth, userController.resetUser);
router.post('/update-status', isAuth, userController.updateStatusUser);
router.post('/lock', isAuth, userController.updateLock);

module.exports = router;