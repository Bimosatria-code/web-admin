const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const reportController = require('../controllers/reporting');

router.get('/customer', isAuth, reportController.getIndexCustomer);
router.post('/filter-customer', isAuth, reportController.postFilterCustomer);
router.get('/excel-customer', isAuth, reportController.getExcel);
router.get('/excel', isAuth, reportController.getDownloadExcel);
router.get('/txt-customer', isAuth, reportController.getText);
router.get('/txt', isAuth, reportController.getDownloadTxt);

router.get('/transaksi', isAuth, reportController.getIndexTransaction);
router.post('/filter-transaksi', isAuth, reportController.postFilterTransaksi);
router.get('/excel-transaksi', isAuth, reportController.getTransaksiExcel);
router.get('/xls', isAuth, reportController.getDownloadTransaksiExcel);
router.get('/txt-transaksi', isAuth, reportController.getTransaksiText);
router.get('/text', isAuth, reportController.getDownloadTransaksiTxt);

router.get('/abnormal', isAuth, reportController.getIndexAbnormal);
router.post('/filter-abnormal', isAuth, reportController.postFilterAbnormal);
router.get('/excel-abnormal', isAuth, reportController.getExcelAbnormal);
router.get('/download-xls', isAuth, reportController.getDownloadExcelAbnormal);
router.get('/txt-abnormal', isAuth, reportController.getTextAbnormal);
router.get('/download-txt', isAuth, reportController.getDownloadTxtAbnormal);

module.exports = router;