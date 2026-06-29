import "./admin.css";
import * as React from "react";
import { useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Checkbox, Autocomplete, Chip } from "@mui/material";
import axios from "axios";
import { Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Swal from "sweetalert2";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { ACCOUNT_OUTLETS, ACCOUNT_NAMES } from "../account/outletData.js";

export default function Admin() {
  const [userData, setUserData] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openStatusDialog, setOpenStatusDialog] = React.useState(false);
  const [openViewModal, setOpenViewModal] = React.useState(false);
  const [updateStatus, setUpdateStatus] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState();
  const [inputOtpCode, setInputOtpCode] = React.useState();
  const [inputOtpCodeError, setInputOtpCodeError] = React.useState();
  const [adminSelectedRole, setSelectedRole] = React.useState("");
  const [adminFirstName, setAdminFirstName] = React.useState("");
  const [adminMiddleName, setAdminMiddleName] = React.useState("");
  const [adminLastName, setAdminLastName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPhone, setAdminPhone] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = React.useState("");
  const [adminViewBranch, setAdminViewBranch] = React.useState("");
  const [adminViewFullName, setAdminViewFullName] = React.useState("");
  const [adminViewEmail, setAdminViewEmail] = React.useState("");
  const [adminViewPhone, setAdminViewPhone] = React.useState("");

  // ── Add Admin: multiple accounts + combined outlets ──
  const [addAccounts, setAddAccounts] = useState([]);
  const [addOutlets, setAddOutlets] = useState([]);

  // ── View/Edit Modal: multiple accounts + combined outlets ──
  const [viewAccounts, setViewAccounts] = useState([]);
  const [viewOutlets, setViewOutlets] = useState([]);

  // Errors
  const [adminFirstNameError, setAdminFirstNameError] = React.useState("");
  const [adminLastNameError, setAdminLastNameError] = React.useState("");
  const [adminEmailError, setAdminEmailError] = React.useState("");
  const [adminPasswordError, setAdminPasswordError] = React.useState("");
  const [adminConfirmPasswordError, setAdminConfirmPasswordError] =
    React.useState("");

  const requestBody = { isVerified: updateStatus, emailAddress: userEmail };
  const activeCount = userData.filter((u) => u.isVerified).length;

  // Combined outlet pool based on selected accounts
  const addOutletPool = [
    ...new Set(addAccounts.flatMap((acc) => ACCOUNT_OUTLETS[acc] ?? [])),
  ];
  const viewOutletPool = [
    ...new Set(viewAccounts.flatMap((acc) => ACCOUNT_OUTLETS[acc] ?? [])),
  ];

  // When accounts change, drop outlets that no longer belong to any selected account
  const handleAddAccountsChange = (_, newAccounts) => {
    const newPool = [
      ...new Set(newAccounts.flatMap((acc) => ACCOUNT_OUTLETS[acc] ?? [])),
    ];
    setAddAccounts(newAccounts);
    setAddOutlets((prev) => prev.filter((o) => newPool.includes(o)));
  };

  const handleViewAccountsChange = (_, newAccounts) => {
    const newPool = [
      ...new Set(newAccounts.flatMap((acc) => ACCOUNT_OUTLETS[acc] ?? [])),
    ];
    setViewAccounts(newAccounts);
    setViewOutlets((prev) => prev.filter((o) => newPool.includes(o)));
  };

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 60,
      headerClassName: "tp-header",
    },
    {
      field: "roleAccount",
      headerName: "Role",
      width: 180,
      headerClassName: "tp-header",
    },
    {
      field: "outlet",
      headerName: "Outlet",
      width: 220,
      headerClassName: "tp-header",
      renderCell: (p) => (
        <span style={{ fontSize: 12, color: "#555" }}>
          {Array.isArray(p.value) ? p.value.join(", ") : p.value}
        </span>
      ),
    },
    {
      field: "firstName",
      headerName: "First Name",
      width: 130,
      headerClassName: "tp-header",
    },
    {
      field: "middleName",
      headerName: "Middle Name",
      width: 130,
      headerClassName: "tp-header",
    },
    {
      field: "lastName",
      headerName: "Last Name",
      width: 130,
      headerClassName: "tp-header",
    },
    {
      field: "emailAddress",
      headerName: "Email",
      width: 220,
      headerClassName: "tp-header",
    },
    {
      field: "isVerified",
      headerName: "Status",
      headerClassName: "tp-header",
      width: 120,
      renderCell: (params) => {
        const status = params.row.isVerified;
        const onClick = () => {
          status ? setUpdateStatus(false) : setUpdateStatus(true);
          setUserEmail(params.row.emailAddress);
          setOpenStatusDialog(true);
        };
        return (
          <Chip
            label={status ? "Active" : "Inactive"}
            size="small"
            icon={
              status ? (
                <CheckCircleIcon sx={{ fontSize: 14 }} />
              ) : (
                <CancelIcon sx={{ fontSize: 14 }} />
              )
            }
            onClick={onClick}
            sx={{
              backgroundColor: status ? "#e6f9f0" : "#fff0f3",
              color: status ? "#059669" : "#c9184a",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
              border: `1px solid ${status ? "#a7f3d0" : "#fecdd3"}`,
              "& .MuiChip-icon": { color: status ? "#059669" : "#c9184a" },
            }}
          />
        );
      },
    },
    {
      field: "action",
      headerName: "Details",
      headerClassName: "tp-header",
      width: 100,
      renderCell: (params) => {
        const onClick = () => {
          const m = params.row.middleName;
          const fn =
            m && m !== "Null"
              ? `${params.row.firstName} ${m} ${params.row.lastName}`
              : `${params.row.firstName} ${params.row.lastName}`;
          const existingOutlets = Array.isArray(params.row.outlet)
            ? params.row.outlet
            : [];
          // Auto-detect which accounts the existing outlets belong to
          const matchedAccounts = ACCOUNT_NAMES.filter((acc) =>
            existingOutlets.some((o) => ACCOUNT_OUTLETS[acc]?.includes(o)),
          );
          setAdminViewBranch(existingOutlets);
          setAdminViewFullName(fn);
          setAdminViewEmail(params.row.emailAddress);
          setAdminViewPhone(params.row.contactNum);
          setViewAccounts(matchedAccounts);
          setViewOutlets(existingOutlets);
          setOpenViewModal(true);
        };
        return (
          <Button
            variant="contained"
            size="small"
            onClick={onClick}
            sx={{
              backgroundColor: "#0aafeb",
              color: "#fff",
              borderRadius: "8px",
              boxShadow: "none",
              textTransform: "none",
              fontSize: 12,
              "&:hover": { backgroundColor: "#0096c7", boxShadow: "none" },
            }}
          >
            View
          </Button>
        );
      },
    },
  ];

  async function getUser() {
    try {
      const response = await axios.post(
        "https://api-trackpro.bmphrc.com/get-admin-user",
        requestBody,
      );
      const data = response.data.data;
      setUserData(
        data.map((user, index) => ({
          count: index + 1,
          roleAccount: user.roleAccount,
          firstName: user.firstName,
          middleName: user.middleName || "Null",
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          contactNum: user.contactNum,
          outlet: user.outlet || [],
          isVerified: user.isVerified,
        })),
      );
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  }

  async function setStatus() {
    await axios.put(
      "https://api-trackpro.bmphrc.com/update-admin-status",
      requestBody,
    );
    window.location.reload();
  }

  async function sendOtp() {
    if (!adminSelectedRole) {
      Swal.fire({ title: "Select a Role", icon: "warning" });
      return;
    }
    if (!addAccounts.length) {
      Swal.fire({ title: "Select at least one Account", icon: "warning" });
      return;
    }
    if (!addOutlets.length) {
      Swal.fire({ title: "Select at least one Outlet", icon: "warning" });
      return;
    }
    try {
      const res = await axios.post("https://api-trackpro.bmphrc.com/send-otp", {
        email: adminEmail,
      });
      if (res.data.status === 200) {
        setOtpCode(res.data.code);
        setOpenDialog(true);
      } else Swal.fire({ title: "OTP Failed", icon: "error" });
    } catch (error) {
      Swal.fire({ title: "Error", text: error.message, icon: "error" });
    }
  }

  async function confirmOtp() {
    if (otpCode === inputOtpCode) {
      const userDetails = {
        roleAccount: adminSelectedRole,
        outlet: addOutlets,
        firstName: adminFirstName,
        middleName: adminMiddleName,
        lastName: adminLastName,
        contactNum: adminPhone,
        emailAddress: adminEmail,
        password: adminPassword,
      };
      try {
        const res = await axios.post(
          "https://api-trackpro.bmphrc.com/register-user-admin",
          userDetails,
        );
        if (res.data.status === 200) {
          Swal.fire({
            title: "Success",
            text: "Admin created!",
            icon: "success",
            confirmButtonColor: "#0aafeb",
          }).then(() => window.location.reload());
        }
      } catch {}
    } else {
      setInputOtpCodeError("OTP code does not match.");
    }
  }

  const handleBranchSave = async (email) => {
    // ── validate FIRST, before saving ──
    if (viewAccounts.length === 0) {
      Swal.fire({ title: "Select at least one Account", icon: "warning" });
      return;
    }
    if (viewOutlets.length === 0) {
      Swal.fire({ title: "Select at least one Outlet", icon: "warning" });
      return;
    }

    // ── only runs if validation passed ──
    try {
      await axios.put("https://api-trackpro.bmphrc.com/update-admin-outlet", {
        emailAddress: email,
        outlet: viewOutlets,
      });
      setOpenViewModal(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error("Error updating branches:", error);
    }
  };

  React.useEffect(() => {
    getUser();
  }, []);

  const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };

  return (
    <div className="account">
      <Topbar />
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            padding: { xs: "16px", sm: "24px" },
            backgroundColor: "#f0f4f8",
            minHeight: "calc(100vh - 58px)",
          }}
        >
          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Accounts</h1>
              <p className="page-subtitle">
                Manage administrator and coordinator accounts
              </p>
            </div>
            <Button
              onClick={() => setOpenModal(true)}
              variant="contained"
              startIcon={<PersonAddAlt1Icon />}
              sx={{
                backgroundColor: "#0aafeb",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#0096c7", boxShadow: "none" },
              }}
            >
              Add Admin
            </Button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#e3f8ff" }}>
                <SupervisorAccountIcon
                  sx={{ color: "#0aafeb", fontSize: 22 }}
                />
              </div>
              <div>
                <div className="stat-value">{userData.length}</div>
                <div className="stat-label">Total Admins</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#e6f9f0" }}>
                <CheckCircleIcon sx={{ color: "#059669", fontSize: 22 }} />
              </div>
              <div>
                <div className="stat-value">{activeCount}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#fff0f3" }}>
                <CancelIcon sx={{ color: "#c9184a", fontSize: 22 }} />
              </div>
              <div>
                <div className="stat-value">
                  {userData.length - activeCount}
                </div>
                <div className="stat-label">Inactive</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #e8ecf0",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
              "& .MuiDataGrid-root": {
                border: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              },
              "& .tp-header": {
                backgroundColor: "#f8fafc",
                color: "#374151",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f0f8ff" },
              "& .MuiDataGrid-cell": { borderColor: "#f0f4f8" },
              "& .MuiDataGrid-columnSeparator": { display: "none" },
              "& .MuiDataGrid-toolbarContainer": {
                padding: "12px 16px",
                borderBottom: "1px solid #f0f4f8",
              },
            }}
          >
            <DataGrid
              rows={userData}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: true },
                },
              }}
              loading={!userData.length}
              disableDensitySelector
              disableColumnFilter
              disableColumnSelector
              pageSizeOptions={[5, 10, 20, 50]}
              getRowId={(row) => row.count}
              disableRowSelectionOnClick
              sx={{ minHeight: 400 }}
            />
          </Box>

          {/* ── View / Edit Modal ── */}
          <Modal open={openViewModal} onClose={() => setOpenViewModal(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "92%", sm: 500 },
                maxHeight: "88vh",
                overflowY: "auto",
                backgroundColor: "#fff",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
              >
                Admin Details
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2.5 }}>
                {adminViewEmail}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  value={adminViewFullName}
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  sx={inputSx}
                />
                <TextField
                  label="Email"
                  value={adminViewEmail}
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  sx={inputSx}
                />
                <TextField
                  label="Contact"
                  value={adminViewPhone}
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  sx={inputSx}
                />
                <TextField
                  label="Current Outlets"
                  value={
                    Array.isArray(adminViewBranch)
                      ? adminViewBranch.join(", ")
                      : adminViewBranch || ""
                  }
                  InputProps={{ readOnly: true }}
                  size="small"
                  multiline
                  rows={2}
                  fullWidth
                  sx={inputSx}
                />

                {/* ── Step 1: Accounts (multi-select) ── */}
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ACCOUNT_NAMES}
                  value={viewAccounts}
                  onChange={handleViewAccountsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Accounts"
                      size="small"
                      sx={inputSx}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox style={{ marginRight: 8 }} checked={selected} />
                      {option}
                    </li>
                  )}
                />

                {/* ── Step 2: Combined Outlets ── */}
                {viewAccounts.length > 0 && (
                  <>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", mt: -1 }}
                    >
                      Showing outlets from: {viewAccounts.join(", ")}
                    </Typography>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={viewOutletPool}
                      value={viewOutlets}
                      onChange={(_, v) => setViewOutlets(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Outlets"
                          size="small"
                          sx={inputSx}
                        />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option}
                        </li>
                      )}
                    />
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        onClick={() => setViewOutlets(viewOutletPool)}
                        variant="contained"
                        size="small"
                        sx={{
                          flex: 1,
                          backgroundColor: "#0aafeb",
                          borderRadius: "10px",
                          textTransform: "none",
                          boxShadow: "none",
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => setViewOutlets([])}
                        variant="contained"
                        size="small"
                        sx={{
                          flex: 1,
                          backgroundColor: "#ef4444",
                          borderRadius: "10px",
                          textTransform: "none",
                          boxShadow: "none",
                        }}
                      >
                        Clear All
                      </Button>
                    </Stack>
                  </>
                )}

                <Button
                  onClick={() => handleBranchSave(adminViewEmail)}
                  variant="contained"
                  sx={{
                    backgroundColor: "#0aafeb",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setOpenViewModal(false)}
                  variant="outlined"
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                  }}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          </Modal>

          {/* ── Add Admin Modal ── */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "92%", sm: 520 },
                maxHeight: "90vh",
                overflowY: "auto",
                backgroundColor: "#fff",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#0f172a", mb: 2.5 }}
              >
                Add New Admin
              </Typography>
              <Stack spacing={2}>
                {/* Role */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={adminSelectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    label="Role"
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="HR OFFICER">HR Officer</MenuItem>
                    <MenuItem value="HR HEAD">HR Head</MenuItem>
                    <MenuItem value="ACCOUNT SUPERVISOR">
                      Account Supervisor
                    </MenuItem>
                    <MenuItem value="OPERATION DIRECTOR">
                      Operation Director
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* ── Step 1: Accounts (multi-select) ── */}
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ACCOUNT_NAMES}
                  value={addAccounts}
                  onChange={handleAddAccountsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Accounts"
                      size="small"
                      sx={inputSx}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox style={{ marginRight: 8 }} checked={selected} />
                      {option}
                    </li>
                  )}
                />

                {/* ── Step 2: Combined Outlets ── */}
                {addAccounts.length > 0 ? (
                  <>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", mt: -1 }}
                    >
                      Showing outlets from: {addAccounts.join(", ")}
                    </Typography>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={addOutletPool}
                      value={addOutlets}
                      onChange={(_, v) => setAddOutlets(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Outlets"
                          size="small"
                          sx={inputSx}
                        />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option}
                        </li>
                      )}
                    />
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        onClick={() => setAddOutlets(addOutletPool)}
                        variant="contained"
                        size="small"
                        sx={{
                          flex: 1,
                          backgroundColor: "#0aafeb",
                          borderRadius: "10px",
                          textTransform: "none",
                          boxShadow: "none",
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => setAddOutlets([])}
                        variant="contained"
                        size="small"
                        sx={{
                          flex: 1,
                          backgroundColor: "#ef4444",
                          borderRadius: "10px",
                          textTransform: "none",
                          boxShadow: "none",
                        }}
                      >
                        Clear All
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <TextField
                    label="Outlets"
                    size="small"
                    disabled
                    fullWidth
                    placeholder="Select an Account first"
                    sx={inputSx}
                  />
                )}

                {/* Name fields */}
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="First Name"
                    size="small"
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    error={!!adminFirstNameError}
                    helperText={adminFirstNameError}
                    sx={{ flex: 1, ...inputSx }}
                  />
                  <TextField
                    label="Last Name"
                    size="small"
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    error={!!adminLastNameError}
                    helperText={adminLastNameError}
                    sx={{ flex: 1, ...inputSx }}
                  />
                </Stack>
                <TextField
                  label="Middle Name"
                  size="small"
                  value={adminMiddleName}
                  onChange={(e) => setAdminMiddleName(e.target.value)}
                  fullWidth
                  sx={inputSx}
                />
                <TextField
                  label="Email"
                  size="small"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  error={!!adminEmailError}
                  helperText={adminEmailError}
                  fullWidth
                  sx={inputSx}
                />
                <TextField
                  label="Contact Number"
                  size="small"
                  value={adminPhone}
                  type="number"
                  onChange={(e) => {
                    if (e.target.value.length <= 11)
                      setAdminPhone(e.target.value);
                  }}
                  fullWidth
                  sx={{
                    ...inputSx,
                    "& input::-webkit-outer-spin-button,& input::-webkit-inner-spin-button":
                      { display: "none" },
                  }}
                />
                <TextField
                  label="Password"
                  size="small"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  error={!!adminPasswordError}
                  helperText={adminPasswordError}
                  fullWidth
                  sx={inputSx}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  size="small"
                  value={adminConfirmPassword}
                  onChange={(e) => {
                    setAdminConfirmPassword(e.target.value);
                    setAdminConfirmPasswordError(
                      e.target.value !== adminPassword
                        ? "Passwords do not match"
                        : "",
                    );
                  }}
                  error={!!adminConfirmPasswordError}
                  helperText={adminConfirmPasswordError}
                  type="password"
                  fullWidth
                  sx={inputSx}
                />

                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button
                    onClick={() => setOpenModal(false)}
                    variant="outlined"
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      borderColor: "#e2e8f0",
                      color: "#64748b",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendOtp}
                    variant="contained"
                    sx={{
                      backgroundColor: "#0aafeb",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "none",
                    }}
                  >
                    Send OTP & Create
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Modal>

          {/* OTP Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            PaperProps={{ sx: { borderRadius: "16px", padding: "8px" } }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>Enter OTP Code</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                A 4-digit OTP was sent to {adminEmail}
              </Typography>
              <TextField
                value={inputOtpCode}
                error={!!inputOtpCodeError}
                helperText={inputOtpCodeError}
                type="number"
                onChange={(e) => {
                  if (e.target.value.length <= 4)
                    setInputOtpCode(e.target.value);
                }}
                size="small"
                fullWidth
                placeholder="_ _ _ _"
                sx={{
                  "& input": {
                    textAlign: "center",
                    fontSize: 22,
                    letterSpacing: 12,
                    fontWeight: 700,
                  },
                  ...inputSx,
                  "& input::-webkit-outer-spin-button,& input::-webkit-inner-spin-button":
                    { display: "none" },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ padding: "8px 20px 16px" }}>
              <Button
                onClick={() => setOpenDialog(false)}
                sx={{ textTransform: "none", borderRadius: "8px" }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmOtp}
                variant="contained"
                sx={{
                  backgroundColor: "#0aafeb",
                  textTransform: "none",
                  borderRadius: "8px",
                  boxShadow: "none",
                }}
              >
                Create Admin
              </Button>
            </DialogActions>
          </Dialog>

          {/* Status Dialog */}
          <Dialog
            open={openStatusDialog}
            onClose={() => setOpenStatusDialog(false)}
            PaperProps={{ sx: { borderRadius: "16px" } }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>
              Change Account Status
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {updateStatus
                  ? "Activate this account?"
                  : "Deactivate this account?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: "12px 20px" }}>
              <Button
                onClick={() => setOpenStatusDialog(false)}
                sx={{ textTransform: "none", borderRadius: "8px" }}
              >
                Cancel
              </Button>
              <Button
                onClick={setStatus}
                variant="contained"
                sx={{
                  backgroundColor: "#0aafeb",
                  textTransform: "none",
                  borderRadius: "8px",
                  boxShadow: "none",
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </div>
  );
}
