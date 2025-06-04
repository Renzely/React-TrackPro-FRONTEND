import "./expiry.css";
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

export default function Expiry() {
  const [userData, setUserData] = React.useState([]);
  const [dateFilter, setDateFilter] = React.useState(null);
  const body = { test: "test" };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const XLSX = require("sheetjs-style");
  const [dateBegin, setDateBegin] = React.useState(null);
  const [dateEnd, setDateEnd] = React.useState(null);

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 75,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "merchandiserName",
      headerName: "Merchandiser Name",
      width: 220,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "outlet",
      headerName: "Outlet",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "month",
      headerName: "Month",
      width: 100,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "sku",
      headerName: "SKU",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "expiration",
      headerName: "Quantity",
      width: 120,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
    },
  ];

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
        "http://192.168.50.55:3001/filter-date-range-Expiry",
        selectedDate
      );

      const parcels = response.data.data;
      console.log("Expiry fetched:", parcels);

      const sortedData = parcels.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Flatten each expiry entry into its own row
      let globalCount = 1;
      const flattenedData = sortedData.flatMap((item) =>
        item.expiryEntries.map((entry) => ({
          id: globalCount,
          count: globalCount++, // increment for each row
          date: item.date || "N/A",
          merchandiserName: item.merchandiser || "N/A",
          userEmail: item.userEmail || "N/A",
          outlet: item.outlet || "N/A",
          month: entry.month || "N/A",
          sku: entry.sku || "N/A",
          expiration: entry.expiration || "N/A",
        }))
      );

      console.log("Mapped Expiry data:", flattenedData);
      setUserData(flattenedData);
    } catch (error) {
      console.error("Error fetching Expiry data:", error);
    }
  }

  async function getUser() {
    try {
      const loggedInBranch = localStorage.getItem("outlet");

      const branches = loggedInBranch.split(",").map((outlet) => outlet.trim());

      const response = await axios.post(
        "http://192.168.50.55:3001/retrieve-expiry-data",
        { branches }
      );

      if (response.status !== 200) {
        console.error("Failed to fetch expiry data:", response.statusText);
        return;
      }

      const data = response.data.data || [];

      // Sort by date (descending)
      const sortedData = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Flatten each expiry entry into its own row
      let globalCount = 1;
      const flattenedData = sortedData.flatMap((item) =>
        item.expiryEntries.map((entry) => ({
          count: globalCount++, // Increment for each row
          date: item.date || "N/A",
          merchandiserName: item.merchandiser || "N/A",
          userEmail: item.userEmail || "N/A",
          outlet: item.outlet || "N/A",
          month: entry.month || "N/A",
          sku: entry.sku || "N/A",
          expiration: entry.expiration || "N/A",
        }))
      );

      setUserData(flattenedData);
    } catch (error) {
      console.error("Error fetching expiry data:", error.message);
    }
  }

  const getExportData = async () => {
    if (!dateBegin || !dateEnd) {
      return alert("Please fill in the date fields.");
    }

    const startDate = new Date(dateBegin.$d).toISOString();
    const endDate = new Date(dateEnd.$d).toISOString();

    if (startDate > endDate) {
      return alert("End date must be the same or later than the start date.");
    }

    try {
      const response = await axios.post(
        "http://192.168.50.55:3001/export-Expiry-data",
        {
          start: startDate,
          end: endDate,
        }
      );

      console.log("API Response:", response.data);

      if (!response.data.data || response.data.data.length === 0) {
        return alert("No data found for the selected date range");
      }

      const headers = [
        "#",
        "Date",
        "Merchandiser Name",
        "Outlet",
        "User Type",
        "Version",
        "SKU",
        "Month",
        "Expiration",
      ];

      const newData = [];
      let counter = 1;

      response.data.data.forEach((item) => {
        // Process expiryEntries (not expiry[version] as in your original code)
        const expiryEntries = item.expiryEntries || [];

        expiryEntries.forEach((entry) => {
          newData.push({
            count: counter++,
            date: item.date,
            merchandiserName: item.merchandiserName || "N/A",
            outlet: item.outlet || "N/A",
            userType: item.userType || "Expiry",
            version: item.version || "v1",
            SKU: entry.sku,
            Month: entry.month,
            Expiration: entry.expiration, // This matches your schema field name
          });
        });
      });

      console.log("Mapped Data:", newData);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
      XLSX.utils.sheet_add_json(ws, newData, {
        origin: "A2",
        skipHeader: true,
      });

      // Column widths
      const colWidths = headers.map((header) => ({
        wch: Math.max(header.length, 15),
      }));
      ws["!cols"] = colWidths;

      // Style headers
      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
      });

      // Style all cells
      newData.forEach((_, rowIndex) => {
        headers.forEach((_, colIndex) => {
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

      XLSX.utils.book_append_sheet(wb, ws, "Expiry_Data");

      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `EXPIRY_DATA_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      alert(`Successfully exported ${newData.length} expiry records!`);
    } catch (error) {
      console.error("Export Error:", error);
      alert("Error exporting data. Please try again.");
    }
  };

  React.useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="Expiry">
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
              Show Expiration
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
