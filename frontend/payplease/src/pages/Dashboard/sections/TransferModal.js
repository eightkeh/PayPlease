import { useState } from "react";

// @mui material components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Modal from "@mui/material/Modal";
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";

// @mui icons
import CloseIcon from "@mui/icons-material/Close";

// Material Kit 2 React components
import MKBox from "../../../assets/components/MKBox";
import MKButton from "../../../assets/components/MKButton";
import MKTypography from "../../../assets/components/MKTypography";

// sections
import TransferForm from "./TransferForm";

export default function TransferModal() {
  const [show, setShow] = useState(false);
  const toggleModal = () => setShow(!show);
  const [amount, setAmount] = useState(0);
  const [factor, setFactor] = useState(1);
  const [recipient, setRecipient] = useState(null);

  const handleSendMoney = () => {
    // TODO: Implement send money functionality
    console.log(`Send ${amount} ti ${recipient}!`);
  };

  return (
    <MKBox component="section">
      <Container>
        <Grid container item xs={12} justifyContent="center" mx="auto">
          <MKButton variant="gradient" color="info" size="large" fullWidth onClick={toggleModal}>
            make a transfer
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
                <MKTypography variant="h5">PayPlease Transfer</MKTypography>
                <CloseIcon fontSize="medium" sx={{ cursor: "pointer" }} onClick={toggleModal} />
              </MKBox>
              <Divider sx={{ my: 0 }} />
              <TransferForm
                amount={amount}
                setAmount={setAmount}
                factor={factor}
                setFactor={setFactor}
                recipient={recipient}
                setRecipient={setRecipient}
              />
              <Divider sx={{ my: 0 }} />
              <MKBox display="flex" justifyContent="space-between" p={1.5}>
                <MKButton variant="gradient" color="dark" onClick={toggleModal}>
                  close
                </MKButton>
                <MKButton variant="gradient" color="info" onClock={handleSendMoney}>
                  send
                </MKButton>
              </MKBox>
            </MKBox>
          </Slide>
        </Modal>
      </Container>
    </MKBox>
  );
}