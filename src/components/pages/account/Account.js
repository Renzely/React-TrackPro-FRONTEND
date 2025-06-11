import "./account.css";
import * as React from "react";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbar,
} from "@mui/x-data-grid";
import axios, { isAxiosError } from "axios";
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
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useDemoData } from "@mui/x-data-grid-generator";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { Autocomplete } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

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

export default function Account() {
  const { data, loading } = useDemoData({
    dataSet: "Commodity",
    rowLength: 4,
    maxColumns: 6,
  });

  const [userData, setUserData] = React.useState([]);
  const [selectedRoles, setselectedRoles] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const [updateStatus, setUpdateStatus] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState("");

  var test = "testing";

  const requestBody = { isActivate: updateStatus, emailAddress: userEmail };

  const [modalFullName, setModalFullName] = React.useState("");
  const [modalBranch, setModalBranch] = React.useState("");
  const [modalEmail, setModalEmail] = React.useState("");
  const [modalPhone, setModalPhone] = React.useState("");

  const [openDialog, setOpenDialog] = React.useState(false);
  const roleAccount = localStorage.getItem("roleAccount"); // Get roleAccount from localStorage
  const allowedRoles = [
    "ACCOUNT SUPERVISOR",
    "OPERATION OFFICER",
    "OPERATION HEAD",
    "COORDINATOR",
  ];
  const isAllowed = allowedRoles.includes(roleAccount); // Check if role is allowed

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const [branches, setBranches] = React.useState([
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
    "ABBY PET FOOD SHOP",
    "ACMC ENTERPRISES OPC",
    "ANGELS PET SUPPLIES",
    "CELLARIS PET SHOP AND SUPPLIES",
    "CHOI PET SHOP",
    "CORIX PET SUPPLIES",
    "DOODIES PET SHOP",
    "DOODIES PET SHOP",
    "FIRST SOMACO MARKETING INC.",
    "FOUR-LEGGED FRIENDS, INC.",
    "FURCO CONSUMER GOODS TRADING",
    "FURPET'S-CHOICE PET STORE",
    "FURRY-POP PET SUPPLIES AND ACCESSORIES SHOP",
    "GLAM GROOMS PET CARE SERVICES",
    "GOLDEN 3 PET SUPPLIES & GROOMING STATION",
    "GRINSY PETSHOP",
    "I PAW U PET CARE SERVICES",
    "JMPVC PET STORE",
    "JZJ PET TRADING CORP.",
    "M&H PET SUPPLIES AND ACCESSORIES SHOP",
    "MCPET PET CARE SERVICES",
    "METROPAWLITAN INC.",
    "MIGHTY-WAGGERS PET SUPPLIES AND ACCESSORIES",
    "MR DOODIES PET SUPPLIES AND ACCESSORIES TRADING",
    "NGIKNGIKANDFRIENDS PET SUPPLIES",
    "PAMPAO PET FOOD STORE",
    "PAWPAWLAND PET PARK",
    "PET BLVD. GROOMING & SHOPPING CENTRE INC",
    "PET CULTURE PET SUPPLIES",
    "PET STYLERS MANILA OPC",
    "PETKINGDOM PET STATION",
    "R&D PAW STORE PET SUPPLIES",
    "TAIL TALES PET STORE",
    "TOB & TUB DOG FOOD AND ACCESSORIES SHOP",
    "URBAN TAILS INC.",
    "VERMILLION TAILS PET GROOMING SERVICES",
    "WINWINZ CONSUMER GOODS TRADING",
    "YK FUR FRIENDS INC.",
    "ZILVER PET STORE",
    "102 PET SHOP",
    "A&A MULTI INC.",
    "AVT PET SUPPLIES AND ACCESSORIES TRADING",
    "CMN TRADING CORP.",
    "DOGGIELAND PET & SUPPLIES CENTER SAN JUA",
    "DOGGIELAND PET & SUPPLIES CENTER MANDALUYON",
    "DOGGIELAND PET & SUPPLIES CENTER CARTIMA",
    "EAGLESTAG TRADING",
    "FURRPET AGRIVET TRADING CORPORATION",
    "GING HAPPY PAWZ PETSHOP",
    "GOTFISH PET SHOP",
    "HAPPY PAW PET GUILD INCORPORATED",
    "HAPPY'S PET SUPPLIES AND ACCESSORIES SHOP",
    "HIGH FIVE PET SUPPLIES INC.",
    "KAP'S TRADING CORPORATION",
    "KENSIAN PET SUPPLIES",
    "LITTLEMONSTER PET CARE SERVICES",
    "Marc & Marie Pet Grooming Services",
    "OKIKO PEARL PHILIPPINES INC. PASA",
    "PAWS AND BEANS PET SUPPLIES STORE",
    "PAWS N'PLAY PET CARE SERVICES",
    "PAWS WORLD PET CENTER",
    "PAWSHOPPE BY BIYAYA PET GROOMING SERVICES",
    "PET UMBRELLA INC.",
    "PETDISTRICTMNL PET SUPPLIES AND ACCESSORIES SHOP",
    "PHOENIX888 PET SUPPLIES TRADING",
    "POOCH DISTRICT PET GROOMING SALON",
    "RONJAY GENERAL MERCHANDISE PASA",
    "SEA AND LAND PET SHOP",
    "TML TRADING CORPORATION",
    "W.E PET SUPPLIES",
  ]); //Branches

  const handleRoleChange = (event) => {
    setselectedRoles(event.target.value);
  };

  const filteredData =
    selectedRoles === "" || selectedRoles === "UNFILTERED"
      ? userData
      : userData.filter((user) => user.role === selectedRoles);

  // State for the second modal
  const [openBranchModal, setOpenBranchModal] = React.useState(false);
  const handleOpenBranchModal = () => setOpenBranchModal(true);
  const handleCloseBranchModal = () => setOpenBranchModal(false);

  // State for selected branches
  const [selectedBranches, setSelectedBranches] = React.useState([]);

  // Update the branch of the user with the selected branches
  // Update the branch of the user with the selected branches
  const handleBranchSave = async () => {
    try {
      // Update the user's branches with the selected branches
      const response = await axios.put(
        "https://react-rc-ugc-v2-backend.onrender.com/update-user-branch",
        {
          email: modalEmail,
          outlet: selectedBranches,
        }
      );

      // Update the branch field in the userData state
      const updatedUserData = userData.map((user) => {
        if (user.email === modalEmail) {
          return {
            ...user,
            Branch: selectedBranches.join(", "), // Update the Branch field
          };
        }
        return user;
      });

      setUserData(updatedUserData); // Set the updated userData state

      // After successful update, you might want to refresh the user data
      getUser();
      setTimeout(() => window.location.reload(), 1000);
      handleCloseBranchModal(); // Close the branch selection modal after saving
    } catch (error) {
      console.error("Error updating user branches:", error);
    }
  };

  const capitalizeWords = (words) => {
    if (!words || !Array.isArray(words)) return [];

    return words.map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    );
  };

  const columns = [
    { field: "count", headerName: "#", width: 75 },
    {
      field: "firstName",
      headerName: "FIRST NAME",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "middleName",
      headerName: "MIDDLE NAME",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "lastName",
      headerName: "LAST NAME",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "emailAddress",
      headerName: "EMAIL ADDRESS",
      width: 200,
      headerClassName: "bold-header",
    },
    {
      field: "role",
      headerName: "CLIENT",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "contactNum",
      headerName: "CONTACT NUMBER",
      width: 200,
      headerClassName: "bold-header",
    },
    {
      field: "outlet",
      headerName: "OUTLETS",
      width: 300,
      headerClassName: "bold-header",
    },
    {
      field: "isActive",
      headerName: "STATUS",
      headerClassName: "bold-header",
      width: 150,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        const status = params.row.isActive;
        const rowEmail = params.row.emailAddress;
        const roleAccount = localStorage.getItem("roleAccount"); // Get role from localStorage

        const onClick = (e) => {
          if (allowedRoles.includes(roleAccount)) {
            setUpdateStatus(params.row.isActive ? false : true); // Set status based on current state
            setUserEmail(params.row.emailAddress);
            handleOpenDialog(); // Open the dialog
          }
        };

        return (
          <>
            {status ? (
              <Stack>
                <ColorButton
                  variant="contained"
                  size="small"
                  style={{
                    width: "50%",
                    marginTop: "13px",
                    backgroundColor: "#0A21C0",
                    color: "#FFFFFF",
                  }}
                  onClick={onClick}
                  disabled={!isAllowed}
                >
                  Active
                </ColorButton>
              </Stack>
            ) : (
              <Stack>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  style={{ width: "50%", marginTop: "13px" }}
                  onClick={onClick}
                  disabled={!isAllowed}
                >
                  Inactive
                </Button>
              </Stack>
            )}
          </>
        );
      },
    },
    {
      field: "action",
      headerClassName: "bold-header",
      headerName: "ACTION",
      width: 90,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        const onClick = (e) => {
          let mFullname = params.row.firstName + " " + params.row.lastName;
          let condition = params.row.middleName;
          let mOutlet = params.row.outlet;
          let mEmail = params.row.emailAddress;
          let mPhone = params.row.contactNum;
          if (condition === "Null") {
            mFullname = params.row.firstName + " " + params.row.lastName;
          } else {
            mFullname =
              params.row.firstName +
              " " +
              params.row.middleName +
              " " +
              params.row.lastName;
          }

          setModalFullName(mFullname);
          setModalBranch(mOutlet);
          setModalEmail(mEmail);
          setModalPhone(mPhone);

          return handleOpen();
        };

        return (
          <Stack>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={onClick}
              style={{
                width: "50%",
                marginTop: "13px",
                backgroundColor: "#0A21C0",
                color: "#FFFFFF",
              }}
            >
              <PersonIcon />
            </Button>
          </Stack>
        );
      },
    },
  ];

  async function getUser() {
    try {
      const loggedInBranch = localStorage.getItem("outlet");

      const loggedInBranches = loggedInBranch
        .split(",")
        .map((outlet) => outlet.trim());

      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/get-all-user"
      );
      const data = response.data.data;

      const filteredData = data.filter((item) => {
        return loggedInBranches.some((outlet) => item.outlet?.includes(outlet));
      });

      const newData = filteredData.map((data, key) => {
        const capitalizedNames = capitalizeWords([
          data.firstName,
          data.middleName || "",
          data.lastName,
        ]);

        return {
          count: key + 1,
          role: data.role,
          outlet: data.outlet,
          firstName: capitalizedNames[0],
          middleName: capitalizedNames[1] || "Null",
          lastName: capitalizedNames[2],
          username: data.username,
          emailAddress: data.email, // now using `email` from updated schema
          contactNum: data.contactNumber, // now using `contactNumber`
          isActive: data.isVerified, // now using `isVerified`
        };
      });

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function setStatus() {
    // Use the states you’ve already set: userEmail and updateStatus
    const requestBody = {
      email: userEmail,
      isVerified: updateStatus, // true or false
    };

    console.log("Sending data:", requestBody);

    try {
      const response = await axios.put(
        "https://react-rc-ugc-v2-backend.onrender.com/update-user-status",
        requestBody
      );
      console.log("Response:", response.data);

      if (response.data.status === 200) {
        // Update local data if needed, e.g., update userData state
        window.location.reload(); // Or better: update userData directly instead of reload
      } else {
        console.error("Update failed:", response.data.data);
        alert("Failed to update status: " + response.data.data);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Error occurred: " + error.message);
    }
  }

  React.useEffect(() => {
    getUser();

    // Load the selected branches from localStorage if available
    const savedBranches = JSON.parse(localStorage.getItem("selectedBranches"));
    if (Array.isArray(savedBranches)) {
      setSelectedBranches(savedBranches); // Pre-select outlets based on saved branches
    }
  }, []); // Only run on mount

  const handleChange = (event, newValue) => {
    setSelectedBranches(newValue);
    // Save selected outlets to localStorage
    localStorage.setItem("selectedBranches", JSON.stringify(newValue));
  };

  return (
    <div className="account">
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
          {/* Responsive DataGrid */}
          <Box
            sx={{
              height: "100%",
              width: "100%",
              maxHeight: "80vh",
              marginTop: 2,
              overflow: "auto",
              "& .MuiDataGrid-root": {
                backgroundColor: "#fff",
              },
            }}
          >
            <DataGrid
              //rows={userData}
              rows={filteredData}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
                columns: {
                  columnVisibilityModel: {
                    address: false,
                    phone: false,
                  },
                },
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
            />
          </Box>

          {/* Responsive Modal */}
          <Modal
            open={openModal}
            onClose={handleCloseDialog}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                padding: 4,
                backgroundColor: "white",
                margin: { xs: "10% auto", md: "5% auto" },
                width: { xs: "90%", sm: "70%", md: "50%" },
                maxHeight: "80vh",
                overflowY: "auto",
                boxShadow: 24,
                borderRadius: 2,
              }}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Full Details
              </Typography>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {/* Display Full Details */}
                <TextField
                  label="Full Name"
                  id="modal-full-name"
                  defaultValue={modalFullName}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
                <TextField
                  label="Email"
                  id="modal-email"
                  defaultValue={modalEmail}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
                <TextField
                  label="Contact Number"
                  id="modal-phone"
                  defaultValue={modalPhone}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />

                <TextField
                  label="Outlet"
                  id="modal-outlets"
                  value={
                    Array.isArray(modalBranch)
                      ? modalBranch.join(", ") // Join selected branches as a comma-separated string
                      : modalBranch || "" // Handle null/undefined cases
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />

                {/* Dropdown for selecting branches */}
                <Autocomplete
                  multiple
                  id="branches-autocomplete"
                  options={[...new Set(branches)]}
                  value={selectedBranches} // Bind the selected outlets to value
                  onChange={handleChange}
                  disableCloseOnSelect
                  filterOptions={(options, { inputValue }) => {
                    return options.filter((option) =>
                      option.toLowerCase().includes(inputValue.toLowerCase())
                    );
                  }}
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Select Outlet"
                      placeholder="Select Outlet"
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox style={{ marginRight: 8 }} checked={selected} />
                      {option}
                    </li>
                  )}
                />
                {/* Buttons for selecting/removing all outlets */}
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    onClick={() => setSelectedBranches(branches)}
                    variant="outlined"
                    sx={{
                      backgroundColor: "#0A21C0",
                      color: "#FFFFFF",
                      borderColor: "FFFFFF",
                      "&:hover": { backgroundColor: "#0A21C0" },
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={() => setSelectedBranches([])}
                    variant="outlined"
                    sx={{
                      backgroundColor: "#A31D1D",
                      color: "rgb(255, 255, 255)",
                      borderColor: "FFFFFF",
                      "&:hover": { backgroundColor: "#A31D1D" },
                    }}
                  >
                    Remove All
                  </Button>
                </Stack>

                {/* Save Outlet Changes Button */}
                <Button
                  onClick={() => handleBranchSave(modalEmail)}
                  variant="contained"
                  sx={{
                    backgroundColor: "#0A21C0",
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: "#0A21C0" },
                  }}
                >
                  Save Outlet Changes
                </Button>

                {/* Buttons for closing the modal */}
                <DialogActions sx={{ justifyContent: "space-between" }}>
                  <Button onClick={handleClose}>Close</Button>
                </DialogActions>
              </Stack>
            </Box>
          </Modal>

          {/* Branch Selection Dialog */}
          <Dialog
            open={openBranchModal}
            onClose={handleCloseBranchModal}
            aria-labelledby="branch-dialog-title"
            aria-describedby="branch-dialog-description"
            fullWidth
            maxWidth="md"
          >
            <DialogTitle id="branch-dialog-title">Select Branch</DialogTitle>
            <DialogContent>
              <Autocomplete
                multiple
                id="branches-autocomplete"
                options={branches}
                defaultValue={selectedBranches}
                onChange={(event, value) => setSelectedBranches(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Select Branch"
                    placeholder="Select Branch"
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseBranchModal}>Cancel</Button>
              <Button onClick={handleBranchSave} autoFocus>
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Account Activation Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Account Activation
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {updateStatus
                  ? "Are you sure you want to set this user as active?"
                  : "Are you sure you want to set this user as inactive?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={setStatus} autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </div>
  );
}

const ColorButton = styled(Button)(({ theme }) => ({
  color: "#000",
  backgroundColor: "#F6FAB9",
  "&:hover": {
    backgroundColor: "#CAE6B2",
  },
}));
