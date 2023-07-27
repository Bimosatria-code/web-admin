const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const auditTrailsController = require('../controllers/audit_trails');
const logTransaksiController = require('../controllers/log_transaksi');
const logStatistikController = require('../controllers/log_statistik');

router.get('/audit-trails', isAuth, auditTrailsController.getIndex);
router.post('/filter-audit-trails', isAuth, auditTrailsController.getFilter);
router.get('/excel-audit-trails', isAuth, auditTrailsController.download);
router.get('/excel-trails', isAuth, auditTrailsController.getExcel);

router.get('/transaksi', isAuth, logTransaksiController.getIndex);
router.post('/filter-transaksi', isAuth, logTransaksiController.getFilterTransaksi);
router.get('/excel-transaksi', isAuth, logTransaksiController.getExcel);
router.get('/excel', isAuth, logTransaksiController.getDownloadExcel);
router.get('/txt-transaksi', isAuth, logTransaksiController.getText);
router.get('/txt', isAuth, logTransaksiController.getDownloadTxt);

router.get('/statistik', isAuth, logStatistikController.getIndex);
router.post('/filter-statistik', isAuth, logStatistikController.postFilterStatistik);
router.get('/excel-statistik', isAuth, logStatistikController.getExcel);
router.get('/xls', isAuth, logStatistikController.getDownloadExcel);
router.get('/txt-statistik', isAuth, logStatistikController.getText);
router.get('/text', isAuth, logStatistikController.getDownloadTxt);

module.exports = router;