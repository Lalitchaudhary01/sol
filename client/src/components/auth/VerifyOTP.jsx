import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("OTP verified. Set your new password.");
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerifyOTP}>
        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
      </form>
    </div>
  );
};

export default VerifyOTP;
