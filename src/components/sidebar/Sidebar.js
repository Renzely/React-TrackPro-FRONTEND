import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AssignmentInd,
  ManageAccounts,
  Logout,
  SupervisorAccount,
} from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import "./sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isOpen, setOpen] = useState(() => {
    return localStorage.getItem("sidebarOpen") === "true";
  });

  const toggleSidebar = () => {
    const newState = !isOpen;
    setOpen(newState);
    localStorage.setItem("sidebarOpen", newState.toString());
  };

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const roleAccount = localStorage.getItem("roleAccount") || "";
  const firstName = localStorage.getItem("firstName") || "User";

  const showAdmin = [
    "ACCOUNT SUPERVISOR",
    "OPERATION OFFICER",
    "OPERATION HEAD",
    "SENIOR OPERATION MANAGER",
  ].includes(roleAccount);

  const initials = firstName.charAt(0).toUpperCase();

  const navItem = (to, icon, label) => (
    <Tooltip title={!isOpen ? label : ""} placement="right" arrow key={to}>
      <NavLink to={to} onClick={() => handleItemClick(to)}>
        <li className={`sidebar-item ${activeItem === to ? "active" : ""}`}>
          <span className="sidebar-icon">{icon}</span>
          {isOpen && <span className="sidebar-label">{label}</span>}
          {activeItem === to && <span className="active-indicator" />}
        </li>
      </NavLink>
    </Tooltip>
  );

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Toggle */}
      <div className="sidebar-toggle">
        <IconButton onClick={toggleSidebar} size="small" className="toggle-btn">
          {isOpen ? (
            <MenuOpenIcon
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }}
            />
          ) : (
            <MenuIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }} />
          )}
        </IconButton>
      </div>

      {/* User card */}
      <div className={`sidebar-user ${isOpen ? "expanded" : ""}`}>
        <div className="sidebar-avatar">{initials}</div>
        {isOpen && (
          <div className="user-info">
            <span className="sidebar-name">{firstName}</span>
            <span className="sidebar-role">{roleAccount}</span>
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* Nav section label */}
      {isOpen && <span className="nav-section-label">Navigation</span>}

      {/* Menu */}
      <ul className="sidebar-menu">
        {navItem(
          "/view-accounts",
          <ManageAccounts sx={{ fontSize: 20 }} />,
          "Accounts",
        )}
        {showAdmin &&
          navItem(
            "/view-admin-accounts",
            <SupervisorAccount sx={{ fontSize: 20 }} />,
            "Admin Accounts",
          )}
        {navItem(
          "/attendance",
          <AssignmentInd sx={{ fontSize: 20 }} />,
          "Attendance",
        )}
      </ul>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Logout */}
      <div className="sidebar-divider" />
      <Tooltip title={!isOpen ? "Logout" : ""} placement="right" arrow>
        <div className="sidebar-logout" onClick={handleLogout}>
          <Logout sx={{ fontSize: 18, color: "#ff6b6b" }} />
          {isOpen && <span className="logout-label">Logout</span>}
        </div>
      </Tooltip>
    </div>
  );
}
