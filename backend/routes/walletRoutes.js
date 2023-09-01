const express = require('express');
const { checkWalletBalance } = require('../controller/walletController');

const router = express.Router();

router.get('/balance/:id', checkWalletBalance);

module.exports = router;
