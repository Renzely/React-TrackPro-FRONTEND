import * as React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import Swal from "sweetalert2";
import logo from "./Studio-Project.png";
import backgroundImage from "./TrackPro_logo.png";

const theme = createTheme({
  palette: {
    primary: {
      main: "#384959",
    },
    background: {
      default: "#384959",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default function ForgotPassword() {
  const [step, setStep] = React.useState("email"); // "email", "otp", "reset"
  const [otpCode, setOtpCode] = React.useState("");
  const [verifyOtpCode, setVerifyOtpCode] = React.useState("");
  const [resetEmail, setResetEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    const email = event.currentTarget.email.value;

    if (!email) {
      Swal.fire("Unable to Proceed", "Please input your email", "warning");
      return;
    }

    try {
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/send-otp-forgotpassword",
        { emailAddress: email }
      );
      const res = response.data;
      if (res.status === 200) {
        setVerifyOtpCode(res.code);
        setResetEmail(res.emailAddress);
        setStep("otp");
      } else {
        Swal.fire("Error!", res.data, "error");
      }
    } catch {
      Swal.fire("Error!", "Something went wrong", "error");
    }
  };

  const handleSubmitOtp = (event) => {
    event.preventDefault();
    if (otpCode === verifyOtpCode) {
      setStep("reset");
    } else {
      Swal.fire("Unable to Proceed", "Code does not match", "warning");
    }
  };

  const handleSubmitResetPassword = async (event) => {
    event.preventDefault();

    if (passwordError || confirmPasswordError) {
      Swal.fire({
        title: "Unable to Proceed",
        text: "Please input a valid password",
        icon: "warning",
      });
      return;
    }

    const body = {
      emailAddress: resetEmail,
      password: password,
    };

    axios
      .put(
        "https://react-rc-ugc-v2-backend.onrender.com/forgot-password-reset",
        body
      )
      .then(async (response) => {
        const res = await response.data;
        if (res.status === 200) {
          Swal.fire({
            title: "Password reset success!",
            text: "You can now login with your new password",
            icon: "success",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            window.location.href = "/";
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.data,
            icon: "error",
          });
        }
      })
      .catch(() => {
        Swal.fire({
          title: "Error!",
          text: "Something wrong occurred",
          icon: "error",
        });
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        sx={{
          height: "100vh",
          background:
            "linear-gradient(135deg, #6A89A7, #BDDDFC, #88BDF2, #384959)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            width: { xs: "90%", sm: "80%", md: "70%" },
            height: { xs: "90%", sm: "75%", md: "65%" },
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Grid
            item
            xs={false} // Hides this on extra-small screens (mobile)
            sm={6} // Shows this on small screens and above
            sx={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              minHeight: "100%",
              display: { xs: "none", sm: "block" }, // Hide on mobile, show on larger screens
            }}
          />
          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <Container maxWidth="xs">
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <img src={logo} alt="Logo" style={{ width: "80px" }} />
              </Box>
              <Typography
                component="h1"
                variant="h5"
                fontWeight="bold"
                color="#384959"
                align="center"
                mb={2}
              >
                {step === "email" && "FORGOT PASSWORD"}
                {step === "otp" && "ENTER OTP CODE"}
                {step === "reset" && "RESET PASSWORD"}
              </Typography>
              {step === "email" && (
                <Box component="form" onSubmit={handleSubmitEmail}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      mb: 2,
                      backgroundColor: "#77b1d4",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#517891",
                      },
                    }}
                  >
                    Send OTP CODE
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 1,
                      mb: 2,
                      color: "#517891",
                      borderColor: "#77b1d4",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#77b1d4",
                        borderColor: "#517891",
                        color: "#FFFFFF",
                      },
                    }}
                    onClick={() => (window.location.href = "/")}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
              {step === "otp" && (
                <Box component="form" onSubmit={handleSubmitOtp}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Enter OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      mb: 2,
                      backgroundColor: "#77b1d4",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#517891",
                      },
                    }}
                  >
                    Confirm Code
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 1,
                      mb: 2,
                      color: "#558B71",
                      borderColor: "#558B71",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#E8F5E9",
                        borderColor: "#7FCFA8",
                        color: "#FFFFFF",
                      },
                    }}
                    onClick={() => (window.location.href = "/")}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
              {step === "reset" && (
                <Box component="form" onSubmit={handleSubmitResetPassword}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      mb: 2,
                      backgroundColor: "#77b1d4",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#517891",
                      },
                    }}
                  >
                    Reset Password
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 1,
                      mb: 2,
                      color: "#558B71",
                      borderColor: "#558B71",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#E8F5E9",
                        borderColor: "#7FCFA8",
                        color: "#FFFFFF",
                      },
                    }}
                    onClick={() => (window.location.href = "/")}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Container>
          </Grid>
        </Box>
      </Grid>
    </ThemeProvider>
  );
}
