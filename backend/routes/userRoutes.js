const express = require('express');
const authenticate = require('../middleware/authenticate')
const { findUser, loginUser, signupUser, checkUserStripeConnect, connectUserToStripe } = require('../controller/userController.js');

const router = express.Router();

router.get('/find', findUser);

// Login Page
router.post('/login', loginUser);

// Register Page
router.post('/signup', signupUser);

// ----  [protected] ----

router.use(authenticate)

// connect user to stripe using Connect onboarding
router.post('/stripeconnect', connectUserToStripe);
// check and update if user connected to stripe already
router.get('/stripeconnect/:id', checkUserStripeConnect);


module.exports = router;
