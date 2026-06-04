import "./attendance.css";
import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import {
  Button,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Autocomplete,
  TextField,
  Checkbox,
} from "@mui/material";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const XLSX = require("sheetjs-style");
const BASE_URL = "https://api-trackpro.bmphrc.com";

const formatDateTime = (dateTime) => {
  if (!dateTime) return null;
  const dateObj = new Date(dateTime);
  const hours = dateObj.getHours() % 12 || 12;
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";
  return `${hours}:${minutes} ${ampm}`;
};

const formatDateDisplay = (dateTime) => {
  if (!dateTime) return { date: "N/A", time: "N/A" };
  const d = new Date(dateTime);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours() % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${minutes} ${ampm}`,
  };
};

export default function Attendance() {
  const [userData, setUserData] = React.useState([]);
  const [selectedRoles, setSelectedRoles] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // ── Export panel state ───────────────────────────────────────────────────
  const [allUsers, setAllUsers] = React.useState([]);
  const [exportUsers, setExportUsers] = React.useState([]); // ← array now
  const [dateBegin, setDateBegin] = React.useState(null);
  const [dateEnd, setDateEnd] = React.useState(null);
  const [exporting, setExporting] = React.useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  const handleRoleChange = (event) => setSelectedRoles(event.target.value);

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
      const response = await axios.get(`${BASE_URL}/attendance/status`, {
        params: { email, outlet, date: formattedDate },
      });
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

  const getUser = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/get-all-user`, {
        test: "test",
      });
      const data = response.data.data;

      const loggedInBranch = localStorage.getItem("outlet");
      if (!loggedInBranch) return;
      const loggedInBranches = loggedInBranch.split(",").map((b) => b.trim());
      const currentDate = new Date();
      const displayDate = `${String(currentDate.getDate()).padStart(2, "0")}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${currentDate.getFullYear()}`;
      const processedUsers = [];
      const exportableUsers = [];

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
        const fullName = `${capitalizedNames[0]} ${capitalizedNames[2]}`;

        exportableUsers.push({
          label: `${fullName} — ${user.email}`,
          email: user.email,
          fullName,
        });

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
              const res = await axios.get(`${BASE_URL}/attendance/status`, {
                params: {
                  email: user.email,
                  outlet: outlet.startsWith("Others:") ? "Others" : outlet,
                  date: currentDate.toISOString().split("T")[0],
                },
              });
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
          fullName,
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
      setAllUsers(exportableUsers);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getUser();
  }, [getUser]);

  // ── Export handler (multi-user, one sheet per user) ───────────────────
  const handleExport = async () => {
    if (!exportUsers.length) {
      alert("Please select at least one user to export.");
      return;
    }
    if (!dateBegin || !dateEnd) {
      alert("Please select both start and end dates.");
      return;
    }

    const bDate = new Date(dateBegin.$d);
    bDate.setHours(0, 0, 0, 0);
    const eDate = new Date(dateEnd.$d);
    eDate.setHours(23, 59, 59, 999);

    if (bDate > eDate) {
      alert("End date must be the same or later than start date.");
      return;
    }

    const startDateStr = bDate.toISOString().split("T")[0];
    const endDateStr = eDate.toISOString().split("T")[0];

    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const headers = [
        "#",
        "Merchandiser",
        "Date",
        "Time In",
        "Time In Location",
        "Time In Photo",
        "Time Out",
        "Time Out Location",
        "Time Out Photo",
        "Outlet",
      ];

      let anyData = false;

      for (const user of exportUsers) {
        const attendanceRes = await axios.post(`${BASE_URL}/get-attendance`, {
          email: user.email,
          start: startDateStr,
          end: endDateStr,
        });

        const logs = attendanceRes.data.data;

        // Still add an empty sheet so the user knows this person had no data
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

        if (logs?.length) {
          anyData = true;
          const exportRows = logs.map((log, idx) => ({
            count: idx + 1,
            fullName: user.fullName,
            date: formatDateDisplay(log.date)?.date ?? "N/A",
            timeIn: log.timeIn
              ? formatDateDisplay(log.timeIn)?.time
              : "No Time In",
            timeInLocation: log.timeInLocation ?? "No location",
            timeInPhoto: log.timeInSelfieUrl ?? "",
            timeOut: log.timeOut
              ? formatDateDisplay(log.timeOut)?.time
              : "No Time Out",
            timeOutLocation: log.timeOutLocation ?? "No location",
            timeOutPhoto: log.timeOutSelfieUrl ?? "",
            outlet: log.outlet ?? "Unknown Outlet",
          }));

          XLSX.utils.sheet_add_json(ws, exportRows, {
            origin: "A2",
            skipHeader: true,
          });

          ws["!cols"] = headers.map((h, i) => {
            const key = Object.keys(exportRows[0])[i];
            const max = Math.max(
              h.length,
              ...exportRows.map((r) => r[key]?.toString().length || 0),
            );
            return { wch: max + 2 };
          });
        } else {
          // No data row
          XLSX.utils.sheet_add_aoa(
            ws,
            [["No attendance data for this date range."]],
            { origin: "A2" },
          );
          ws["!cols"] = headers.map(() => ({ wch: 20 }));
        }

        // Style header row
        headers.forEach((_, c) => {
          const addr = XLSX.utils.encode_cell({ r: 0, c });
          if (ws[addr])
            ws[addr].s = {
              font: { bold: true },
              alignment: { horizontal: "center", vertical: "center" },
            };
        });

        // Sheet name: first 31 chars of name (Excel sheet name limit)
        const sheetName = user.fullName.slice(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      if (!anyData && exportUsers.length === 1) {
        alert("No attendance data found for the selected user and date range.");
        return;
      }

      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      const fileName =
        exportUsers.length === 1
          ? `TrackPro_${exportUsers[0].fullName.replace(/ /g, "_")}_${startDateStr}_to_${endDateStr}.xlsx`
          : `TrackPro_Attendance_${startDateStr}_to_${endDateStr}.xlsx`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Error exporting data. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const inputSx = {
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  };

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

          {/* ── Export Panel ── */}
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "14px",
              padding: "16px 20px",
              border: "1px solid #e8ecf0",
              marginBottom: "20px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            {/* Panel title + selected count badge */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FileDownloadIcon sx={{ color: "#0aafeb", fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                Export Attendance to Excel
              </span>
              {exportUsers.length > 0 && (
                <Chip
                  label={`${exportUsers.length} selected`}
                  size="small"
                  sx={{
                    backgroundColor: "#e3f8ff",
                    color: "#0077b6",
                    fontWeight: 600,
                    fontSize: 11,
                    ml: 0.5,
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              {/* Multi-user picker */}
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={allUsers}
                value={exportUsers}
                onChange={(_, v) => setExportUsers(v)}
                getOptionLabel={(o) => o.label}
                isOptionEqualToValue={(o, v) => o.email === v.email}
                sx={{ minWidth: 320, flex: 1 }}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    {option.label}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.fullName}
                      size="small"
                      {...getTagProps({ index })}
                      sx={{
                        backgroundColor: "#e3f8ff",
                        color: "#0077b6",
                        fontWeight: 500,
                        fontSize: 11,
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Users"
                    size="small"
                    placeholder={
                      exportUsers.length === 0 ? "Search and select users…" : ""
                    }
                    sx={inputSx}
                  />
                )}
              />

              {/* Select All / Clear All shortcuts */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setExportUsers(allUsers)}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: 12,
                    borderColor: "#0aafeb",
                    color: "#0aafeb",
                    "&:hover": {
                      backgroundColor: "#e3f8ff",
                      borderColor: "#0aafeb",
                    },
                  }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setExportUsers([])}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: 12,
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      borderColor: "#94a3b8",
                    },
                  }}
                >
                  Clear
                </Button>
              </Box>

              {/* Date range + Export button */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={dateBegin}
                    onChange={(v) => setDateBegin(v)}
                    slotProps={{ textField: { size: "small", sx: inputSx } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={dateEnd}
                    onChange={(v) => setDateEnd(v)}
                    slotProps={{ textField: { size: "small", sx: inputSx } }}
                  />
                </LocalizationProvider>

                <Button
                  onClick={handleExport}
                  variant="contained"
                  startIcon={exporting ? null : <FileDownloadIcon />}
                  disabled={exporting}
                  sx={{
                    backgroundColor: "#0aafeb",
                    color: "#fff",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: "#0096c7",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#b2e4f7",
                      color: "#fff",
                    },
                  }}
                >
                  {exporting
                    ? `Exporting ${exportUsers.length > 1 ? `(${exportUsers.length} users)` : ""}…`
                    : `Export${exportUsers.length > 1 ? ` (${exportUsers.length})` : ""} to Excel`}
                </Button>
              </Box>
            </Box>
          </Box>

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
                <MenuItem value="MERCHANDISER">MERCHANDISER</MenuItem>
                <MenuItem value="COORDINATOR">COORDINATOR</MenuItem>
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
