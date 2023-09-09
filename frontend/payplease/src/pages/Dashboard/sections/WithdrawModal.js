import React, { useState } from "react";
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";
import CloseIcon from "@mui/icons-material/Close";
import MKBox from "../../../assets/components/MKBox";
import MKButton from "../../../assets/components/MKButton";
import MKTypography from "../../../assets/components/MKTypography";
import MKAlert from "assets/components/MKAlert";
import { useAuth } from "context/AuthContext";
import { useElements, useStripe } from "@stripe/react-stripe-js";

// const PUBLIC_KEY =
//   "pk_test_51NkrWXA2kau6fLsqzRhwcHc4TjtrI6fRUfWnJvOtV07BmB1eO95D2xvsyKOTysLMKFRTUxTy3qAJalaLUaj2sLu600tvv5LbWI";

// Initialize Stripe with your publishable key
//const stripePromise = loadStripe(PUBLIC_KEY);

export default function WithdrawModal({ setWithdrawalSuccess }) {
  WithdrawModal.propTypes = {
    setWithdrawalSuccess: PropTypes.func.isRequired,
  };

  const [show, setShow] = useState(false);
  const toggleModal = () => setShow(!show);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const elements = useElements();
  const stripe = useStripe();

  // Frontend code to check if a user is connected to Stripe
  const checkStripeConnection = async (userId) => {
    try {
      const { token: auth_token } = user;
      const response = await fetch(`/api/user/stripeconnect/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      });
      const data = await response.json();
      if (data.isConnected === "true") {
        // User is connected to Stripe
        console.log("User is connected to Stripe");
        return true;
      } else {
        // User is not connected to Stripe
        console.log("User is not connected to Stripe");
        return false;
      }
    } catch (error) {
      console.error("Error checking Stripe connection:", error);
      return false;
    }
  };

  const initiateStripeOnboarding = async (userId) => {
    try {
      const { token: auth_token } = user;
      const response = await fetch(`/api/user/stripeconnect/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify({ user_id: userId, return_url: window.locatio }),
      });
      const data = await response.json();
      if (data.url) {
        // Redirect the user to the Stripe onboarding URL
        window.location.href = data.url;
      } else {
        console.error("Failed to initiate Stripe onboarding");
      }
    } catch (error) {
      console.error("Error initiating Stripe onboarding:", error);
    }
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();

    if (user && stripe && elements) {
      const { user_id, token: auth_token } = user;

      // Replace with your server-side logic for withdrawing funds using the token
      // You'll need to create a server route for this purpose.
      fetch(`/api/transaction/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth_token}`,
        },
        body: JSON.stringify({
          user_id: user_id,
          amount: amount,
        }),
      })
        .then((response) => {
          if (response.ok) {
            setWithdrawalSuccess(true);
            setTimeout(() => setWithdrawalSuccess(null), 10000);
            toggleModal();
            return response.json();
          } else {
            return response.json().then((errorData) => {
              throw new Error(errorData.message);
            });
          }
        })
        .then((data) => {
          console.log("Withdraw Data:", data);
        })
        .catch((error) => {
          console.error("Error withdrawing:", error);
          setError(error.message);
        });
    }
  };

  return (
    <MKBox component="section">
      <Container>
        <Grid container item xs={12} justifyContent="center" mx="auto">
          <MKButton variant="gradient" color="primary" size="large" fullWidth onClick={toggleModal}>
            Withdraw
          </MKButton>
        </Grid>
        <Modal open={show} onClose={toggleModal} sx={{ display: "grid", placeItems: "center" }}>
          <Slide direction="up" in={show} timeout={300}>
            <MKBox
              position="relative"
              width="500px"
              display="flex"
              flexDirection="column"
              borderRadius="xl"
              bgColor="white"
              shadow="xl"
            >
              <MKBox display="flex" alignItems="center" justifyContent="space-between" p={2}>
                <MKTypography variant="h5">PayPlease Withdraw</MKTypography>
                <CloseIcon fontSize="medium" sx={{ cursor: "pointer" }} onClick={toggleModal} />
              </MKBox>
              <div>
                <button onClick={() => initiateStripeOnboarding(user.user_id)}>
                  Connect to Stripe
                </button>
              </div>
              <Divider sx={{ my: 0 }} />
              <form onSubmit={handleWithdraw}>
                <div style={{ padding: "16px" }}>
                  <label>
                    Amount:
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value))}
                      required
                    />
                  </label>
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ padding: "16px" }}></div>
                  <MKButton variant="gradient" color="info" type="submit">
                    Withdraw
                  </MKButton>
                </div>
                {error && <MKAlert color={"error"}>{error}</MKAlert>}
              </form>
            </MKBox>
          </Slide>
        </Modal>
      </Container>
    </MKBox>
  );
}
