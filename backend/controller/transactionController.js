const getTransactionHistory = (req, res) => {
    console.log("transaction history");
    res.status(200).json("transaction history");
}

const topUpTransaction = (req, res) => {
    console.log("topup");
    res.status(200).json("topup");
}

const withdrawTransaction = (req, res) => {
    console.log("withdraw");
    res.status(200).json("withdraw");
}

const transferTransaction = (req, res) => {
    console.log("transfer");
    res.status(200).json("transfer");
}

module.exports = { getTransactionHistory, topUpTransaction, withdrawTransaction, transferTransaction };
