import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Inventory,
  AssignmentInd,
  ManageAccounts,
  Logout,
  SupervisorAccount,
  AssignmentReturn,
  Store,
  Checklist,
} from "@mui/icons-material";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { Avatar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AutoDeleteIcon from "@mui/icons-material/AutoDelete";
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
    // Removed the line that closes the sidebar
    // setOpen(false); // This was causing the sidebar to close on navigation
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const roleAccount = localStorage.getItem("roleAccount");
  const firstName = localStorage.getItem("firstName");

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Toggle Button */}
      <div className="sidebar-header">
        <IconButton onClick={toggleSidebar} className="menu-button">
          <MenuIcon sx={{ color: "white" }} />
        </IconButton>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <Avatar
          className="sidebar-avatar"
          sx={{ color: "black", backgroundColor: "#90e0ef" }}
        />
        {isOpen && (
          <div className="user-info">
            <Typography variant="body1" className="sidebar-name">
              {firstName}
            </Typography>
            <Typography variant="body2" className="sidebar-role">
              {roleAccount}
            </Typography>
          </div>
        )}
      </div>

      {/* Divider Line */}
      <hr className="sidebar-divider" />

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        <NavLink
          to="/view-accounts"
          onClick={() => handleItemClick("/view-accounts")}
        >
          <li className={activeItem === "/view-accounts" ? "active" : ""}>
            <ManageAccounts className="sidebar-icon" /> {isOpen && "Accounts"}
          </li>
        </NavLink>

        {[
          "ACCOUNT SUPERVISOR",
          "OPERATION OFFICER",
          "OPERATION HEAD",
          "SENIOR OPERATION MANAGER",
        ].includes(roleAccount) && (
          <NavLink
            to="/view-admin-accounts"
            onClick={() => handleItemClick("/view-admin-accounts")}
          >
            <li
              className={activeItem === "/view-admin-accounts" ? "active" : ""}
            >
              <SupervisorAccount className="sidebar-icon" />{" "}
              {isOpen && "Admin Accounts"}
            </li>
          </NavLink>
        )}
        <NavLink
          to="/attendance"
          onClick={() => handleItemClick("/attendance")}
        >
          <li className={activeItem === "/attendance" ? "active" : ""}>
            <AssignmentInd className="sidebar-icon" /> {isOpen && "Attendance"}
          </li>
        </NavLink>

        <NavLink
          to="/view-competitors"
          onClick={() => handleItemClick("/view-competitors")}
        >
          <li className={activeItem === "/view-competitors" ? "active" : ""}>
            <WarehouseIcon className="sidebar-icon" /> {isOpen && "Competitors"}
          </li>
        </NavLink>

        <NavLink to="/view-VET" onClick={() => handleItemClick("/view-VET")}>
          <li className={activeItem === "/view-VET" ? "active" : ""}>
            <Checklist className="sidebar-icon" /> {isOpen && "VET"}
          </li>
        </NavLink>
        <NavLink to="/view-PSR" onClick={() => handleItemClick("/view-PSR")}>
          <li className={activeItem === "/view-PSR" ? "active" : ""}>
            <Checklist className="sidebar-icon" /> {isOpen && "PSR"}
          </li>
        </NavLink>

        <NavLink
          to="/view-Expiry"
          onClick={() => handleItemClick("/view-Expiry")}
        >
          <li className={activeItem === "/view-Expiry" ? "active" : ""}>
            <AutoDeleteIcon className="sidebar-icon" /> {isOpen && "Expiry"}
          </li>
        </NavLink>

        {/* Logout */}
        <li className="logout" onClick={handleLogout}>
          <Logout className="sidebar-icon" /> {isOpen && "Logout"}
        </li>
      </ul>
    </div>
  );
}
