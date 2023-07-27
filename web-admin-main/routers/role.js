const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const roleController = require('../controllers/role');

router.get('/role', isAuth, roleController.getIndex);
router.post('/create-role', isAuth, roleController.postRole);
router.get('/edit-role/:id', isAuth, roleController.getRole);
router.post('/update-role', isAuth, roleController.updateRole);
router.get('/delete-role/:id', isAuth, roleController.deleteRole);

module.exports = router;