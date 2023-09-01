const checkWalletBalance = (req, res) => {
    console.log("wallet balance")
    res.status(200).json("wallet balance")
}

module.exports = { checkWalletBalance };
