const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { updateUserStripeIsConnected, updateUserStripeId, getUserById, getUserByUsername, getUserByPhone, getUserByEmail, isEmailTaken, insertUser } = require("../queries/userQueries");
const { createWallet } = require("../queries/walletQueries");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SK);

function createToken(user_id) {
    return jwt.sign({user_id}, process.env.SECRET_KEY, {expiresIn: '2h'});
}

const findUser = async (req, res) => {
    const {username, email, phone, user_id} = req.query;

    if (!username && !email && !phone && !user_id) {
        return res.status(400).json({ message: "Search parameter cannot be empty" })
    }

    try {
        const user = username ? await getUserByUsername(username)
            : email ? await getUserByEmail(email)
            : phone ? await getUserByPhone(phone)
            : user_id ? await getUserById(user_id)
            : "";
        if (!user) {
            return res.status(400).json({ message: "No such user exists"});
        }

        res.status(200).json({username: user.username, email: user.email, phone: user.phone_number, user_id: user.user_id})

    } catch (err) {
        res.status(500).json({message: "error finding user"});
    }
};

const loginUser = async(req, res) => {
    
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await getUserByEmail(email);
        
        if (!user) {
            return res.status(400).json({ message: 'Email or password is wrong.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.hashed_pw);

        if (passwordMatch) {
            // Add code for session token creation here
            const token = createToken(user.user_id);
            res.status(200).json({user_id: user.user_id, token: token});
        } else {
            res.status(400).json({ message: 'Invalid Password' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred while checking email' });
    }
};

const signupUser = async(req, res) => {

    // Parameters for users table
    const user_id = uuidv4();
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone;
    const account_type = 'User';

    // Parameters for wallets table
    const wallet_id = uuidv4();
    const balance = 0;

    try {
        const emailTaken = await isEmailTaken(email);

        if (emailTaken) {
            return res.status(400).json({ message: 'That email is already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        
        const user = {
            user_id,
            username,
            email,
            hashedPassword,
            phone,
            account_type
        };

        const userInsertResult = await insertUser(user);

        const wallet = {
            wallet_id,
            user_id, 
            balance,
        }

        await createWallet(wallet);

        return res.status(200).json({ message: 'User registered, wallet registered' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while registering user' });
    }
}

// protected endpoint
const checkUserStripeConnect = async (req, res) => {
    const { id: user_id } = req.params;
    const { user_id: authenticated_user_id } = req.user;

    // Verify if the user to check is the same as the user who made the request
    if (authenticated_user_id !== user_id) {
        return res.status(401).json({ message: 'Unauthorized' });

    }
    try {
        const user = await getUserById(user_id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.stripe_id) {
            // no stripe_id, definitely not connected yet
            return res.status(200).json({ isConnected: false });
        }

        const isConnected = user.stripe_connected;
        console.log(isConnected);

        if (!isConnected) { // might be string, have to use === "false instead"
            // get stripe account and check if "charges_enabled" to determine if onboarding completed.
            const account = await stripe.accounts.retrieve(user.stripe_id);
            if (account.charges_enabled) {
                // onboarding has been completed, update database and return true
                await updateUserStripeIsConnected(user_id, true)
                return res.status(200).json({ isConnected: true })
            }
        }

        res.status(200).json({ isConnected });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while registering user' });
    }
}

// protected endpoint
const connectUserToStripe = async (req, res) => {
    const { user_id, return_url } = req.body;
    const { user_id: authenticated_user_id } = req.user;

    // Verify if the user to check is the same as the user who made the request
    if (authenticated_user_id !== user_id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = await getUserById(user_id);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            } 

            if (user.stripe_connected) {
                return res.status(400).json({ message: 'User already connected' });
            }
        
        let stripeAccountId = user.stripe_id;

        if (!stripeAccountId) {
            // no stripe id yet, create and add to database
            const account = await stripe.accounts.create({
                country: 'SG',
                type: 'express',
                capabilities: {
                    card_payments: {
                        requested: true,
                    },
                    transfers: {
                        requested: true,
                    },
                },
                business_type: 'individual',
                business_profile: {
                url: 'https://localost.com',
                },
            });

            stripeAccountId = account.id;
            await updateUserStripeId(user_id, stripeAccountId);
        }

        // create connection url link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: return_url,
            return_url: return_url,
            type: "account_onboarding",
            collect: 'eventually_due',
        });

        // do not update stripe_connected boolean, users might not have completed onboarding. Try to update the next time 
        // checkUserStripeConnect is called.

        res.status(200).json({ url: accountLink.url });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while connecting to stripe' });
    }
}

module.exports = { findUser, loginUser, signupUser, checkUserStripeConnect, connectUserToStripe };
