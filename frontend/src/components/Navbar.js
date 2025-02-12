import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AWS from "aws-sdk";
import { AuthContext } from "../AuthContext"; // Import AuthContext

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext); // Use AuthContext
  
  
  const handleLogout = () => {
    const token = localStorage.getItem("token");
  
    // If there is a valid token, proceed with logout
    if (token) {
      const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
        region: "us-east-1", // Update your region
      });
  
      const logoutParams = {
        AccessToken: token,
      };
  
      cognitoIdentityServiceProvider.globalSignOut(logoutParams, (err, data) => {
        if (err) {
          // Handle the error
          if (err.code === "NotAuthorizedException") {
            // Silently skip invalid token and log a more friendly message if needed
            console.log("Invalid token, user is already logged out.");
          } else {
            console.error("Logout error:", err);
          }
        } else {
          console.log("User logged out successfully:", data);
        }
      });
    }
  
    // Clear local auth state & local storage regardless of API response
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Update global auth state
    navigate("/login");
  };
  

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm p-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
        <img 
        src="/LYC-Symbol3.png"  // Update this with your image path
        alt="Logo"
        style={{ height: "85px", width: "85px", marginRight: "10px",borderRadius : "50%" }}
        />
         Light Years Claims
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/policies">
                Policies
              </Link>
            </li>

            {user ? (
              <>
                {user.role === "policyholder" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-policies">
                        My Policies
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/claim">
                        My Claims
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-danger ms-3 px-3" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
