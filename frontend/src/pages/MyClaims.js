import React, { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        const email = user ? user.email : null;

        if (!email) {
          setError("User email not found.");
          return;
        }

        const response = await axios.post(
          `${apiUrl}/api/claims/my-claims`,
          { email },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        console.log("Claims data:", response.data);
        setClaims(response.data);
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        setError("Failed to load your claims.");
      }
    };

    fetchMyClaims();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">My Claims</h2>
      {error && <p className="text-danger">{error}</p>}
      {claims.length === 0 ? (
        <p>You have not submitted any claims.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Policy Name</th>
              <th>Claim Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim._id}>
                <td>{claim.policyId?.name || "Unknown Policy"}</td>
                <td>Rs.{claim.amount}</td>
                <td>{claim.status}</td>
                <td>{new Date(claim.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
    </div>
  );
};

export default MyClaims;
