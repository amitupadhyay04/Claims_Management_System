import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Policies from "./pages/Policies";
import MyPolicies from "./pages/MyPolicies";
import AdminDashboard from "./pages/AdminDashboard";
import CreatePolicy from "./pages/CreatePolicy";
import SubmitClaim from "./pages/SubmitClaim"; // Import SubmitClaim
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContext } from "./AuthContext"; // Import AuthContext
import MyClaims from "./pages/MyClaims";

const App = () => {
  const { user } = useContext(AuthContext); // Use global auth state

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Redirect logged-in users from login/register */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          {/* ✅ Policies Page is now accessible to ALL users (including guests) */}
          <Route path="/policies" element={<Policies />} />

          {/* Protected Routes */}
          <Route
            path="/my-policies"
            element={
              <ProtectedRoute allowedRoles={["policyholder"]}>
                <MyPolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claim"
            element={
              <ProtectedRoute allowedRoles={["policyholder"]}>
                <MyClaims/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
           path="/admin/create-policy"
           element={
           <ProtectedRoute allowedRoles={["admin"]}>
           <CreatePolicy />
           </ProtectedRoute>
           }
           />
           <Route
            path="/submit-claim/:policyId/:email"
            element={
            <ProtectedRoute allowedRoles={["policyholder"]}>
            <SubmitClaim />
            </ProtectedRoute>
            }
            />
        </Routes>

      </div>
    </Router>
  );
};

export default App;
