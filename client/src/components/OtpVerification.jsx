import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(120); // 2 minutes timer

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      alert("Invalid access. Redirecting...");
      navigate("/auth");
    }
  }, [email, navigate]);

  // Countdown Timer for Resend OTP
  useEffect(() => {
    if (resendDisabled) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 120; // Reset timer after enabling
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resendDisabled]);

  // ✅ Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Invalid OTP. Enter a 6-digit number.");
      return;
    }

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
        alert("✅ OTP Verified! You can now log in.");
        navigate("/auth");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      setError("❌ Network error. Please try again.");
      console.error("Error:", error);
    }
  };

  // 🔄 Resend OTP Handler
  const handleResendOtp = async () => {
    setError("");
    setResendDisabled(true);
    setTimer(120); // Restart 2-minute countdown

    try {
      const response = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("📩 New OTP has been sent to your email.");
      } else {
        setError(data.message || "Failed to resend OTP. Please try again.");
        setResendDisabled(false);
      }
    } catch (error) {
      setError("❌ Network error. Please try again.");
      console.error("Error:", error);
      setResendDisabled(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-neutral-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">OTP Verification</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Enter OTP</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-purple-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              pattern="\d{6}"
              title="Enter a 6-digit OTP"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendOtp}
            className="text-purple-400 hover:text-purple-500 text-sm"
            disabled={resendDisabled}
          >
            {resendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
