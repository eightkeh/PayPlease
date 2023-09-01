const loginUser = (req, res) => {
    console.log("login");
    res.status(200).json("login")
};

const signupUser = (req, res) => {
    console.log("signup");
    res.status(200).json("signup")
};


module.exports = { loginUser, signupUser };
