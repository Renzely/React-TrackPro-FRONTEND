import * as React from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import Swal from "sweetalert2";
import logo from "./Studio-Project.png";
import "./login.css";

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = {
      emailAddress: data.get("email"),
      password: data.get("password"),
    };

    if (!body.emailAddress || !body.password) {
      Swal.fire({
        title: "Missing Fields",
        text: "Please fill in all fields.",
        icon: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://api-trackpro.bmphrc.com/login-admin",
        body,
      );
      const res = response.data;
      if (res.status === 200) {
        localStorage.setItem("isLoggedIn", "admin");
        localStorage.setItem("firstName", res.data.firstName);
        localStorage.setItem("lastName", res.data.lastName);
        localStorage.setItem("roleAccount", res.data.roleAccount);
        localStorage.setItem("outlet", JSON.stringify(res.data.outlet));
        window.location.href = "/view-accounts";
      } else {
        Swal.fire({ title: "Login Failed", text: res.data, icon: "error" });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Something went wrong. Try again.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* Left panel */}
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

        {/* Right panel */}
        <div className="login-right">
          <div className="form-container">
            <div className="logo-wrap">
              <img src={logo} alt="Logo" className="login-logo" />
            </div>

            <h1 className="form-title">Welcome back</h1>
            <p className="form-subtitle">Sign in to your admin account</p>

            <Box component="form" onSubmit={handleSubmit} noValidate>
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

              <div className="field-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label className="field-label" style={{ margin: 0 }}>
                    Password
                  </label>
                  <a href="/forgotpassword" className="forgot-link">
                    Forgot password?
                  </a>
                </div>
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
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
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

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
