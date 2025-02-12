import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";  // To decode JWT token

const apiUrl = process.env.REACT_APP_API_URL;

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const navigate = useNavigate();

  // Retrieve Cognito JWT token from localStorage
  const token = localStorage.getItem("token");

  // Decode the token to get user role (if logged in)
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded["custom:role"]; // Custom attribute in Cognito
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/policies`);
        setPolicies(response.data);
      } catch (error) {
        console.error("Error fetching policies:", error);
      }
    };
    fetchPolicies();
  }, []);

  const handleTakePolicy = async (policyId) => {
    const token = localStorage.getItem("token"); // Get token fresh each time
    
    if (!token || token === "null" || token === "undefined") {
      alert("Please login to take a policy.");
      navigate("/login");
      return;
    }
  
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
  
      if (decoded.exp < currentTime) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
  
      const userEmail = decoded.email; // Extract email from decoded token
  
      // Send policyId and userEmail to the backend
      await axios.post(
        `${apiUrl}/api/policies/take`,
        { policyId, userEmail },  // Include userEmail in the request body
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert("Policy taken successfully!");
    } catch (error) {
      console.error("Error:", error); // Unified error handling
      if (error.response) {
        alert("Error taking policy: " + error.response.data.message);
      } else {
        alert("Invalid session. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };
  

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Policies</h2>

      {/* Show Create Policy button only for Admins */}
      {role === "admin" && (
        <button
          className="btn btn-primary mb-3"
          onClick={() => navigate("/admin/create-policy")}
        >
          Create Policy
        </button>
      )}

      <div className="row">
        {policies.map((policy) => (
          <div key={policy._id} className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{policy.name}</h5>
                <p className="card-text">{policy.description}</p>
                <p><strong>Premium:</strong> Rs.{policy.premium}</p>
                <p><strong>CoverageAmount:</strong> Rs.{policy.coverageAmount}</p>
                  {role !== "admin" && ( // Hide for admin
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          if (!token) {
                            alert("Please login to take a policy.");
                            navigate("/login");
                          }  else {
                            handleTakePolicy(policy._id);
                          }
                        }}
                      >
                        Take Policy
                      </button>
                    )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Policies;
