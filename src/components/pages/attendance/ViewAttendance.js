import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbar,
} from "@mui/x-data-grid";
import { Box, Typography, Button, Stack } from "@mui/material";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import { format, utcToZonedTime } from "date-fns-tz";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import "leaflet/dist/leaflet.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import MapIcon from "@mui/icons-material/Map";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Modal from "@mui/material/Modal";

export default function ViewAttendance() {
  const [outlet, setOutlet] = useState("");
  const location = useLocation();
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateBegin, setDateBegin] = React.useState(null);
  const [dateEnd, setDateEnd] = React.useState(null);
  const [sheetData, setSheetData] = React.useState(null);
  const [fullName, setFullName] = useState("");
  const [isVisible, setIsVisible] = useState(false); // Default is false (hidden)
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const [open, setOpen] = React.useState(false);
  const [openPhotoModal, setOpenPhotoModal] = React.useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = React.useState("");
  const [latitude, setLatitude] = React.useState();
  const [longitude, setLongitude] = React.useState();
  const [city, setCity] = React.useState();
  const [street, setStreet] = React.useState();
  const XLSX = require("sheetjs-style");

  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);

  const formatDateTime = (dateTime, hasTimedIn = false) => {
    if (!dateTime) return hasTimedIn ? "No Time In" : "No Time Out";

    // Parse the input string to Date object (assumed to be in local PH time already)
    const dateObj = new Date(dateTime);

    // Format date (e.g., 30-05-2025)
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Format time in 12-hour format with AM/PM
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return { date: formattedDate, time: formattedTime };
  };

  const capitalizeWords = (words) => {
    if (!words || !Array.isArray(words)) return [];

    return words.map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    );
  };

  // Fetch attendance data for the specific user
  async function fetchAttendanceData(email, outlet, currentDate = new Date()) {
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

  // New function to fetch all attendance records for table display
  async function fetchAllAttendanceData(
    email,
    startDate = null,
    endDate = null
  ) {
    setLoading(true);
    try {
      const requestBody = {
        email: email,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/get-attendance",
        requestBody
      );

      if (response.data.success) {
        // The backend now returns flattened data, so we can use it directly
        const formattedData = response.data.data.map((record, index) => ({
          ...record,
          id: index + 1, // For DataGrid
          email: email, // You'll need to get this from somewhere
          // Format the time fields for display
          timeIn: record.timeIn
            ? formatDateTime(record.timeIn).time
            : "No Time In",
          timeOut: record.timeOut
            ? formatDateTime(record.timeOut).time
            : "No Time Out",
          // Format the date for display
          date: record.date ? formatDateTime(record.date).date : "Unknown Date",
        }));

        setAttendanceData(formattedData);
        console.log("Formatted attendance data:", formattedData);
      } else {
        console.error(
          "Failed to fetch attendance data:",
          response.data.message
        );
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching all attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }

  // Updated useEffect to fetch all attendance data when email changes
  useEffect(() => {
    if (email) {
      // Fetch status for specific outlet if needed
      if (outlet) {
        fetchAttendanceData(email, outlet);
      }

      // Fetch all attendance data for table display
      fetchAllAttendanceData(email);
    }
  }, [email, outlet]);

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 100,
      headerClassName: "bold-header",
    },
    {
      field: "email",
      headerName: "EMAIL",
      width: 220,
      headerClassName: "bold-header",
    },
    {
      field: "date",
      headerName: "DATE",
      width: 120,
      headerClassName: "bold-header",
    },
    {
      field: "timeIn", // This will show formatted time
      headerName: "TIME IN",
      width: 100,
      headerClassName: "bold-header",
    },
    {
      field: "timeInSelfieUrl",
      headerName: "TIME IN PHOTO",
      width: 120,
      headerClassName: "bold-header",
      renderCell: (params) => {
        const selfieUrl = params.row.timeInSelfieUrl;

        return (
          <Stack style={{ marginTop: 10, alignItems: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                if (selfieUrl) {
                  handleOpenPhotoModal(selfieUrl);
                } else {
                  alert("Selfie not available");
                }
              }}
              sx={{
                backgroundColor: "#0A21C0",
                "&:hover": {
                  backgroundColor: "#091359",
                },
                cursor: selfieUrl ? "pointer" : "not-allowed",
              }}
            >
              {selfieUrl ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </Button>
          </Stack>
        );
      },
    },
    {
      field: "timeInLocation",
      headerName: "TIME IN LOCATION",
      headerAlign: "center",
      width: 150,
      headerClassName: "bold-header",
      renderCell: (params) => {
        const onClick = async () => {
          const currentRow = params.row;

          // Use timeInCoordinates
          const userLatitude = currentRow.timeInCoordinates?.latitude;
          const userLongitude = currentRow.timeInCoordinates?.longitude;

          // Validate coordinates before making the API request
          if (!userLatitude || !userLongitude) {
            console.error("Invalid coordinates:", {
              userLatitude,
              userLongitude,
            });
            alert(
              "Unable to retrieve location. Coordinates are missing or invalid."
            );
            return;
          }

          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLatitude}&lon=${userLongitude}`;

          try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
              console.error("Error from OpenStreetMap:", data.error);
              alert("Unable to geocode the provided coordinates.");
              return;
            }

            // Handle the successful response
            console.log(data);
            setCity(data.address.city || "Unknown City");
            setStreet(data.address.road || "Unknown Street");
            setLatitude(userLatitude);
            setLongitude(userLongitude);
            handleOpen();
          } catch (error) {
            console.error("Error fetching location:", error);
            alert("Unable to fetch location. Please try again.");
          }
        };

        const isCoordinatesAvailable =
          params.row.timeInCoordinates?.latitude &&
          params.row.timeInCoordinates?.longitude;

        return (
          <Stack style={{ marginTop: 10, alignItems: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={onClick}
              disabled={!isCoordinatesAvailable}
              sx={{
                backgroundColor: "#0A21C0",
                "&:hover": {
                  backgroundColor: "#091359",
                },
                cursor: isCoordinatesAvailable ? "pointer" : "not-allowed",
              }}
            >
              <MapIcon />
            </Button>
          </Stack>
        );
      },
    },
    {
      field: "timeOut", // This will show formatted time
      headerName: "TIME OUT",
      width: 120,
      headerClassName: "bold-header",
    },
    {
      field: "timeOutSelfieUrl",
      headerName: "TIME OUT PHOTO",
      width: 150,
      headerClassName: "bold-header",
      renderCell: (params) => {
        const timeOutSelfieUrl = params.row.timeOutSelfieUrl;

        return (
          <Stack style={{ marginTop: 10, alignItems: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                if (timeOutSelfieUrl) {
                  handleOpenPhotoModal(timeOutSelfieUrl);
                } else {
                  alert("Selfie not available");
                }
              }}
              sx={{
                backgroundColor: "#0A21C0",
                "&:hover": {
                  backgroundColor: "#091359",
                },
                cursor: timeOutSelfieUrl ? "pointer" : "not-allowed",
              }}
            >
              {timeOutSelfieUrl ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </Button>
          </Stack>
        );
      },
    },
    {
      field: "timeOutLocation",
      headerName: "TIME OUT LOCATION",
      width: 150,
      headerClassName: "bold-header",
      headerAlign: "center",
      renderCell: (params) => {
        const onClick = async () => {
          const currentRow = params.row;

          const userLatitude = currentRow.timeOutCoordinates?.latitude;
          const userLongitude = currentRow.timeOutCoordinates?.longitude;

          // Validate coordinates before making the API request
          if (!userLatitude || !userLongitude) {
            console.error("Invalid coordinates:", {
              userLatitude,
              userLongitude,
            });
            alert(
              "Unable to retrieve location. Coordinates are missing or invalid."
            );
            return;
          }

          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLatitude}&lon=${userLongitude}`;

          try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
              console.error("Error from OpenStreetMap:", data.error);
              alert("Unable to geocode the provided coordinates.");
              return;
            }

            // Handle the successful response
            console.log(data);
            setCity(data.address.city || "Unknown City");
            setStreet(data.address.road || "Unknown Street");
            setLatitude(userLatitude);
            setLongitude(userLongitude);
            handleOpen();
          } catch (error) {
            console.error("Error fetching location:", error);
            alert("Unable to fetch location. Please try again.");
          }
        };

        // Determine cursor style based on the availability of coordinates
        const isCoordinatesAvailable =
          params.row.timeOutCoordinates?.latitude &&
          params.row.timeOutCoordinates?.longitude;

        return (
          <Stack style={{ marginTop: 10, alignItems: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={onClick}
              disabled={!isCoordinatesAvailable}
              sx={{
                backgroundColor: "#0A21C0",
                "&:hover": {
                  backgroundColor: "#091359",
                },
                cursor: isCoordinatesAvailable ? "pointer" : "not-allowed",
              }}
            >
              <MapIcon />
            </Button>
          </Stack>
        );
      },
    },
    {
      field: "outlet",
      headerName: "OUTLET",
      width: 400,
      headerClassName: "bold-header",
    },
  ];

  const handleOpenPhotoModal = (photoUrl) => {
    setSelectedPhotoUrl(photoUrl);
    setOpenPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    setOpenPhotoModal(false);
    setSelectedPhotoUrl("");
  };

  const getExportData = async () => {
    if (!dateBegin || !dateEnd) {
      return alert("Please fill in the date fields.");
    }

    const bDate = new Date(dateBegin.$d.setHours(0, 0, 0, 0));
    const eDate = new Date(dateEnd.$d.setHours(23, 59, 59, 999));

    if (bDate > eDate) {
      return alert("End date must be the same or later than the start date.");
    }

    const startDateStr = bDate.toISOString().split("T")[0];
    const endDateStr = eDate.toISOString().split("T")[0];

    try {
      const userResponse = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/get-all-user",
        {}
      );
      const users = userResponse.data.data;

      const user = users.find((u) => u.email === email);
      if (!user) {
        alert("User not found.");
        return;
      }

      const fullName = `${user.firstName} ${
        user.middleName ? user.middleName + " " : ""
      }${user.lastName}`;

      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/get-attendance",
        {
          email,
          startDate: startDateStr,
          endDate: endDateStr,
        }
      );

      const allData = response.data.data;
      if (!allData || allData.length === 0) {
        alert("No data available for the selected dates.");
        return;
      }

      const headers = [
        "#",
        "Merchandiser",
        "Date",
        "Time In",

        "Time In Location",
        "Time Out",

        "Time Out Location",
        "Outlet",
      ];

      const newData = allData.map((log, idx) => ({
        count: idx + 1,
        fullName: fullName,
        date: formatDateTime(log.date).date || "N/A",
        timeIn: log.timeIn ? formatDateTime(log.timeIn).time : "No Time In",
        // timeInSelfieUrl: log.timeInSelfieUrl || "No Selfie",
        timeInLocation: log.timeInLocation || "No location",
        timeOut: log.timeOut ? formatDateTime(log.timeOut).time : "No Time Out",
        // timeOutSelfieUrl: log.timeOutSelfieUrl || "No Selfie",
        timeOutLocation: log.timeOutLocation || "No location",
        outlet: log.outlet || "Unknown Outlet",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);

      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
      XLSX.utils.sheet_add_json(ws, newData, {
        origin: "A2",
        skipHeader: true,
      });

      const colWidths = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...newData.map(
            (row) => (row[Object.keys(row)[index]] || "").toString().length
          )
        );
        return { wch: maxLength + 2 };
      });

      ws["!cols"] = colWidths;

      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
      });

      newData.forEach((row, rowIndex) => {
        Object.keys(row).forEach((_, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({
            r: rowIndex + 1,
            c: colIndex,
          });
          if (ws[cellAddress]) {
            ws[cellAddress].s = {
              alignment: { horizontal: "center", vertical: "center" },
            };
          }
        });
      });

      XLSX.utils.book_append_sheet(wb, ws, "TrackPro-Attendance_Data");

      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `TrackPro_AttendanceData_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data. Please try again.");
    }
  };

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
            backgroundColor: "#003554", // Background color from attendance.js
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              marginBottom: 3,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                onChange={(newValue) => setDateBegin(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { backgroundColor: "white" }, // Set background color to white
                  },
                }}
              />
              <DatePicker
                label="End Date"
                onChange={(newValue) => setDateEnd(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { backgroundColor: "white" }, // Set background color to white
                  },
                }}
              />
            </LocalizationProvider>

            <Button
              onClick={getExportData}
              variant="contained"
              sx={{
                backgroundColor: "#0A21C0",
                color: "white",
                "&:hover": {
                  backgroundColor: "#091359",
                },
              }}
            >
              Export
            </Button>
          </Box>

          {/* Photo Modal */}
          <Modal
            open={openPhotoModal}
            onClose={handleClosePhotoModal}
            aria-labelledby="photo-modal-title"
            aria-describedby="photo-modal-description"
          >
            <Box
              sx={{
                ...style,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {selectedPhotoUrl ? (
                <img
                  src={selectedPhotoUrl}
                  alt="Time In Photo"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              ) : (
                <Typography variant="h6" align="center">
                  No photo available.
                </Typography>
              )}
            </Box>
          </Modal>

          {/* Map Modal */}
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <div className="leaflet-container">
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={17}
                  scrollWheelZoom={false}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[latitude, longitude]}
                    icon={
                      new Icon({
                        iconUrl: markerIconPng,
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                      })
                    }
                  >
                    <Popup>
                      {city}, <br /> {street}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Box>
          </Modal>

          {/* Attendance Data Table */}
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
              rows={attendanceData}
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
              pageSizeOptions={[5, 10, 20, 30, 50, 100]}
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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
