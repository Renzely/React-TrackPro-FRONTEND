import "./PSR_TYPE.css";
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

export default function PSR() {
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
      headerAlign: "center", // Center header text
      align: "center", // Center data
    },
    {
      field: "merchandiserName",
      headerName: "Merchandiser Name",
      width: 220,
      headerClassName: "bold-header",
      headerAlign: "center", // Center header text
      align: "center", // Center data
    },

    {
      field: "outlet",
      headerName: "Outlet",
      width: 400,
      headerClassName: "bold-header",
      headerAlign: "center", // Center header text
      align: "center", // Center data
    },
    {
      field: "userType",
      headerName: "Selected Type",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center", // Center header text
      align: "center", // Center data
    },
    {
      field: "firstBrand",
      headerName: "First Brand seen inside",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "firstBrandImage",
      headerName: "First Brand Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const imageUrl = params.value;
        const hasImage = !!imageUrl;

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (hasImage) handleOpenImageModal(imageUrl);
              else alert("No image available");
            }}
            sx={{
              backgroundColor: hasImage ? "#0A21C0" : "grey",
              "&:hover": { backgroundColor: hasImage ? "#0A21C0" : "grey" },
              cursor: hasImage ? "pointer" : "not-allowed",
            }}
            disabled={!hasImage}
          >
            {hasImage ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
        );
      },
    },
    {
      field: "complianceDOG",
      headerName: "Compliance with DOG Planogram",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "complianceDOGImage",
      headerName: "DOG Planogram Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const imageUrl = params.value;
        const hasImage = !!imageUrl;

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (hasImage) handleOpenImageModal(imageUrl);
              else alert("No image available");
            }}
            sx={{
              backgroundColor: hasImage ? "#0A21C0" : "grey",
              "&:hover": { backgroundColor: hasImage ? "#0A21C0" : "grey" },
              cursor: hasImage ? "pointer" : "not-allowed",
            }}
            disabled={!hasImage}
          >
            {hasImage ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
        );
      },
    },
    {
      field: "complianceCAT",
      headerName: "Compliance with CAT Planogram",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "complianceCATImage",
      headerName: "CAT Planogram Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const imageUrl = params.value;
        const hasImage = !!imageUrl;

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (hasImage) handleOpenImageModal(imageUrl);
              else alert("No image available");
            }}
            sx={{
              backgroundColor: hasImage ? "#0A21C0" : "grey",
              "&:hover": { backgroundColor: hasImage ? "#0A21C0" : "grey" },
              cursor: hasImage ? "pointer" : "not-allowed",
            }}
            disabled={!hasImage}
          >
            {hasImage ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
        );
      },
    },
    {
      field: "visibilityCashier",
      headerName: "Visibility of Cashier Area",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "visibilityCashierImage",
      headerName: "Cashier Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const imageUrl = params.value;
        const hasImage = !!imageUrl;

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (hasImage) handleOpenImageModal(imageUrl);
              else alert("No image available");
            }}
            sx={{
              backgroundColor: hasImage ? "#0A21C0" : "grey",
              "&:hover": { backgroundColor: hasImage ? "#0A21C0" : "grey" },
              cursor: hasImage ? "pointer" : "not-allowed",
            }}
            disabled={!hasImage}
          >
            {hasImage ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
        );
      },
    },
    {
      field: "endcapGondola",
      headerName: "Endcap Gondola Highlight",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "endcapGondolaImage",
      headerName: "Endcap Gondola Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const imageUrl = params.value;
        const hasImage = !!imageUrl;

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (hasImage) handleOpenImageModal(imageUrl);
              else alert("No image available");
            }}
            sx={{
              backgroundColor: hasImage ? "#0A21C0" : "grey",
              "&:hover": { backgroundColor: hasImage ? "#0A21C0" : "grey" },
              cursor: hasImage ? "pointer" : "not-allowed",
            }}
            disabled={!hasImage}
          >
            {hasImage ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
        );
      },
    },
    {
      field: "wetProductsHighlight",
      headerName: "Wet Products Highlight",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "wetProductsHighlightImage",
      headerName: "Wet Products Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const imageUrl = params.value;
        const hasImage = !!imageUrl;

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (hasImage) handleOpenImageModal(imageUrl);
              else alert("No image available");
            }}
            sx={{
              backgroundColor: hasImage ? "#0A21C0" : "grey",
              "&:hover": { backgroundColor: hasImage ? "#0A21C0" : "grey" },
              cursor: hasImage ? "pointer" : "not-allowed",
            }}
            disabled={!hasImage}
          >
            {hasImage ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
        );
      },
    },
    {
      field: "tacticalBin",
      headerName: "Tactical Bin",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "tacticalBinImage",
      headerName: "Tactical Bin Image",
      width: 200,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const imageUrl = params.value;
        const hasImage = !!imageUrl;

        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (hasImage) handleOpenImageModal(imageUrl);
              else alert("No image available");
            }}
            sx={{
              backgroundColor: hasImage ? "#0A21C0" : "grey",
              "&:hover": { backgroundColor: hasImage ? "#0A21C0" : "grey" },
              cursor: hasImage ? "pointer" : "not-allowed",
            }}
            disabled={!hasImage}
          >
            {hasImage ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
        );
      },
    },
    {
      field: "psrComment",
      headerName: "PSR Comment",
      width: 250,
      headerClassName: "bold-header",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
          {params.value || "No Comment"}
        </div>
      ),
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

    // Keep dates in local timezone
    const bDate = new Date(dateBegin.$d);
    bDate.setHours(0, 0, 0, 0);

    const eDate = new Date(dateEnd.$d);
    eDate.setHours(23, 59, 59, 999);

    if (bDate > eDate) {
      return alert("End date must be the same or later than the start date.");
    }

    const selectedDate = {
      // Send as local date strings or adjust timezone
      startDate: bDate.toISOString(),
      endDate: eDate.toISOString(),
    };

    await getDate(selectedDate);
  };

  async function getDate(selectedDate) {
    try {
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/filter-date-range-PSR",
        selectedDate
      );

      const PSRdata = response.data.data;

      const sortedData = PSRdata.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const newData = sortedData.map((data, key) => ({
        id: key + 1,
        count: key + 1,
        date: data.date,
        merchandiserName: data.merchandiser,
        userEmail: data.userEmail,
        outlet: data.outlet,
        userType: data.userType,
        firstBrand: data.firstBrandSeen,
        complianceDOG: data.complianceDOG,
        complianceCAT: data.complianceCAT,
        royalCaninSignage: data.royalCaninSignage,
        visibilityCashier: data.visibilityCashier,
        endcapGondola: data.endcapGondola,
        wetProductsHighlight: data.wetProductsHighlight,
        tacticalBin: data.tacticalBin,
        psrComment: data.PSRComment || "",
        firstBrandImage: data.firstBrandImage || "",
        complianceDOGImage: data.complianceDOGImage || "",
        complianceCATImage: data.complianceCATImage || "",
        royalCaninSignageImage: data.royalCaninSignageImage || "",
        visibilityCashierImage: data.visibilityCashierImage || "",
        endcapGondolaImage: data.endcapGondolaImage || "",
        wetProductsHighlightImage: data.wetProductsHighlightImage || "",
        tacticalBinImage: data.tacticalBinImage || "",
      }));

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching PSR data:", error);
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

      // Filter to only PSR entries
      const psrData = sortedData.filter((item) => item.userType === "PSR");

      // Map data to include your latest schema
      const newData = psrData.map((item, index) => ({
        count: index + 1,
        date: item.date,
        merchandiserName: item.merchandiser,
        userEmail: item.userEmail,
        outlet: item.outlet,
        userType: item.userType,
        firstBrand: item.firstBrandSeen,
        complianceDOG: item.complianceDOG,
        complianceCAT: item.complianceCAT,
        royalCaninSignage: item.royalCaninSignage,
        visibilityCashier: item.visibilityCashier,
        endcapGondola: item.endcapGondola,
        wetProductsHighlight: item.wetProductsHighlight,
        tacticalBin: item.tacticalBin,
        psrComment: item.PSRComment || "",

        // Images (showing URLs if they exist)
        firstBrandImage: item.firstBrandImage || "",
        complianceDOGImage: item.complianceDOGImage || "",
        complianceCATImage: item.complianceCATImage || "",
        royalCaninSignageImage: item.royalCaninSignageImage || "",
        visibilityCashierImage: item.visibilityCashierImage || "",
        endcapGondolaImage: item.endcapGondolaImage || "",
        wetProductsHighlightImage: item.wetProductsHighlightImage || "",
        tacticalBinImage: item.tacticalBinImage || "",
      }));

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching QTT Scoring data:", error.message);
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
        "https://react-rc-ugc-v2-backend.onrender.com/export-PSR-data",
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
        "Royal Canin Signage",
        "Royal Canin Signage Image",
        "First Brand Seen",
        "First Brand Image",
        "Compliance DOG",
        "Compliance DOG Image",
        "Compliance CAT",
        "Compliance CAT Image",
        "Visibility Cashier",
        "Visibility Cashier Image",
        "Endcap Gondola",
        "Endcap Gondola Image",
        "Wet Products Highlight",
        "Wet Products Highlight Image",
        "Tactical Bin",
        "Tactical Bin Image",
        "PSR Comment",
      ];

      const newData = response.data.data.map((item, index) => ({
        count: index + 1,
        date: item.date,
        merchandiserName: item.merchandiserName,
        outlet: item.outlet,
        userType: item.userType,
        royalCaninSignage: item.royalCaninSignage,
        royalCaninSignageImage: item.royalCaninSignageImage || "",
        firstBrand: item.firstBrandSeen,
        firstBrandImage: item.firstBrandImage || "",
        complianceDOG: item.complianceDOG,
        complianceDOGImage: item.complianceDOGImage || "",
        complianceCAT: item.complianceCAT,
        complianceCATImage: item.complianceCATImage || "",
        visibilityCashier: item.visibilityCashier,
        visibilityCashierImage: item.visibilityCashierImage || "",
        endcapGondola: item.endcapGondola,
        endcapGondolaImage: item.endcapGondolaImage || "",
        wetProductsHighlight: item.wetProductsHighlight,
        wetProductsHighlightImage: item.wetProductsHighlightImage || "",
        tacticalBin: item.tacticalBin,
        tacticalBinImage: item.tacticalBinImage || "",
        psrComment: item.PSRComment || "",
      }));

      console.log("Mapped Data:", newData);

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
        return { wch: maxLength + 5 }; // Add a little padding
      });

      ws["!cols"] = colWidths;

      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!ws[cellAddress]) return;
        ws[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
        };
      });

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

      XLSX.utils.book_append_sheet(wb, ws, "PSR_Data");

      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `PSR_DATA_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      alert(`Successfully exported ${newData.length} PSR records!`);
    } catch (error) {
      console.error("Export Error:", error);
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
              Show PSR
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
