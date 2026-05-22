import "./attendance.css";
import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import {
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  Chip,
} from "@mui/material";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const formatDateTime = (dateTime) => {
  if (!dateTime) return null;
  const dateObj = new Date(dateTime);
  const hours = dateObj.getHours() % 12 || 12;
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";
  return `${hours}:${minutes} ${ampm}`;
};

export default function Attendance() {
  const [userData, setUserData] = React.useState([]);
  const [selectedRoles, setSelectedRoles] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const handleRoleChange = (event) => {
    setSelectedRoles(event.target.value);
  };

  const filteredData =
    selectedRoles === "" || selectedRoles === "UNFILTERED"
      ? userData
      : userData.filter((user) => user.role === selectedRoles);

  const timedInCount = userData.filter((u) => u.hasTimedIn).length;
  const timedOutCount = userData.filter((u) => u.hasTimedOut).length;

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 60,
      headerClassName: "tp-header",
    },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 190,
      headerClassName: "tp-header",
    },
    {
      field: "outlet",
      headerName: "Branch",
      width: 180,
      headerClassName: "tp-header",
      renderCell: (params) => (
        <span
          style={{
            fontSize: 13,
            color: params.value === "No Attendance" ? "#aaa" : "#222",
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 120,
      headerClassName: "tp-header",
    },
    {
      field: "timeIn",
      headerName: "Time In",
      width: 110,
      headerClassName: "tp-header",
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor:
              params.value === "No Time In" ? "#f5f5f5" : "#e3f8ff",
            color: params.value === "No Time In" ? "#aaa" : "#0077b6",
            fontWeight: 500,
            fontSize: 12,
            border: "none",
          }}
        />
      ),
    },
    {
      field: "timeOut",
      headerName: "Time Out",
      width: 110,
      headerClassName: "tp-header",
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor:
              params.value === "No Time Out" ? "#f5f5f5" : "#fff0f3",
            color: params.value === "No Time Out" ? "#aaa" : "#c9184a",
            fontWeight: 500,
            fontSize: 12,
            border: "none",
          }}
        />
      ),
    },
    {
      field: "action",
      headerName: "History",
      headerClassName: "tp-header",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Link
          to="/view-attendance"
          state={{ email: params.row.email }}
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonSearchIcon sx={{ fontSize: 14 }} />}
            sx={{
              backgroundColor: "#0aafeb",
              color: "#fff",
              fontSize: 12,
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#0096c7", boxShadow: "none" },
            }}
          >
            View
          </Button>
        </Link>
      ),
    },
  ];

  async function fetchCurrentAttendance(
    email,
    outlet,
    currentDate = new Date(),
  ) {
    const formattedDate = currentDate.toISOString().split("T")[0];
    try {
      const response = await axios.get(
        "https://api-trackpro.bmphrc.com/attendance/status",
        {
          params: { email, outlet, date: formattedDate },
        },
      );
      const data = response.data;
      return {
        hasTimedIn: data.hasTimedIn,
        hasTimedOut: data.hasTimedOut,
        timeIn: data.timeInTimestamp
          ? formatDateTime(data.timeInTimestamp)
          : "No Time In",
        timeOut: data.timeOutTimestamp
          ? formatDateTime(data.timeOutTimestamp)
          : "No Time Out",
        addressTimeIn: data.addressTimeIn,
        addressTimeOut: data.addressTimeOut,
      };
    } catch {
      return {
        hasTimedIn: false,
        hasTimedOut: false,
        timeIn: "No Time In",
        timeOut: "No Time Out",
        addressTimeIn: null,
        addressTimeOut: null,
      };
    }
  }

  const capitalizeWords = (words) => {
    if (!words || !Array.isArray(words)) return [];
    return words.map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "",
    );
  };

  async function getUser() {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://api-trackpro.bmphrc.com/get-all-user",
        { test: "test" },
      );
      const data = response.data.data;
      const loggedInBranch = localStorage.getItem("outlet");
      if (!loggedInBranch) return;
      const loggedInBranches = loggedInBranch.split(",").map((b) => b.trim());
      const currentDate = new Date();
      const displayDate = `${String(currentDate.getDate()).padStart(2, "0")}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${currentDate.getFullYear()}`;
      const processedUsers = [];

      for (const user of data) {
        const userOutlets = user.outlet || [];
        const matchingOutlets = userOutlets.filter((outlet) => {
          if (
            loggedInBranches.includes("Others") &&
            outlet.startsWith("Others:")
          )
            return true;
          return loggedInBranches.some((branch) => outlet.includes(branch));
        });
        if (matchingOutlets.length === 0) continue;

        const capitalizedNames = capitalizeWords([
          user.firstName,
          user.middleName || "",
          user.lastName,
        ]);
        let activeOutletData = null;
        let latestTimeIn = null;

        for (const outlet of matchingOutlets) {
          const attendance = await fetchCurrentAttendance(
            user.email,
            outlet,
            currentDate,
          );
          if (attendance.hasTimedIn) {
            try {
              const res = await axios.get(
                "https://api-trackpro.bmphrc.com/attendance/status",
                {
                  params: {
                    email: user.email,
                    outlet: outlet.startsWith("Others:") ? "Others" : outlet,
                    date: currentDate.toISOString().split("T")[0],
                  },
                },
              );
              const timeInTimestamp = res.data.timeInTimestamp;
              if (
                timeInTimestamp &&
                (!latestTimeIn ||
                  new Date(timeInTimestamp) > new Date(latestTimeIn))
              ) {
                latestTimeIn = timeInTimestamp;
                activeOutletData = { outlet, attendance };
              }
            } catch {}
          }
        }

        if (!activeOutletData) {
          const firstOutlet = matchingOutlets[0];
          const attendance = await fetchCurrentAttendance(
            user.email,
            firstOutlet,
            currentDate,
          );
          activeOutletData = { outlet: firstOutlet, attendance };
        }

        processedUsers.push({
          count: processedUsers.length + 1,
          role: user.role,
          fullName: `${capitalizedNames[0]} ${capitalizedNames[2]}`,
          email: user.email,
          outlet: activeOutletData.attendance.hasTimedIn
            ? activeOutletData.outlet
            : "No Attendance",
          date: displayDate,
          timeIn: activeOutletData.attendance.timeIn,
          timeOut: activeOutletData.attendance.timeOut,
          hasTimedIn: activeOutletData.attendance.hasTimedIn,
          hasTimedOut: activeOutletData.attendance.hasTimedOut,
        });
      }
      setUserData(processedUsers);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    getUser();
  }, []);

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="attendance">
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
              <h1 className="page-title">Attendance</h1>
              <p className="page-subtitle">{today}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#e3f8ff" }}>
                <PeopleAltIcon sx={{ color: "#0aafeb", fontSize: 22 }} />
              </div>
              <div>
                <div className="stat-value">{userData.length}</div>
                <div className="stat-label">Total Personnel</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#e6f9f0" }}>
                <AccessTimeIcon sx={{ color: "#2ecc71", fontSize: 22 }} />
              </div>
              <div>
                <div className="stat-value">{timedInCount}</div>
                <div className="stat-label">Timed In</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#fff0f3" }}>
                <CheckCircleOutlineIcon
                  sx={{ color: "#c9184a", fontSize: 22 }}
                />
              </div>
              <div>
                <div className="stat-value">{timedOutCount}</div>
                <div className="stat-label">Timed Out</div>
              </div>
            </div>
          </div>

          {/* Filter row */}
          <div className="filter-row">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedRoles}
                onChange={handleRoleChange}
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
              loading={loading}
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
              pageSizeOptions={[5, 10, 20, 50, 100]}
              getRowId={(row) => row.count}
              disableDensitySelector
              disableColumnFilter
              disableColumnSelector
              disableRowSelectionOnClick
              sx={{ minHeight: 400 }}
            />
          </Box>
        </Box>
      </Box>
    </div>
  );
}
