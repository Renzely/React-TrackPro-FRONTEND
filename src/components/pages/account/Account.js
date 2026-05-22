import "./account.css";
import * as React from "react";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import {
  Checkbox,
  Button,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Chip,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const BRANCHES = [
  "BMPOWER OFFICE",
  "Others",
  "RC OFFICE",
  "RC HUB",
  "CEBU OFFICE",
  "SIARGAO",
  "Branch",
  "UGC Tanay",
  "UGC Pasig City",
  "UGC Calamba",
  "UGC Pampanga",
  "UGC Davao",
  "UGC Lucena",
  "UGC Bicol",
  "UGC Tacloban",
  "UGC Pangasinan",
  "HOME",
];

export default function Account() {
  const [userData, setUserData] = React.useState([]);
  const [selectedRoles, setSelectedRoles] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [updateStatus, setUpdateStatus] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState("");
  const [modalFullName, setModalFullName] = React.useState("");
  const [modalBranch, setModalBranch] = React.useState("");
  const [modalEmail, setModalEmail] = React.useState("");
  const [modalPhone, setModalPhone] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedBranches, setSelectedBranches] = React.useState([]);
  const roleAccount = localStorage.getItem("roleAccount");
  const allowedRoles = [
    "ACCOUNT SUPERVISOR",
    "OPERATION OFFICER",
    "OPERATION HEAD",
    "COORDINATOR",
  ];
  const isAllowed = allowedRoles.includes(roleAccount);

  const filteredData =
    selectedRoles === "" || selectedRoles === "UNFILTERED"
      ? userData
      : userData.filter((u) => u.role === selectedRoles);

  const activeCount = userData.filter((u) => u.isActive).length;

  const capitalizeWords = (words) => {
    if (!words || !Array.isArray(words)) return [];
    return words.map((w) =>
      w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "",
    );
  };

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 60,
      headerClassName: "tp-header",
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
      width: 200,
      headerClassName: "tp-header",
    },
    {
      field: "role",
      headerName: "Client",
      width: 120,
      headerClassName: "tp-header",
    },
    {
      field: "contactNum",
      headerName: "Contact",
      width: 140,
      headerClassName: "tp-header",
    },
    {
      field: "outlet",
      headerName: "Outlets",
      width: 260,
      headerClassName: "tp-header",
      renderCell: (params) => {
        const val = Array.isArray(params.value)
          ? params.value.join(", ")
          : params.value || "";
        return <span style={{ fontSize: 12, color: "#555" }}>{val}</span>;
      },
    },
    {
      field: "isActive",
      headerName: "Status",
      headerClassName: "tp-header",
      width: 120,
      renderCell: (params) => {
        const status = params.row.isActive;
        const onClick = () => {
          if (!isAllowed) return;
          setUpdateStatus(!status);
          setUserEmail(params.row.emailAddress);
          setOpenDialog(true);
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
              cursor: isAllowed ? "pointer" : "default",
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
      width: 90,
      renderCell: (params) => {
        const onClick = () => {
          const m = params.row.middleName;
          const fn =
            m && m !== "Null"
              ? `${params.row.firstName} ${m} ${params.row.lastName}`
              : `${params.row.firstName} ${params.row.lastName}`;
          setModalFullName(fn);
          setModalBranch(params.row.outlet);
          setModalEmail(params.row.emailAddress);
          setModalPhone(params.row.contactNum);
          setOpenModal(true);
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
              minWidth: 36,
              textTransform: "none",
              "&:hover": { backgroundColor: "#0096c7", boxShadow: "none" },
            }}
          >
            <PersonIcon sx={{ fontSize: 16 }} />
          </Button>
        );
      },
    },
  ];

  async function getUser() {
    try {
      const loggedInBranch = localStorage.getItem("outlet") || "";
      const loggedInBranches = loggedInBranch.split(",").map((o) => o.trim());
      const response = await axios.post(
        "https://api-trackpro.bmphrc.com/get-all-user",
      );
      const data = response.data.data;
      const filteredData = data.filter((item) =>
        loggedInBranches.some((o) => item.outlet?.includes(o)),
      );
      const newData = filteredData.map((d, key) => {
        const names = capitalizeWords([
          d.firstName,
          d.middleName || "",
          d.lastName,
        ]);
        return {
          count: key + 1,
          role: d.role,
          outlet: d.outlet,
          firstName: names[0],
          middleName: names[1] || "Null",
          lastName: names[2],
          emailAddress: d.email,
          contactNum: d.contactNumber,
          isActive: d.isVerified,
        };
      });
      setUserData(newData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function setStatus() {
    try {
      const response = await axios.put(
        "https://api-trackpro.bmphrc.com/update-user-status",
        { email: userEmail, isVerified: updateStatus },
      );
      if (response.data.status === 200) window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleBranchSave = async () => {
    try {
      await axios.put("https://api-trackpro.bmphrc.com/update-user-branch", {
        email: modalEmail,
        outlet: selectedBranches,
      });
      getUser();
      setTimeout(() => window.location.reload(), 800);
      setOpenModal(false);
    } catch (error) {
      console.error("Error updating branches:", error);
    }
  };

  React.useEffect(() => {
    getUser();
    const saved = JSON.parse(localStorage.getItem("selectedBranches"));
    if (Array.isArray(saved)) setSelectedBranches(saved);
  }, []);

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
              <h1 className="page-title">Accounts</h1>
              <p className="page-subtitle">Manage field personnel accounts</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#e3f8ff" }}>
                <PeopleAltIcon sx={{ color: "#0aafeb", fontSize: 22 }} />
              </div>
              <div>
                <div className="stat-value">{userData.length}</div>
                <div className="stat-label">Total Accounts</div>
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

          {/* Filter */}
          <div className="filter-row">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedRoles}
                onChange={(e) => setSelectedRoles(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  fontSize: 13,
                }}
              >
                <MenuItem value="" disabled>
                  Filter by Client
                </MenuItem>
                <MenuItem value="UNFILTERED">All Clients</MenuItem>
                <MenuItem value="RC">RC Sales Agent</MenuItem>
                <MenuItem value="UGC">UGC Personnel</MenuItem>
                <MenuItem value="BMP">BMPOWER</MenuItem>
              </Select>
            </FormControl>
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
              rows={filteredData}
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
              pageSizeOptions={[5, 10, 20, 50, 100]}
              getRowId={(row) => row.count}
              disableRowSelectionOnClick
              sx={{ minHeight: 400 }}
            />
          </Box>

          {/* Detail Modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
                Account Details
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2.5 }}>
                {modalEmail}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  value={modalFullName}
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <TextField
                  label="Email"
                  value={modalEmail}
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <TextField
                  label="Contact Number"
                  value={modalPhone}
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <TextField
                  label="Current Outlets"
                  value={
                    Array.isArray(modalBranch)
                      ? modalBranch.join(", ")
                      : modalBranch || ""
                  }
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={[...new Set(BRANCHES)]}
                  value={selectedBranches}
                  onChange={(e, v) => {
                    setSelectedBranches(v);
                    localStorage.setItem("selectedBranches", JSON.stringify(v));
                  }}
                  getOptionLabel={(o) => o}
                  isOptionEqualToValue={(o, v) => o === v}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Outlets"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      }}
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox style={{ marginRight: 8 }} checked={selected} />
                      {option}
                    </li>
                  )}
                />
                <Stack direction="row" spacing={1.5}>
                  <Button
                    onClick={() => setSelectedBranches(BRANCHES)}
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
                    onClick={() => setSelectedBranches([])}
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
                <Button
                  onClick={handleBranchSave}
                  variant="contained"
                  sx={{
                    backgroundColor: "#0aafeb",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#0096c7",
                      boxShadow: "none",
                    },
                  }}
                >
                  Save Outlet Changes
                </Button>
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
                  Close
                </Button>
              </Stack>
            </Box>
          </Modal>

          {/* Status Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            PaperProps={{ sx: { borderRadius: "16px" } }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>
              Change Account Status
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {updateStatus
                  ? "Set this account to Active?"
                  : "Set this account to Inactive?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: "12px 20px" }}>
              <Button
                onClick={() => setOpenDialog(false)}
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
