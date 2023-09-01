const authenticate = (req, res, next) => {
    console.log("authenticate");
    next();
};

module.exports = authenticate;
