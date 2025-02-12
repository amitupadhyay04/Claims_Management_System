import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;


const CreatePolicy = () => {
  const navigate = useNavigate();
  const [policyData, setPolicyData] = useState({
    name: "",
    description: "",
    coverageAmount: "",
    premium: "",
    category: "health",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setPolicyData({ ...policyData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token"); // Fetch token

    if (!token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/policies`, policyData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Policy created successfully!");
      navigate("/policies");
    } catch (error) {
      console.error("Error creating policy:", error);
      setError(error.response?.data?.message || "Failed to create policy.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Policy</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={policyData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={policyData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Coverage Amount</label>
          <input
            type="number"
            className="form-control"
            name="coverageAmount"
            value={policyData.coverageAmount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Premium</label>
          <input
            type="number"
            className="form-control"
            name="premium"
            value={policyData.premium}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-control"
            name="category"
            value={policyData.category}
            onChange={handleChange}
            required
          >
            <option value="health">Health</option>
            <option value="life">Life</option>
            <option value="auto">Auto</option>
            <option value="home">Home</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Create Policy
        </button>
      </form>
    </div>
  );
};

export default CreatePolicy;
