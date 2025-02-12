import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

const SubmitClaim = () => {
  const { policyId, email } = useParams();
  const navigate = useNavigate(); // Move inside the component

  const [formData, setFormData] = useState({
    policyId: policyId,
    description: "",
    amount: "",
    date: "",
    file: null,
  });

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      alert("Please upload a document.");
      return;
    }

    const fileData = new FormData();
    fileData.append("file", formData.file);

    try {
      console.log("Uploading file...");

      // Step 1: Upload the document
      const uploadResponse = await axios.post(
        `${apiUrl}/api/doc/upload`,
        fileData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("File uploaded:", uploadResponse.data);
      const fileUrl = uploadResponse.data.fileUrl;

      // Step 2: Submit the claim
      await axios.post(`${apiUrl}/api/claims`, {
        policyId: formData.policyId,
        amount: formData.amount,
        date: formData.date,
        description: formData.description,
        documentUrl: fileUrl,
        scannedData: uploadResponse.data.data,
        policyholderEmail: email,
      });

      alert("Claim submitted successfully!");
      navigate("/claim"); // Navigate after success
    } catch (error) {
      console.error("Error submitting claim:", error.response ? error.response.data : error.message);
      alert("Error submitting claim.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <h2 className="mb-4 text-center">Submit a Claim</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Policy ID</label>
            <input type="text" className="form-control" value={formData.policyId} disabled />
          </div>
          <div className="mb-3">
            <label className="form-label">Claim Description</label>
            <textarea
              className="form-control"
              placeholder="Describe your claim..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Upload Supporting Document</label>
            <input
              type="file"
              className="form-control"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Submit Claim
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitClaim;
