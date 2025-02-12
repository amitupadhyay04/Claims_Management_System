import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const apiUrl = process.env.REACT_APP_API_URL;

const MyPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState("");
  const [claimError, setClaimError] = useState("");
  const [email, setEmail] = useState(""); // Add a state for email
  const navigate = useNavigate(); // Initialize the navigate function

  // Fetch policies and claims
  useEffect(() => {
    const fetchMyPoliciesAndClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        
        if (!user) {
          setError("User data not found.");
          return;
        }

        const userEmail = user.email; // Extract email from user object
        setEmail(userEmail); // Set email in state

        // Fetch user policies
        const policiesResponse = await axios.post(
          `${apiUrl}/api/policies/my-policies`,
          { email: userEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Set policies
        setPolicies(policiesResponse.data);

      } catch (err) {
        setError("Failed to load your policies.");
      }
    };

    fetchMyPoliciesAndClaims();
  }, []); // Empty dependency array, runs once when the component mounts

  return (
    <div className="container mt-4">
      <h2 className="mb-3">My Policies</h2>
      {error && <p className="text-danger">{error}</p>}
      {claimError && <p className="text-danger">{claimError}</p>}
      {policies.length === 0 ? (
        <p>You have not enrolled in any policies.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Premium</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy._id}>
                <td>{policy.name}</td>
                <td>{policy.category}</td>
                <td>Rs.{policy.premium}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/submit-claim/${policy._id}/${email}`)} // Redirect to SubmitClaim page with policyId and email
                  >
                    Submit Claim
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyPolicies;
