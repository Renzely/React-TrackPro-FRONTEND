import React from "react";
import "./topbar.css";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

export default function Topbar({ isSidebarOpen }) {
  const firstName = localStorage.getItem("firstName") || "";
  const roleAccount = localStorage.getItem("roleAccount") || "";

  return (
    <div className={`topbar ${isSidebarOpen ? "shifted" : ""}`}>
      <div className="topbarWrapper">
        <div className="topLeft">
          <div className="logo-mark">TP</div>
          <div className="logo-text">
            <span className="logo-main">TrackPro</span>
            <span className="logo-sub">Monitoring System</span>
          </div>
        </div>
        <div className="topRight">
          {/* <div className="topbar-badge">
            <NotificationsNoneIcon sx={{ fontSize: 20, color: "#90caf9" }} />
          </div> */}
          <div className="topbar-user">
            <div className="topbar-avatar">
              {firstName ? firstName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="topbar-userinfo">
              <span className="topbar-name">{firstName || "Admin"}</span>
              <span className="topbar-role">{roleAccount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
