import Topbar from "./components/topbar/Topbar";
import Sidebar from "./components/sidebar/Sidebar";
import "./App.css";
import "./defaultApp.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ViewAttendance from "./components/pages/attendance/ViewAttendance";
import Attendance from "./components/pages/attendance/Attendance";
import Account from "./components/pages/account/Account";
import Login from "./components/Admin/login";
import Admin from "./components/pages/AdminAccount/Admin";
import ForgotPassword from "./components/Admin/forgotpassword";
import Path from "./path/Path";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<Path />}>
          <Route path="/" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/view-admin-accounts" element={<Admin />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/view-attendance" element={<ViewAttendance />} />
          <Route path="/view-accounts" element={<Account />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
