import "./attendance.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Modal from "@mui/material/Modal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const mapModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  height: 440,
  bgcolor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  p: 2,
  overflow: "hidden",
};

const photoModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  bgcolor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  p: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};

export default function ViewAttendance() {
  const location = useLocation();
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateBegin, setDateBegin] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [open, setOpen] = useState(false);
  const [openPhotoModal, setOpenPhotoModal] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [city, setCity] = useState();
  const [street, setStreet] = useState();
  const [loading, setLoading] = useState(false);
  const XLSX = require("sheetjs-style");

  const email = location.state?.email || "";

  const formatDateTime = (dateTime, hasTimedIn = false) => {
    if (!dateTime) return hasTimedIn ? "No Time In" : "No Time Out";
    const dateObj = new Date(dateTime);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return { date: formattedDate, time: `${hours}:${minutes} ${ampm}` };
  };

  async function fetchAllAttendanceData(
    email,
    startDate = null,
    endDate = null,
  ) {
    setLoading(true);
    try {
      const requestBody = {
        email,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };
      const response = await axios.post(
        "https://api-trackpro.bmphrc.com/get-attendance",
        requestBody,
      );
      if (response.data.success) {
        const formattedData = response.data.data.map((record, index) => ({
          ...record,
          id: index + 1,
          email,
          timeIn: record.timeIn
            ? formatDateTime(record.timeIn).time
            : "No Time In",
          timeOut: record.timeOut
            ? formatDateTime(record.timeOut).time
            : "No Time Out",
          date: record.date ? formatDateTime(record.date).date : "Unknown Date",
        }));
        setAttendanceData(formattedData);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching all attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (email) fetchAllAttendanceData(email);
  }, [email]);

  const handleOpenPhotoModal = (photoUrl) => {
    setSelectedPhotoUrl(photoUrl);
    setOpenPhotoModal(true);
  };

  const openMapModal = async (coords) => {
    const { latitude: lat, longitude: lon } = coords;
    if (!lat || !lon) {
      alert("Coordinates unavailable.");
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      );
      const data = await res.json();
      if (data.error) {
        alert("Unable to geocode.");
        return;
      }
      setCity(data.address.city || "Unknown City");
      setStreet(data.address.road || "Unknown Street");
      setLatitude(lat);
      setLongitude(lon);
      setOpen(true);
    } catch {
      alert("Unable to fetch location.");
    }
  };

  const actionBtn = (icon, color, onClick, disabled) => (
    <Button
      variant="contained"
      size="small"
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: disabled ? "#e0e0e0" : color,
        color: disabled ? "#aaa" : "#fff",
        minWidth: 36,
        width: 36,
        height: 32,
        borderRadius: "8px",
        boxShadow: "none",
        padding: 0,
        "&:hover": {
          backgroundColor: disabled ? "#e0e0e0" : color,
          boxShadow: "none",
          opacity: 0.88,
        },
      }}
    >
      {icon}
    </Button>
  );

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 60,
      headerClassName: "tp-header",
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      headerClassName: "tp-header",
    },
    {
      field: "date",
      headerName: "Date",
      width: 110,
      headerClassName: "tp-header",
    },
    {
      field: "timeIn",
      headerName: "Time In",
      width: 100,
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
          }}
        />
      ),
    },
    {
      field: "timeInSelfieUrl",
      headerName: "In Photo",
      width: 90,
      headerClassName: "tp-header",
      renderCell: (params) => {
        const url = params.row.timeInSelfieUrl;
        return (
          <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }}>
            {actionBtn(
              url ? (
                <VisibilityIcon sx={{ fontSize: 16 }} />
              ) : (
                <VisibilityOffIcon sx={{ fontSize: 16 }} />
              ),
              "#0aafeb",
              () => (url ? handleOpenPhotoModal(url) : alert("No selfie")),
              !url,
            )}
          </Stack>
        );
      },
    },
    {
      field: "timeInLocation",
      headerName: "In Map",
      width: 80,
      headerClassName: "tp-header",
      renderCell: (params) => {
        const coords = params.row.timeInCoordinates;
        const avail = coords?.latitude && coords?.longitude;
        return (
          <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }}>
            {actionBtn(
              <MapIcon sx={{ fontSize: 16 }} />,
              "#0aafeb",
              () => openMapModal(coords),
              !avail,
            )}
          </Stack>
        );
      },
    },
    {
      field: "timeOut",
      headerName: "Time Out",
      width: 100,
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
          }}
        />
      ),
    },
    {
      field: "timeOutSelfieUrl",
      headerName: "Out Photo",
      width: 90,
      headerClassName: "tp-header",
      renderCell: (params) => {
        const url = params.row.timeOutSelfieUrl;
        return (
          <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }}>
            {actionBtn(
              url ? (
                <VisibilityIcon sx={{ fontSize: 16 }} />
              ) : (
                <VisibilityOffIcon sx={{ fontSize: 16 }} />
              ),
              "#c9184a",
              () => (url ? handleOpenPhotoModal(url) : alert("No selfie")),
              !url,
            )}
          </Stack>
        );
      },
    },
    {
      field: "timeOutLocation",
      headerName: "Out Map",
      width: 80,
      headerClassName: "tp-header",
      renderCell: (params) => {
        const coords = params.row.timeOutCoordinates;
        const avail = coords?.latitude && coords?.longitude;
        return (
          <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }}>
            {actionBtn(
              <MapIcon sx={{ fontSize: 16 }} />,
              "#c9184a",
              () => openMapModal(coords),
              !avail,
            )}
          </Stack>
        );
      },
    },
    {
      field: "outlet",
      headerName: "Branch",
      width: 320,
      headerClassName: "tp-header",
    },
  ];

  const getExportData = async () => {
    if (!dateBegin || !dateEnd) {
      alert("Please fill in the date fields.");
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
    try {
      const userRes = await axios.post(
        "https://api-trackpro.bmphrc.com/get-all-user",
        {},
      );
      const users = userRes.data.data;
      const user = users.find((u) => u.email === email);
      if (!user) {
        alert("User not found.");
        return;
      }
      const fullName = `${user.firstName}${user.middleName ? " " + user.middleName : ""} ${user.lastName}`;
      const attendanceRes = await axios.post(
        "https://api-trackpro.bmphrc.com/get-attendance",
        { email, startDate: startDateStr, endDate: endDateStr },
      );
      const logs = attendanceRes.data.data;
      if (!logs?.length) {
        alert("No data for selected dates.");
        return;
      }
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
      const exportRows = logs.map((log, idx) => ({
        count: idx + 1,
        fullName,
        date: formatDateTime(log.date)?.date ?? "N/A",
        timeIn: log.timeIn ? formatDateTime(log.timeIn)?.time : "No Time In",
        timeInLocation: log.timeInLocation ?? "No location",
        timeInPhoto: log.timeInSelfieUrl ?? "",
        timeOut: log.timeOut
          ? formatDateTime(log.timeOut)?.time
          : "No Time Out",
        timeOutLocation: log.timeOutLocation ?? "No location",
        timeOutPhoto: log.timeOutSelfieUrl ?? "",
        outlet: log.outlet ?? "Unknown Outlet",
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
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
      headers.forEach((_, c) => {
        const addr = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[addr])
          ws[addr].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
      });
      XLSX.utils.book_append_sheet(wb, ws, "TrackPro-Attendance");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `TrackPro_Attendance_${startDateStr}_to_${endDateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Error exporting data.");
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
            padding: { xs: "16px", sm: "24px" },
            backgroundColor: "#f0f4f8",
            minHeight: "calc(100vh - 58px)",
          }}
        >
          {/* Page header */}
          <div className="page-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => window.history.back()}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  borderColor: "#d1d5db",
                  color: "#374151",
                  fontSize: 13,
                }}
              >
                Back
              </Button>
              <div>
                <h1 className="page-title">Attendance History</h1>
                <p className="page-subtitle">{email}</p>
              </div>
            </div>
          </div>

          {/* Export controls */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: "14px",
              padding: "16px 20px",
              border: "1px solid #e8ecf0",
              marginBottom: "20px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                onChange={(v) => setDateBegin(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      backgroundColor: "#f8fafc",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    },
                  },
                }}
              />
              <DatePicker
                label="End Date"
                onChange={(v) => setDateEnd(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      backgroundColor: "#f8fafc",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    },
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              onClick={getExportData}
              variant="contained"
              startIcon={<FileDownloadIcon />}
              sx={{
                backgroundColor: "#0aafeb",
                color: "#fff",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#0096c7", boxShadow: "none" },
              }}
            >
              Export to Excel
            </Button>
          </Box>

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
              rows={attendanceData}
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
              pageSizeOptions={[5, 10, 20, 30, 50, 100]}
              getRowId={(row) => row.count}
              disableDensitySelector
              disableColumnFilter
              disableColumnSelector
              disableRowSelectionOnClick
              sx={{ minHeight: 400 }}
            />
          </Box>

          {/* Photo Modal */}
          <Modal open={openPhotoModal} onClose={() => setOpenPhotoModal(false)}>
            <Box sx={photoModalStyle}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "#374151",
                  alignSelf: "flex-start",
                }}
              >
                Selfie Photo
              </Typography>
              {selectedPhotoUrl ? (
                <img
                  src={selectedPhotoUrl}
                  alt="Selfie"
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    maxHeight: 360,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  No photo available.
                </Typography>
              )}
              <Button
                onClick={() => setOpenPhotoModal(false)}
                variant="outlined"
                size="small"
                sx={{
                  alignSelf: "center",
                  borderRadius: "10px",
                  textTransform: "none",
                }}
              >
                Close
              </Button>
            </Box>
          </Modal>

          {/* Map Modal */}
          <Modal open={open} onClose={() => setOpen(false)}>
            <Box sx={mapModalStyle}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#374151", marginBottom: 1 }}
              >
                📍 {city}, {street}
              </Typography>
              {latitude && longitude && (
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={17}
                  scrollWheelZoom={false}
                  style={{ height: "360px", width: "100%", borderRadius: 10 }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
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
                      {city}, {street}
                    </Popup>
                  </Marker>
                </MapContainer>
              )}
            </Box>
          </Modal>
        </Box>
      </Box>
    </div>
  );
}
