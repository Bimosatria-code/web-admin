const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

const campaignController = require('../controllers/campaign');

router.get('/campaign', isAuth, campaignController.getIndex);
router.get('/create-campaign', isAuth, campaignController.getCampaign);
router.post('/create-campaign', isAuth, campaignController.postCampaign);
router.post('/update-campaign', isAuth,campaignController.updateCampaign);
router.get('/delete-campaign/:id', isAuth,campaignController.deleteCampaign);
router.get('/edit-campaign/:id', isAuth,campaignController.editCampaign);
router.post('/reload-campaign', isAuth,campaignController.reloadCampaign);
router.get('/submit-campaign', isAuth, campaignController.submitCampaign);
router.get('/approve-campaign', isAuth, campaignController.approveCampaign);
router.get('/reject-campaign', isAuth, campaignController.rejectCampaign);
router.get('/view-campaign/:id', isAuth, campaignController.viewCampaign);
router.get('/select-plan-product/:id', isAuth, campaignController.selectMaster);

module.exports = router;