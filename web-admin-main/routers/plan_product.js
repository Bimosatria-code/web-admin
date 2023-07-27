const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const planProductController = require('../controllers/plan_product');

router.get('/plan-product', isAuth, planProductController.getIndex);
router.post('/create-plan-product', isAuth, planProductController.postPlanProduct);
router.get('/edit-plan-product/:id', isAuth, planProductController.getPlanProduct);
router.post('/update-plan-product', isAuth, planProductController.updatePlanProduct);
router.get('/delete-plan-product/:id', isAuth, planProductController.deletePlanProduct);

module.exports = router;