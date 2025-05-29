import "./VET_TYPE.css";
import * as React from "react";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbar,
} from "@mui/x-data-grid";
import axios from "axios";
import { Button, Stack, buttonBaseClasses } from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

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

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function VET() {
  const [userData, setUserData] = React.useState([]);
  const [dateFilter, setDateFilter] = React.useState(null);
  const body = { test: "test" };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const XLSX = require("sheetjs-style");
  const [dateBegin, setDateBegin] = React.useState(null);
  const [dateEnd, setDateEnd] = React.useState(null);
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState("");

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 75,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "date",
      headerName: "Date",
      width: 150,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
    },
    {
      field: "merchandiserName",
      headerName: "Merchandiser Name",
      width: 220,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
    },

    {
      field: "outlet",
      headerName: "Outlet",
      width: 220,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
    },
    {
      field: "userType",
      headerName: "Selected Type",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
    },
    {
      field: "shelfSpace",
      headerName: "80% Shelf Space",
      width: 180,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value || "No Answer"}
        </div>
      ),
    },
    {
      field: "designatedRack",
      headerName: "Designated Rack",
      width: 180,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value || "No Answer"}
        </div>
      ),
    },

    {
      field: "beforeImage",
      headerName: "Before Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
      renderCell: (params) => {
        const beforeImageUrl = params.row.beforeImage;

        return (
          <Stack style={{ marginTop: 10, alignItems: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                if (beforeImageUrl) {
                  handleOpenImageModal(beforeImageUrl);
                } else {
                  alert("Before image not available");
                }
              }}
              sx={{
                backgroundColor: "#0A21C0", // Set the background color
                "&:hover": {
                  backgroundColor: "#0A21C0", // Set the hover background color
                },
                cursor: beforeImageUrl ? "pointer" : "not-allowed", // Disable pointer if no image
              }}
            >
              {beforeImageUrl ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </Button>
          </Stack>
        );
      },
    },
    {
      field: "afterImage",
      headerName: "After Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center", // Center the header text
      align: "center", // Center the data
      renderCell: (params) => {
        const afterImageUrl = params.row.afterImage;

        return (
          <Stack style={{ marginTop: 10, alignItems: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                if (afterImageUrl) {
                  handleOpenImageModal(afterImageUrl);
                } else {
                  alert("After image not available");
                }
              }}
              sx={{
                backgroundColor: "#0A21C0", // Set the background color
                "&:hover": {
                  backgroundColor: "#0A21C0", // Set the hover background color
                },
                cursor: afterImageUrl ? "pointer" : "not-allowed", // Disable pointer if no image
              }}
            >
              {afterImageUrl ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </Button>
          </Stack>
        );
      },
    },
  ];

  function handleOpenImageModal(imageUrl) {
    setImageModalOpen(true);
    setSelectedImage(imageUrl);
  }

  const fetchCompetitorByDate = async () => {
    if (!dateBegin || !dateEnd) {
      return alert("Please fill in the date fields.");
    }

    const bDate = new Date(dateBegin.$d);
    bDate.setHours(0, 0, 0, 0);

    const eDate = new Date(dateEnd.$d);
    eDate.setHours(23, 59, 59, 999);

    if (bDate > eDate) {
      return alert("End date must be the same or later than the start date.");
    }

    const selectedDate = {
      startDate: bDate.toISOString(),
      endDate: eDate.toISOString(),
    };

    await getDate(selectedDate);
  };

  async function getDate(selectedDate) {
    try {
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/filter-date-range-VET",
        selectedDate
      );

      const VETdata = response.data.data;

      const sortedData = VETdata.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const newData = sortedData.map((data, key) => ({
        id: key + 1,
        count: key + 1,
        date: data.date,
        userEmail: data.userEmail,
        merchandiserName: data.merchandiser,
        userType: data.userType,
        outlet: data.outlet,
        beforeImage: data.beforeImage,
        afterImage: data.afterImage,
        shelfSpace: data.shelfSpace,
        designatedRack: data.designatedRack,
      }));

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching VET data:", error);
    }
  }

  async function getUser() {
    try {
      const loggedInBranch = localStorage.getItem("outlet");

      const branches = loggedInBranch.split(",").map((branch) => branch.trim());

      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/retrieve-QTTS-data",
        { branches }
      );

      if (response.status !== 200) {
        console.error("Failed to fetch QTT Scoring data:", response.statusText);
        return;
      }

      const data = response.data.data || [];

      // Sort data by date (descending)
      const sortedData = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Filter to only VET entries
      const vetData = sortedData.filter((item) => item.userType === "VET");

      const newData = vetData.map((item, index) => ({
        count: index + 1,
        date: item.date,
        merchandiserName: item.merchandiser,
        userEmail: item.userEmail,
        outlet: item.outlet,
        userType: item.userType,
        shelfSpace: item.shelfSpace || "No Answer",
        designatedRack: item.designatedRack || "No Answer",
        beforeImage: item.beforeImage || "",
        afterImage: item.afterImage || "",
      }));

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching QTT Scoring data:", error.message);
    }
  }

  async function getDateRTV(selectedDate) {
    try {
      // Retrieve the logged-in admin's branches from localStorage
      const loggedInBranch = localStorage.getItem("accountNameBranchManning");

      if (!loggedInBranch) {
        console.error("No branch information found for the logged-in admin.");
        return;
      }

      const branches = loggedInBranch.split(",").map((branch) => branch.trim());

      // Send request to filter RTV data by date and branches
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/filter-RTV-data",
        {
          selectDate: selectedDate,
          branches,
        }
      );

      const data = response.data.data;

      // Sort and map the data
      const sortedData = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const newData = sortedData.map((data, key) => ({
        count: key + 1,
        date: data.date,
        merchandiserName: data.merchandiserName,
        UserEmail: data.userEmail,
        outlet: data.outlet,
        selectedType: data.selectedType,
        shelfSpace: data.shelfSpaceAnswer,
        designatedRack: data.designatedRackAnswer,
        beforeImage: data.beforeImage || "",
        afterImage: data.afterImage || "",
      }));

      console.log("Filtered RTV data by date:", newData);
      setUserData(newData); // Set the filtered data
    } catch (error) {
      console.error("Error filtering RTV data by date:", error);
    }
  }

  const getExportData = async () => {
    if (!dateBegin || !dateEnd) {
      return alert("Please fill in the date fields.");
    }

    const bDate = new Date(dateBegin.$d.setHours(0, 0, 0, 0));
    const eDate = new Date(dateEnd.$d.setHours(23, 59, 59, 999));

    if (bDate > eDate) {
      return alert("End date must be the same or later than the start date.");
    }

    console.log("Sending date range:", { start: bDate, end: eDate });

    try {
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/export-VET-data",
        {
          start: bDate,
          end: eDate,
        }
      );

      console.log("API Response:", response.data);

      if (
        !response.data ||
        !response.data.data ||
        response.data.data.length === 0
      ) {
        alert("No data found for the selected date range.");
        return;
      }

      console.log("Export Data:", response.data.data);

      const headers = [
        "#",
        "Date",
        "Merchandiser Name",
        "Outlet",
        "User Type",
        "80% Shelf Space",
        "Designated Rack",
        "Before Image",
        "After Image",
      ];

      const newData = response.data.data.map((item, key) => ({
        count: key + 1,
        date: item.date || "N/A",
        merchandiserName: item.merchandiserName || "N/A",
        outlet: item.outlet || "N/A",
        userType: item.userType || "VET",
        shelfSpace: item.shelfSpace || "No Answer",
        designatedRack: item.designatedRack || "No Answer",
        beforeImage: item.beforeImage || "",
        afterImage: item.afterImage || "",
      }));

      console.log("Mapped Data for Excel:", newData);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);

      // Add headers and data
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
      XLSX.utils.sheet_add_json(ws, newData, {
        origin: "A2",
        skipHeader: true,
      });

      // Auto-adjust column widths
      const colWidths = headers.map((header, index) => {
        if (header === "Before Image" || header === "After Image") {
          // Find max length of URLs
          const maxLength = Math.max(
            header.length,
            ...newData.map((row) => (row[Object.keys(row)[index]] || "").length)
          );
          return { wch: Math.min(maxLength + 5, 50) }; // Cap at 50 characters for readability
        }
        return { wch: Math.max(header.length, 15) }; // Default width
      });

      ws["!cols"] = colWidths;

      // Apply bold styling to headers
      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!ws[cellAddress]) return;
        ws[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
        };
      });

      // Apply center alignment to all data cells
      newData.forEach((row, rowIndex) => {
        Object.keys(row).forEach((_, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({
            r: rowIndex + 1,
            c: colIndex,
          });
          if (!ws[cellAddress]) return;
          ws[cellAddress].s = {
            alignment: { horizontal: "center", vertical: "center" },
          };
        });
      });

      XLSX.utils.book_append_sheet(wb, ws, "VET_Data");

      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `VET_DATA_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      alert(`Successfully exported ${newData.length} VET records!`);
    } catch (error) {
      console.error("Export Error:", error.response?.data || error.message);
      alert("Error exporting data. Please try again.");
    }
  };

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
          {/* Controls Section */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ marginBottom: "20px", marginTop: "10px" }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                onChange={(newValue) => setDateBegin(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { backgroundColor: "white" },
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                onChange={(newValue) => setDateEnd(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { backgroundColor: "white" },
                  },
                }}
              />
            </LocalizationProvider>
            <Dialog
              open={imageModalOpen}
              onClose={() => setImageModalOpen(false)}
            >
              <DialogTitle>View Image</DialogTitle>
              <DialogContent>
                <img
                  src={selectedImage}
                  alt="Selected"
                  style={{ width: "100%", height: "auto" }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setImageModalOpen(false)}
                  color="primary"
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            ;
            <Button
              onClick={getExportData}
              variant="contained"
              sx={{
                backgroundColor: "#0A21C0",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0A21C0",
                },
              }}
            >
              Export
            </Button>
            <Button
              onClick={fetchCompetitorByDate}
              variant="contained"
              sx={{
                backgroundColor: "rgb(25, 118, 210)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgb(21, 101, 192)",
                },
              }}
            >
              Show VET
            </Button>
          </Stack>

          {/* Responsive DataGrid */}
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
              rows={userData}
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
              disableDensitySelector
              disableColumnFilter
              disableColumnSelector
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 20, 30, 50, 100]}
              getRowId={(row) => row.count}
            />
          </Box>

          {/* Responsive Modal */}
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                padding: 4,
                backgroundColor: "white",
                margin: { xs: "10% auto", md: "5% auto" },
                width: { xs: "90%", sm: "70%", md: "50%" },
                boxShadow: 24,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Text in a modal
              </Typography>
              <Typography
                id="modal-modal-description"
                sx={{ mt: 2, textAlign: "center" }}
              >
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </Typography>
              <Button
                onClick={handleClose}
                variant="contained"
                sx={{
                  marginTop: 3,
                  backgroundColor: "rgb(33, 148, 29)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgb(33, 148, 29)" },
                }}
              >
                Close
              </Button>
            </Box>
          </Modal>
        </Box>
      </Box>
    </div>
  );
}
