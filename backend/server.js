const express = require("express");
const userRouter = require('./routes/userRoutes');
const walletRouter = require('./routes/walletRoutes');
const transactionRouter = require('./routes/transactionRoutes');
const authenticate = require('./middleware/authenticate');

const app = express();

app.listen(5000, () => {
    console.log("listening to port 5000")
});

// middleware to log to console
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
}); 

app.use(express.json());

app.use("/api/user", userRouter);

// ----- Protected Routes -----
app.use(authenticate)

app.use("/api/transaction", transactionRouter);
app.use("/api/wallet", walletRouter);
