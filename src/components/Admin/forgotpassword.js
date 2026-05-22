import * as React from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import Swal from "sweetalert2";
import logo from "./Studio-Project.png";

export default function ForgotPassword() {
  const [step, setStep] = React.useState("email"); // "email" | "otp" | "reset"
  const [otpCode, setOtpCode] = React.useState("");
  const [verifyOtpCode, setVerifyOtpCode] = React.useState("");
  const [resetEmail, setResetEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  /* ─── step meta ─── */
  const stepMeta = {
    email: {
      title: "Forgot Password",
      subtitle: "Enter your email to receive a one-time code",
      icon: "📧",
    },
    otp: {
      title: "Verify OTP",
      subtitle: "Enter the code we sent to your inbox",
      icon: "🔑",
    },
    reset: {
      title: "Reset Password",
      subtitle: "Choose a strong new password",
      icon: "🔒",
    },
  };

  /* ─── handlers ─── */
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    const emailAddress = e.currentTarget.email.value;
    if (!emailAddress) {
      Swal.fire("Missing Field", "Please enter your email address.", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = (
        await axios.post(
          "https://api-trackpro.bmphrc.com/send-otp-forgotpassword",
          {
            emailAddress,
          },
        )
      ).data;
      if (res.status === 200) {
        setVerifyOtpCode(res.code);
        setResetEmail(res.emailAddress);
        setStep("otp");
      } else {
        Swal.fire("Error!", res.data, "error");
      }
    } catch {
      Swal.fire("Error!", "Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = (e) => {
    e.preventDefault();
    if (otpCode === verifyOtpCode) {
      setStep("reset");
    } else {
      Swal.fire("Invalid Code", "The OTP code does not match.", "warning");
    }
  };

  const handleSubmitReset = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      Swal.fire(
        "Missing Fields",
        "Please fill in both password fields.",
        "warning",
      );
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire("Mismatch", "Passwords do not match.", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = (
        await axios.put(
          "https://api-trackpro.bmphrc.com/forgot-password-reset",
          {
            emailAddress: resetEmail,
            password,
          },
        )
      ).data;
      if (res.status === 200) {
        await Swal.fire({
          title: "Password Reset!",
          text: "You can now sign in with your new password.",
          icon: "success",
          confirmButtonColor: "#0aafeb",
        });
        window.location.href = "/";
      } else {
        Swal.fire("Error!", res.data, "error");
      }
    } catch {
      Swal.fire("Error!", "Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ─── step indicator dots ─── */
  const steps = ["email", "otp", "reset"];

  return (
    <div className="login-root">
      {/* Animated background blobs — same as Login */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="left-content">
            <div className="brand-mark">TP</div>
            <h2 className="brand-name">TrackPro</h2>
            <p className="brand-tagline">Attendance Monitoring System</p>
            <div className="feature-list">
              {[
                "Real-time attendance tracking",
                "Multi-branch management",
                "Selfie verification",
              ].map((f) => (
                <div key={f} className="feature-item">
                  <span className="feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="form-container">
            {/* Logo */}
            <div className="logo-wrap">
              <img src={logo} alt="Logo" className="login-logo" />
            </div>

            {/* Step indicator */}
            <div style={styles.stepDots}>
              {steps.map((s, i) => (
                <div
                  key={s}
                  style={{
                    ...styles.dot,
                    backgroundColor:
                      steps.indexOf(step) >= i ? "#0aafeb" : "#e2e8f0",
                    width: step === s ? 24 : 8,
                  }}
                />
              ))}
            </div>

            {/* Step icon + heading */}
            <div style={styles.iconBadge}>{stepMeta[step].icon}</div>
            <h1 className="form-title">{stepMeta[step].title}</h1>
            <p className="form-subtitle">{stepMeta[step].subtitle}</p>

            {/* ── Email step ── */}
            {step === "email" && (
              <Box component="form" onSubmit={handleSubmitEmail} noValidate>
                <div className="field-group">
                  <label className="field-label">Email address</label>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="admin@example.com"
                    size="small"
                    sx={fieldSx}
                  />
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={primaryBtnSx}
                >
                  {loading ? "Sending…" : "Send OTP Code"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => (window.location.href = "/")}
                  sx={secondaryBtnSx}
                >
                  Back to Sign In
                </Button>
              </Box>
            )}

            {/* ── OTP step ── */}
            {step === "otp" && (
              <Box component="form" onSubmit={handleSubmitOtp} noValidate>
                <div className="field-group">
                  <label className="field-label">OTP Code</label>
                  <TextField
                    fullWidth
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    size="small"
                    inputProps={{
                      maxLength: 6,
                      style: {
                        letterSpacing: 6,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: 700,
                      },
                    }}
                    sx={fieldSx}
                  />
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={primaryBtnSx}
                >
                  Confirm Code
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setStep("email")}
                  sx={secondaryBtnSx}
                >
                  Go Back
                </Button>
              </Box>
            )}

            {/* ── Reset step ── */}
            {step === "reset" && (
              <Box component="form" onSubmit={handleSubmitReset} noValidate>
                <div className="field-group">
                  <label className="field-label">New Password</label>
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="small"
                    sx={fieldSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((p) => !p)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOff
                                sx={{ fontSize: 18, color: "#94a3b8" }}
                              />
                            ) : (
                              <Visibility
                                sx={{ fontSize: 18, color: "#94a3b8" }}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Confirm Password</label>
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    size="small"
                    sx={{
                      ...fieldSx,
                      "& .MuiOutlinedInput-root": {
                        ...fieldSx["& .MuiOutlinedInput-root"],
                        "& fieldset": {
                          borderColor:
                            confirmPassword && confirmPassword !== password
                              ? "#ef4444"
                              : "#e2e8f0",
                        },
                      },
                    }}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p style={styles.errorText}>Passwords do not match</p>
                  )}
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={primaryBtnSx}
                >
                  {loading ? "Resetting…" : "Reset Password"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => (window.location.href = "/")}
                  sx={secondaryBtnSx}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared sx objects (mirrors Login.js) ─── */
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    fontSize: 14,
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#0aafeb" },
    "&.Mui-focused fieldset": { borderColor: "#0aafeb", borderWidth: 1.5 },
  },
  "& .MuiOutlinedInput-input": { padding: "11px 14px" },
};

const primaryBtnSx = {
  mt: 1,
  mb: 0,
  backgroundColor: "#0aafeb",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  borderRadius: "12px",
  padding: "12px",
  textTransform: "none",
  boxShadow: "0 4px 14px rgba(10,175,235,0.35)",
  "&:hover": {
    backgroundColor: "#0096c7",
    boxShadow: "0 4px 20px rgba(10,175,235,0.45)",
  },
  "&.Mui-disabled": {
    backgroundColor: "#b2e4f7",
    color: "#fff",
  },
};

const secondaryBtnSx = {
  mt: 1.5,
  mb: 0,
  borderRadius: "12px",
  padding: "11px",
  fontSize: 14,
  fontWeight: 600,
  textTransform: "none",
  color: "#64748b",
  borderColor: "#e2e8f0",
  "&:hover": {
    borderColor: "#0aafeb",
    color: "#0aafeb",
    backgroundColor: "rgba(10,175,235,0.04)",
  },
};

/* ─── Inline styles for new ForgotPassword-only elements ─── */
const styles = {
  stepDots: {
    display: "flex",
    gap: 6,
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 999,
    transition: "all 0.3s ease",
  },
  iconBadge: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 4,
  },
  errorText: {
    margin: "4px 0 0 4px",
    fontSize: 12,
    color: "#ef4444",
  },
};
