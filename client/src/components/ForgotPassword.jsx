import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter email, 2: Verify OTP, 3: Reset Password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Request password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("OTP sent to your email");
        setStep(2); // Move to OTP verification step
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  // Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("Password reset successful");
        navigate("/"); // Redirect to login page
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-neutral-800 p-8 rounded-lg shadow-lg w-96"
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold mb-6 text-center"
        >
          {step === 1
            ? "Forgot Password"
            : step === 2
            ? "Verify OTP"
            : "Reset Password"}
        </motion.h2>

        {step === 1 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleForgotPassword}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                ></motion.div>
              ) : (
                "Send Reset OTP"
              )}
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">OTP</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              onClick={handleResetPassword}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                ></motion.div>
              ) : (
                "Reset Password"
              )}
            </button>
          </motion.div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-purple-400 hover:text-purple-500 text-sm"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
