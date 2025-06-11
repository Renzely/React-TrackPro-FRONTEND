import "./attendance.css";
import * as React from "react";
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
  InputLabel,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import { format } from "date-fns";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return null;

  const dateObj = new Date(dateTime);

  // Format the time in 12-hour h:mm AM/PM format
  const hours = dateObj.getHours() % 12 || 12;
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = dateObj.getHours() >= 12 ? "PM" : "AM";

  return `${hours}:${minutes} ${ampm}`;
};

export default function Attendance() {
  const [userData, setUserData] = React.useState([]);
  const [selectedRoles, setSelectedRoles] = React.useState("");
  const body = { test: "test" };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleRoleChange = (event) => {
    setSelectedRoles(event.target.value);
  };

  const filteredData =
    selectedRoles === "" || selectedRoles === "UNFILTERED"
      ? userData
      : userData.filter((user) => user.role === selectedRoles);

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 75,
      headerClassName: "bold-header",
    },
    {
      field: "fullName",
      headerName: "FULL NAME",
      width: 200,
      headerClassName: "bold-header",
    },
    {
      field: "outlet",
      headerName: "OUTLET",
      width: 180,
      headerClassName: "bold-header",
    },
    {
      field: "date",
      headerName: "DATE",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "timeIn",
      headerName: "TIME IN",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "timeOut",
      headerName: "TIME OUT",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "action",
      headerName: "ATTENDANCE HISTORY",
      headerClassName: "bold-header",
      width: 180,
      sortable: false,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          <Stack style={{ marginTop: 0, alignItems: "center" }}>
            <Link
              to="/view-attendance"
              state={{ email: params.row.email }}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="contained"
                size="small"
                style={{
                  backgroundColor: "#0A21C0",
                  color: "#ffffff",
                }}
              >
                VIEW
              </Button>
            </Link>
          </Stack>
        );
      },
    },
  ];

  // Updated function to fetch attendance using the new backend API
  async function fetchCurrentAttendance(
    email,
    outlet,
    currentDate = new Date()
  ) {
    // Format date as YYYY-MM-DD for the backend
    const formattedDate = currentDate.toISOString().split("T")[0];

    try {
      const response = await axios.get(
        "https://react-rc-ugc-v2-backend.onrender.com/attendance/status",
        {
          params: {
            email: email,
            outlet: outlet,
            date: formattedDate,
          },
        }
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
    } catch (error) {
      console.error("Error fetching attendance:", error);
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
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    );
  };

  async function getUser() {
    try {
      // Fetch the users' data
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/get-all-user",
        body
      );
      const data = response.data.data;

      // Retrieve the logged-in admin's outlets from localStorage
      const loggedInBranch = localStorage.getItem("outlet");

      if (!loggedInBranch) {
        console.error("No branch information found for the logged-in admin.");
        return;
      }

      const loggedInBranches = loggedInBranch
        .split(",")
        .map((branch) => branch.trim());

      const currentDate = new Date();
      const displayDate = `${String(currentDate.getDate()).padStart(
        2,
        "0"
      )}-${String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )}-${currentDate.getFullYear()}`;

      const processedUsers = [];

      for (let userIndex = 0; userIndex < data.length; userIndex++) {
        const user = data[userIndex];

        const userOutlets = user.outlet || [];
        const matchingOutlets = userOutlets.filter((outlet) => {
          // If admin's outlets include "Others", include all "Others: ..." entries
          if (
            loggedInBranches.includes("Others") &&
            outlet.startsWith("Others:")
          ) {
            return true;
          }

          // Normal matching
          return loggedInBranches.some((branch) => outlet.includes(branch));
        });

        if (matchingOutlets.length === 0) {
          continue;
        }

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
            currentDate
          );

          if (attendance.hasTimedIn) {
            try {
              // 🔥 The outlet is passed as is – backend will handle "Others" logic
              const response = await axios.get(
                "https://react-rc-ugc-v2-backend.onrender.com/attendance/status",
                {
                  params: {
                    email: user.email,
                    outlet: outlet.startsWith("Others:") ? "Others" : outlet,
                    date: currentDate.toISOString().split("T")[0],
                  },
                }
              );

              const timeInTimestamp = response.data.timeInTimestamp;

              if (
                timeInTimestamp &&
                (!latestTimeIn ||
                  new Date(timeInTimestamp) > new Date(latestTimeIn))
              ) {
                latestTimeIn = timeInTimestamp;
                activeOutletData = {
                  outlet: outlet,
                  attendance: attendance,
                };
              }
            } catch (error) {
              console.error("Error fetching timestamp:", error);
            }
          }
        }

        if (!activeOutletData) {
          const firstOutlet = matchingOutlets[0];
          const attendance = await fetchCurrentAttendance(
            user.email,
            firstOutlet,
            currentDate
          );

          activeOutletData = {
            outlet: firstOutlet,
            attendance: attendance,
          };
        }

        processedUsers.push({
          count: processedUsers.length + 1,
          role: user.role,
          fullName: `${capitalizedNames[0]} ${capitalizedNames[2]}`,
          firstName: capitalizedNames[0],
          middleName: capitalizedNames[1] || "Null",
          lastName: capitalizedNames[2],
          email: user.email,
          outlet: activeOutletData.attendance.hasTimedIn
            ? activeOutletData.outlet
            : "No Attendance",
          date: displayDate,
          timeIn: activeOutletData.attendance.timeIn,
          timeOut: activeOutletData.attendance.timeOut,
          hasTimedIn: activeOutletData.attendance.hasTimedIn,
          hasTimedOut: activeOutletData.attendance.hasTimedOut,
          addressTimeIn: activeOutletData.attendance.addressTimeIn,
          addressTimeOut: activeOutletData.attendance.addressTimeOut,
        });
      }

      setUserData(processedUsers);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  React.useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="attendance">
      <Topbar />
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            padding: { xs: "10px", sm: "20px" },
            maxWidth: "100%",
            overflow: "auto",
            backgroundColor: "#003554",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            {/* Dropdown */}
            <FormControl sx={{ width: 200 }}>
              <Select
                value={selectedRoles}
                onChange={handleRoleChange}
                displayEmpty
                sx={{ backgroundColor: "white" }}
              >
                <MenuItem value="" disabled>
                  Select Client
                </MenuItem>
                <MenuItem value="UNFILTERED">UNFILTERED</MenuItem>
                <MenuItem value="RC">RC SALES AGENT</MenuItem>
                <MenuItem value="UGC">UGC PERSONNEL</MenuItem>
                <MenuItem value="BMP">BMPOWER</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              height: "100%",
              width: "100%",
              maxHeight: "80vh",
              marginTop: 2,
              overflow: "hidden",
              "& .MuiDataGrid-root": {
                backgroundColor: "#fff",
              },
            }}
          >
            <DataGrid
              rows={filteredData}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              slots={{
                toolbar: GridToolbar,
              }}
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
            />
          </Box>
        </Box>
      </Box>
    </div>
  );
}
