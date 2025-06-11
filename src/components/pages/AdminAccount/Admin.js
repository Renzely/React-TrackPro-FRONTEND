import "./admin.css";
import * as React from "react";
import { useState } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbar,
} from "@mui/x-data-grid";
import { Checkbox, Autocomplete } from "@mui/material";
import axios, { isAxiosError } from "axios";
import { Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useDemoData } from "@mui/x-data-grid-generator";
import TextField from "@mui/material/TextField";
import Topbar from "../../topbar/Topbar";
import Sidebar from "../../sidebar/Sidebar";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import FormControl, { useFormControl } from "@mui/material/FormControl";
import { Warehouse, Visibility } from "@mui/icons-material";
import Swal from "sweetalert2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { type } from "@testing-library/user-event/dist/type";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Otpstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
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

export default function Admin() {
  const { data, loading } = useDemoData({
    dataSet: "Commodity",
    rowLength: 4,
    maxColumns: 6,
  });

  const [userData, setUserData] = React.useState([]);
  const [merchandiserData, setMerchandiserData] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openStatusDialog, setOpenStatusDialog] = React.useState(false);
  const [openViewModal, setOpenViewModal] = React.useState(false);

  const [updateStatus, setUpdateStatus] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");

  const requestBody = { isVerified: updateStatus, emailAddress: userEmail };

  const [showPassword, setShowPassword] = React.useState(false);

  const [otpCode, setOtpCode] = React.useState();
  const [inputOtpCode, setInputOtpCode] = React.useState();
  const [inputOtpCodeError, setInputOtpCodeError] = React.useState();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [adminSelectedRole, setSelectedRole] = React.useState("");
  const [adminSelectedMerchandiser, setAdminSelectedMerchandiser] = useState(
    []
  );
  const [adminSelectedBranch, setSelectedBranch] = useState([]);
  const [adminFirstName, setAdminFirstName] = React.useState("");
  const [adminMiddleName, setAdminMiddleName] = React.useState("");
  const [adminLastName, setAdminLastName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminAddress, setAdminAddress] = React.useState("");
  const [adminPhone, setAdminPhone] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = React.useState("");

  const [adminRoleError, setAdminRoleError] = React.useState("");
  const [adminBranchError, setAdminBranchError] = React.useState("");
  const [adminFirstNameError, setAdminFirstNameError] = React.useState("");
  const [adminMiddleNameError, setAdminMiddleNameError] = React.useState("");
  const [adminLastNameError, setAdminLastNameError] = React.useState("");
  const [adminEmailError, setAdminEmailError] = React.useState("");
  const [adminAddressError, setAdminAddressError] = React.useState("");
  const [adminPhoneError, setAdminPhoneError] = React.useState("");
  const [adminPasswordError, setAdminPasswordError] = React.useState("");
  const [adminConfirmPasswordError, setAdminConfirmPasswordError] =
    React.useState("");

  const [adminViewBranch, setAdminViewBranch] = React.useState("");
  const [adminViewFullName, setAdminViewFullName] = React.useState("");
  const [adminViewEmail, setAdminViewEmail] = React.useState("");
  const [adminViewAddress, setAdminViewAddress] = React.useState("");
  const [adminViewPhone, setAdminViewPhone] = React.useState("");
  const [adminViewJDate, setAdminViewJDate] = React.useState("");

  const [openBranchModal, setOpenBranchModal] = React.useState(false);
  const [selectedBranches, setSelectedBranches] = useState(
    adminViewBranch || []
  );

  const [modalEmail, setModalEmail] = React.useState("");

  const handleBranchSave = async (email) => {
    try {
      const response = await axios.put(
        "https://react-rc-ugc-v2-backend.onrender.com/update-admin-outlet",
        {
          emailAddress: email, // Use the passed email directly
          outlet: selectedBranches,
        }
      );

      // Update the branch field in the userData state immediately
      const updatedUserData = userData.map((user) => {
        if (user.emailAddress === email) {
          return {
            ...user,
            Branch: selectedBranches.join(", "),
          };
        }
        return user;
      });

      setUserData(updatedUserData);

      handleCloseBranchModal();

      // Refresh the page after closing the modal
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error(
        "Error updating user branches:",
        error.response?.data || error.message
      );
      handleCloseBranchModal();
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const merchandiser = [];

  const outlets = [
    "OFFICE",
    "HEAD OFFICE",
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
    "DOGGIELAND PET & SUPPLIES CENTER) SAN JUA",
    "DOGGIELAND PET & SUPPLIES CENTER) MANDALUYON",
    "DOGGIELAND PET & SUPPLIES CENTER) CARTIMA",
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
    "OKIKO PEARL PHILIPPINES INC.) PASA",
    "PAWS AND BEANS PET SUPPLIES STORE",
    "PAWS N'PLAY PET CARE SERVICES",
    "PAWS WORLD PET CENTER",
    "PAWSHOPPE BY BIYAYA PET GROOMING SERVICES",
    "PET UMBRELLA INC.",
    "PETDISTRICTMNL PET SUPPLIES AND ACCESSORIES SHOP",
    "PHOENIX888 PET SUPPLIES TRADING",
    "POOCH DISTRICT PET GROOMING SALON",
    "RONJAY GENERAL MERCHANDISE) PASA",
    "SEA AND LAND PET SHOP",
    "TML TRADING CORPORATION",
    "W.E PET SUPPLIES",
  ];

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleDiserChange = (event, newValue) => {
    setAdminSelectedMerchandiser(newValue);
  };

  const handleChange = (event, newValue) => {
    setSelectedBranch(newValue);
  };

  const handleFirstNameChange = (e) => {
    setAdminFirstName(e.target.value);
    if (e.target.value.length < 2) {
      setAdminFirstNameError("Please enter valid name");
    } else {
      setAdminFirstNameError(false);
    }
  };

  const handleMiddleNameChange = (e) => {
    setAdminMiddleName(e.target.value);
    if (e.target.value.length < 2) {
      setAdminMiddleNameError("Please enter valid name");
    } else {
      setAdminMiddleNameError(false);
    }
  };

  const handleLastNameChange = (e) => {
    setAdminLastName(e.target.value);
    if (e.target.value.length < 2) {
      setAdminLastNameError("Please enter valid name");
    } else if (e.target.value.length > 20) {
      setAdminLastNameError("Name must be less than 20 characters long");
    } else if (!/^[a-zA-Z ]+$/.test(e.target.value)) {
      setAdminLastNameError("Name must contain only letters and spaces");
    } else {
      setAdminLastNameError(false);
    }
  };

  const handleEmailChange = (e) => {
    setAdminEmail(e.target.value);
    if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$/.test(e.target.value)) {
      setAdminEmailError("Invalid email address");
    } else {
      setAdminEmailError(false);
    }
  };

  const handlePhoneChange = (e) => {
    if (e.target.value.length > 11) return;
    setAdminPhone(e.target.value);
    if (e.target.value.length < 2) {
      setAdminPhoneError("Please enter valid phone number");
    } else {
      setAdminPhoneError(false);
    }
  };

  const handleAddressChange = (e) => {
    setAdminAddress(e.target.value);
    if (e.target.value.length < 2) {
      setAdminAddressError("NPlease enter valid address");
    } else {
      setAdminAddressError(false);
    }
  };

  const handlePasswordChange = (e) => {
    setAdminPassword(e.target.value);

    if (e.target.value.length < 2) {
      setAdminPasswordError("Please enter valid password");
    } else {
      setAdminPasswordError(false);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setAdminConfirmPassword(e.target.value);
    if (e.target.value !== adminPassword) {
      setAdminConfirmPasswordError("Password does not match!");
    } else {
      setAdminConfirmPasswordError(false);
    }
  };

  const handleCloseBranchModal = () => {
    setOpenBranchModal(false);
  };

  const handleOtpCodeChange = (e) => {
    if (e.target.value.length > 4) return;

    setInputOtpCode(e.target.value);
  };

  const handleOpenDialog = () => {
    setOpenModal(true);
  };

  const handleCloseDialog = () => {
    setOpenModal(false);
  };

  const handleCloseOtpDialog = () => {
    setOpenDialog(false);
  };

  const handleStatusCloseDialog = () => {
    setOpenStatusDialog(false);
  };

  const handleViewCloseModal = () => {
    setOpenViewModal(false);
  };

  // const handleUpdate = async () => {
  //   try {
  //     // Extract emails
  //     const selectedEmails = adminSelectedMerchandiser.map(
  //       (item) => item.emailAddress
  //     );

  //     console.log("Selected emails:", selectedEmails);

  //     // Ensure selectedEmails is not empty and all elements are strings
  //     if (
  //       selectedEmails.length === 0 ||
  //       selectedEmails.some((email) => typeof email !== "string")
  //     ) {
  //       console.warn("No emails selected or invalid email format");
  //       return;
  //     }

  //     // Send the emails to the backend
  //     const response = await axios.post(
  //       "https://react-rc-ugc-v2-backend.onrender.com/update-coor-details",
  //       {
  //         emails: selectedEmails,
  //       }
  //     );

  //     if (response.status === 200) {
  //       console.log("Update successful");
  //       handleViewCloseModal();
  //     } else {
  //       console.error("Failed to update CoorDetails:", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error updating CoorDetails:", error);
  //   }
  // };

  const columns = [
    {
      field: "count",
      headerName: "#",
      width: 100,
      headerClassName: "bold-header",
    },
    {
      field: "roleAccount",
      headerName: "Role",
      width: 200,
      headerClassName: "bold-header",
    },
    {
      field: "outlet",
      headerName: "Outlet",
      width: 200,
      headerClassName: "bold-header",
    },
    {
      field: "firstName",
      headerName: "First name",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "middleName",
      headerName: "Middle name",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "lastName",
      headerName: "Last name",
      width: 150,
      headerClassName: "bold-header",
    },
    {
      field: "emailAddress",
      headerName: "Email",
      width: 250,
      headerClassName: "bold-header",
    },
    {
      field: "contactNum",
      headerName: "Contact Number",
      headerClassName: "bold-header",
    },
    //   {
    //     field: 'date_join',
    //     headerName: 'Date Join',
    //   },
    {
      field: "isVerified",
      headerName: "Status",
      headerClassName: "bold-header",
      width: 150,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        const status = params.row.isVerified;
        const rowEmail = params.row.emailAddress;
        const onClick = (e) => {
          {
            status ? setUpdateStatus(false) : setUpdateStatus(true);
          }
          setUserEmail(rowEmail);
          setOpenStatusDialog(true);
        };

        return (
          <>
            {status ? (
              <Stack>
                <ColorButton
                  variant="contained"
                  size="small"
                  style={{
                    width: "70%",
                    marginTop: "13px",
                    backgroundColor: "#0A21C0",
                    color: "#FFFFFF",
                  }}
                  onClick={onClick}
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
                  style={{ width: "70%", marginTop: "13px" }}
                  onClick={onClick}
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
      headerName: "Action",
      headerClassName: "bold-header",
      width: 150,
      sortable: false,
      disableClickEventBubbling: true,

      renderCell: (params) => {
        const onClick = (e) => {
          let rFullname;
          let rMiddleName = params.row.middleName;
          let rEmail = params.row.emailAddress;
          let rPhone = params.row.contactNum;
          let rOutlet = params.row.outlet;
          //let rJDate = params.row.date_join;
          if (rMiddleName === "Null") {
            rFullname = params.row.firstName + " " + params.row.lastName;
          } else {
            rFullname =
              params.row.firstName +
              " " +
              params.row.middleName +
              " " +
              params.row.lastName;
          }
          setAdminViewBranch(rOutlet);
          setAdminViewFullName(rFullname);
          setAdminViewEmail(rEmail);
          setAdminViewPhone(rPhone);
          //   setAdminViewJDate(rJDate);

          return setOpenViewModal(true);
        };

        return (
          <Stack>
            <Button
              variant="contained"
              size="small"
              color="info"
              onClick={onClick}
              style={{
                width: "50%",
                marginTop: "13px",
                backgroundColor: "#0A21C0",
                color: "#FFFFFF",
              }}
            >
              View
            </Button>
          </Stack>
        );
      },
    },
  ];

  async function getUser() {
    try {
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/get-all-user"
      );
      const data = response.data.data;

      const newData = data.map((item, key) => ({
        id: item._id,
        label: `${item.firstName} ${item.lastName}`, // Combine names for display
        emailAddress: item.emailAddress,
      }));

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Fetch user data on component mount
  React.useEffect(() => {
    getUser();
    // getMerchandiserData();
  }, []);

  async function getUser() {
    try {
      const response = await axios.post(
        "https://react-rc-ugc-v2-backend.onrender.com/get-admin-user",
        requestBody
      );
      const data = response.data.data;

      const newData = data.map((user, index) => ({
        count: index + 1,
        roleAccount: user.roleAccount,
        remarks: user.remarks || "None",
        firstName: user.firstName,
        middleName: user.middleName || "Null",
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        contactNum: user.contactNum,
        username: user.username,
        outlet: user.outlet || [],
        type: user.type ?? null,
        isVerified: user.isVerified, // ✅ renamed here
      }));

      setUserData(newData);
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  }

  async function setStatus() {
    await axios
      .put(
        "https://react-rc-ugc-v2-backend.onrender.com/update-admin-status",
        requestBody
      )
      .then(async (response) => {
        const data = await response.data.data;

        window.location.reload();
      });
  }

  async function sendOtp() {
    if (adminSelectedRole === "") {
      Swal.fire({
        title: "Unable to proceed",
        text: "Please select Role!",
        icon: "error",
      });
      return;
    }

    if (adminSelectedBranch.length === 0) {
      Swal.fire({
        title: "Unable to proceed",
        text: "Please select Branch!",
        icon: "error",
      });
      return;
    }

    await axios
      .post("https://react-rc-ugc-v2-backend.onrender.com/send-otp", {
        email: adminEmail,
      })
      .then(async (response) => {
        const data = await response.data;

        if (data.status === 200) {
          setOtpCode(data.code);
          setOpenDialog(true);
        } else {
          Swal.fire({
            title: "Unable to proceed",
            text: "Sending OTP failed!",
            icon: "error",
          });
        }
      })
      .catch(function (error) {
        if (error.response) {
          Swal.fire({
            title: "Unable to proceed",
            text: error.response.data,
            icon: "error",
          });
          return;
        } else if (error.request) {
          Swal.fire({
            title: "Unable to proceed",
            text: error.request,
            icon: "error",
          });
          return;
        } else {
          Swal.fire({
            title: "Unable to proceed",
            text: error.message,
            icon: "error",
          });
          return;
        }
      });
  }

  async function confirmOtp() {
    if (otpCode === inputOtpCode) {
      const userDetails = {
        roleAccount: adminSelectedRole,
        outlet: adminSelectedBranch,
        firstName: adminFirstName,
        middleName: adminMiddleName,
        lastName: adminLastName,
        contactNum: adminPhone,
        emailAddress: adminEmail,
        password: adminPassword,
      };

      axios
        .post(
          "https://react-rc-ugc-v2-backend.onrender.com/register-user-admin",
          userDetails
        )
        .then(async (response) => {
          const data = response.data;

          if (data.status === 200) {
            Swal.fire({
              title: "Success",
              text: "User created successfully!",
              icon: "success",
              confirmButtonColor: "#3085d6",
            }).then((result) => {
              if (result.isConfirmed) {
                return window.location.reload();
              } else {
                return window.location.reload();
              }
            });
          } else {
            Swal.fire({
              title: "Unable to proceed",
              text: "Saving user Error!",
              icon: "error",
            });
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else if (otpCode !== inputOtpCode) {
      setInputOtpCodeError("OTP code does not match.");
    } else if (inputOtpCode.length < 4) {
      setInputOtpCodeError("Input must be 4 digits.");
    }
    return;
  }

  React.useEffect(() => {
    getUser();
    if (adminViewBranch && Array.isArray(adminViewBranch)) {
      setSelectedBranches(adminViewBranch); // Pre-select branches based on adminViewBranch
    }
  }, [adminViewBranch]);

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
          {/* Add User Button */}
          <Box sx={{ marginBottom: 2 }}>
            <Button
              onClick={handleOpenDialog}
              variant="contained"
              sx={{
                backgroundColor: "#0A21C0",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#050A4",
                },
              }}
              endIcon={<PersonAddAlt1Icon />}
            >
              Add User
            </Button>
          </Box>

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
              sx={{ overflowX: "scroll" }}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
                columns: {
                  columnVisibilityModel: {
                    contactNum: false,
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
              pageSizeOptions={[5, 10, 20, 50]}
              getRowId={(row) => row.count}
              disableRowSelectionOnClick
            />
          </Box>

          {/* OTP Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <FormControl sx={{ m: 2 }}>
                <Typography variant="body1">Enter OTP code:</Typography>
                <TextField
                  value={inputOtpCode}
                  error={inputOtpCodeError}
                  helperText={inputOtpCodeError}
                  type="number"
                  inputProps={{ maxLength: 4 }}
                  onChange={handleOtpCodeChange}
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseOtpDialog}>Cancel</Button>
              <Button onClick={confirmOtp} autoFocus>
                Create User
              </Button>
            </DialogActions>
          </Dialog>

          {/* Status Change Dialog */}
          <Dialog
            open={openStatusDialog}
            onClose={handleStatusCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Account Activation"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {updateStatus
                  ? "Are you sure you want to set this user as active?"
                  : "Are you sure you want to set this user as inactive?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleStatusCloseDialog}>Cancel</Button>
              <Button onClick={setStatus} autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Modal
            open={openViewModal}
            onClose={handleViewCloseModal}
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
                  defaultValue={adminViewFullName} // assuming `adminViewFullName` is passed as a prop or state
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
                <TextField
                  label="Email"
                  id="modal-email"
                  defaultValue={adminViewEmail}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
                <TextField
                  label="Contact Number"
                  id="modal-phone"
                  defaultValue={adminViewPhone}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />

                {/* Display Outlets in a TextField */}
                <TextField
                  label="Outlets"
                  id="modal-outlets"
                  value={
                    Array.isArray(adminViewBranch)
                      ? adminViewBranch.join(", ") // Join selected branches as a comma-separated string
                      : adminViewBranch || "" // Handle null/undefined cases
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
                  options={outlets}
                  value={selectedBranches}
                  onChange={(event, newValue) => setSelectedBranches(newValue)}
                  disableCloseOnSelect
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
                    onClick={() => setSelectedBranches(outlets)}
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
                  onClick={() => handleBranchSave(adminViewEmail)} // assuming `handleBranchSave` is correctly defined
                  variant="contained"
                  sx={{
                    backgroundColor: "#0A21C0",
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: "#0A21C0" },
                  }}
                >
                  Save Outlet Changes
                </Button>

                {/* Close Button */}
                <DialogActions sx={{ justifyContent: "space-between" }}>
                  <Button onClick={handleViewCloseModal}>Close</Button>
                </DialogActions>
              </Stack>
            </Box>
          </Modal>

          {/* Responsive Modal for Details */}
          <Modal
            open={openModal}
            onClose={handleCloseDialog}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              component="form"
              noValidate
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
                Admin Details:
              </Typography>
              {/* Form Fields */}
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  value={adminSelectedRole}
                  onChange={handleRoleChange}
                >
                  <MenuItem value="COORDINATOR">COORDINATOR</MenuItem>
                  <MenuItem value="ACCOUNT SUPERVISOR">
                    ACCOUNT SUPERVISOR
                  </MenuItem>
                  <MenuItem value="OPERATION OFFICER">
                    OPERATION OFFICER
                  </MenuItem>
                  <MenuItem value="OPERATION HEAD">OPERATION HEAD</MenuItem>
                  <MenuItem value="SENIOR OPERATION MANAGER">
                    SENIOR OPERATION MANAGER
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel id="outlet-select-label"></InputLabel>
                <Autocomplete
                  multiple
                  id="outlet-select"
                  options={outlets}
                  value={adminSelectedBranch}
                  onChange={handleChange}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} style={{ marginRight: 8 }} />
                      {option}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Branches"
                      placeholder="Select Branch"
                    />
                  )}
                />
              </FormControl>

              {/* More Form Fields */}
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="First Name *"
                  value={adminFirstName}
                  onChange={handleFirstNameChange}
                  error={adminFirstNameError}
                  helperText={adminFirstNameError}
                  autoComplete="off"
                  InputProps={{ autoComplete: "off" }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="Middle Name"
                  value={adminMiddleName}
                  onChange={handleMiddleNameChange}
                  error={adminMiddleNameError}
                  helperText={adminMiddleNameError}
                  autoComplete="off"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="Last Name *"
                  value={adminLastName}
                  onChange={handleLastNameChange}
                  error={adminLastNameError}
                  helperText={adminLastNameError}
                  autoComplete="off"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="Email *"
                  value={adminEmail}
                  onChange={handleEmailChange}
                  error={adminEmailError}
                  helperText={adminEmailError}
                  autoComplete="off"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="Contact Number *"
                  value={adminPhone}
                  onChange={handlePhoneChange}
                  error={adminPhoneError}
                  type="number"
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                  helperText={adminPhoneError}
                  autoComplete="off"
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="Password *"
                  value={adminPassword}
                  onChange={handlePasswordChange}
                  error={adminPasswordError}
                  helperText={adminPasswordError}
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="Confirm Password"
                  value={adminConfirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={adminConfirmPasswordError}
                  helperText={adminConfirmPasswordError}
                  type="password"
                  autoComplete="off"
                />
              </FormControl>
              {/* Action Buttons */}
              <DialogActions>
                <Button onClick={handleClose}>Close</Button>
                <Button onClick={sendOtp} autoFocus>
                  Confirm
                </Button>
              </DialogActions>
            </Box>
          </Modal>
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
