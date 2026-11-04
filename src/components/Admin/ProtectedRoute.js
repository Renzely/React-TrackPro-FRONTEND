import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "admin";
  return isLoggedIn ? children : <Navigate to="/" replace />;
}
