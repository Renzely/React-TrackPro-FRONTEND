import Topbar from "./components/topbar/Topbar";
import Sidebar from "./components/sidebar/Sidebar";
import "./App.css";
import "./defaultApp.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  createBrowserRouter,
} from "react-router-dom";

import ViewAttendance from "./components/pages/attendance/ViewAttendance";
import Attendance from "./components/pages/attendance/Attendance";
import Account from "./components/pages/account/Account";
import PSR from "./components/pages/PSR/PSR_TYPE";
import VET from "./components/pages/VET/VET_TYPE";
import Expiry from "./components/pages/expiry/Expiry";
import Login from "./components/Admin/login";
import Admin from "./components/pages/AdminAccount/Admin";
import ForgotPassword from "./components/Admin/forgotpassword";
import Path from "./path/Path";
import Competitors from "./components/pages/competitors/Competitors";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<Path />}>
          <Route path="/" element={<Login />} />
          <Route path="/dashBoard" element={<dashBoard />} />
          <Route path="/view-competitors" element={<Competitors />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/view-admin-accounts" element={<Admin />} />
          <Route path="/view-PSR" element={<PSR />} />
          <Route path="/view-VET" element={<VET />} />
          <Route path="/view-Expiry" element={<Expiry />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/view-attendance" element={<ViewAttendance />} />
          <Route path="/view-accounts" element={<Account />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
