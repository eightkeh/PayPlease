const express = require('express');
const { getTransactionHistory,
    topUpTransaction,
    withdrawTransaction,
    transferTransaction } = require('../controller/transactionController');

const router = express.Router();

router.get('/history/:id', getTransactionHistory);

router.post('/topup', topUpTransaction);

router.post('/withdraw', withdrawTransaction);

router.post('/transfer', transferTransaction);

module.exports = router;
