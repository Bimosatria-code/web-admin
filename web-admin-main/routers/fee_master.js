const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const feeMasterController = require('../controllers/fee_master.js');

// Purchase and Bill
router.get('/master-fee', isAuth, feeMasterController.getIndex);
router.post('/master-fee', isAuth, feeMasterController.postMasterFee);
router.get('/edit-master-fee/:id', isAuth, feeMasterController.editMasterFee);
router.post('/update-master-fee', isAuth, feeMasterController.updateMasterFee);
router.get('/delete-master-fee/:id', isAuth, feeMasterController.deleteMasterFee);

// Transafer dana
router.get('/master-transfer', isAuth, feeMasterController.getIndexTransfer);
router.post('/master-transfer', isAuth, feeMasterController.postMasterTransfer);
router.get('/edit-master-transfer/:id', isAuth, feeMasterController.editMasterTransfer);
router.post('/update-master-transfer', isAuth, feeMasterController.updateMasterTransfer);
router.get('/delete-master-transfer/:id', isAuth, feeMasterController.deleteMasterTransfer);

// Inquiry
router.get('/master-inquiry', isAuth, feeMasterController.getIndexInquiry);
router.post('/master-inquiry', isAuth, feeMasterController.postMasterInquiry);
router.get('/edit-master-inquiry/:id', isAuth, feeMasterController.editMasterInquiry);
router.post('/update-master-inquiry', isAuth, feeMasterController.updateMasterInquiry);
router.get('/delete-master-inquiry/:id', isAuth, feeMasterController.deleteMasterInquiry);

module.exports = router;