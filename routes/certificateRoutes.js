const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.get('/', certificateController.getCertificates);
router.post('/issue', certificateController.issueCertificate);
router.get('/verify/:qrCode', certificateController.verifyCertificate);
router.get('/pdf/:qrCode', certificateController.downloadPDFCertificate);

module.exports = router;