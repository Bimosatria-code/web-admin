const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const feeController = require('../controllers/fee');

// Purchase and Bill
router.get('/fee', isAuth, feeController.getIndex);
router.get('/purchase', isAuth, feeController.getPurchaseBill);
router.post('/purchase', isAuth, feeController.postPurchaseBill);
router.get('/edit-purchase/:id', isAuth, feeController.editPurchaseBill);
router.post('/update-purchase', isAuth, feeController.updatePurchaseBill);
router.get('/delete-purchase/:id', isAuth, feeController.deletePurchaseBill);
router.get('/submit-purchase', isAuth, feeController.submitPurchaseBill);
router.get('/approve-purchase', isAuth, feeController.approvePurchaseBill);
router.get('/reject-purchase', isAuth, feeController.rejectPurchaseBill);
router.post('/reload-purchase', isAuth, feeController.reloadPurchaseBill);
router.get('/view-purchase/:id', isAuth, feeController.viewPurchaseBill);
router.get('/select-master/:id', isAuth, feeController.selectMaster);

// Transfer DanaS
router.get('/transfer', isAuth, feeController.getTransferDana);
router.get('/create-transfer', isAuth, feeController.createTransferDana);
router.post('/transfer', isAuth, feeController.postTransferDana);
router.get('/edit-transfer/:id', isAuth, feeController.editTransferDana);
router.post('/update-transfer', isAuth, feeController.updateTransferDana)
router.get('/view-transfer/:id', isAuth, feeController.viewTransferDana);
router.get('/delete-transfer/:id', isAuth, feeController.deleteTransferDana);
router.get('/submit-transfer', isAuth, feeController.submitTransferDana);
router.get('/approve-transfer', isAuth, feeController.approveTransferDana);
router.get('/reject-transfer', isAuth, feeController.rejectTransferDana);
router.post('/reload-transfer', isAuth, feeController.reloadTransferDana);

// Inquiry
router.get('/inquiry', isAuth, feeController.getInquiry);
router.get('/create-inquiry', isAuth, feeController.createInquiry);
router.post('/inquiry', isAuth, feeController.postInquiry);
router.get('/edit-inquiry/:id', isAuth, feeController.editInquiry);
router.post('/update-inquiry', isAuth, feeController.updateInquiry)
router.get('/view-inquiry/:id', isAuth, feeController.viewInquiry);
router.get('/delete-inquiry/:id', isAuth, feeController.deleteInquiry);
router.get('/submit-inquiry', isAuth, feeController.submitInquiry);
router.get('/approve-inquiry', isAuth, feeController.approveInquiry);
router.get('/reject-inquiry', isAuth, feeController.rejectInquiry);
router.post('/reload-inquiry', isAuth, feeController.reloadInquiry);

module.exports = router;