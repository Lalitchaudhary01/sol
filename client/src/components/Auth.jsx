import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpVerification, setIsOtpVerification] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle login & registration
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!isLogin && (!name || password !== confirmPassword)) {
      toast.error("Please fill all fields and ensure passwords match.");
      return;
    }

    setLoading(true);
    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";

    const payload = isLogin
      ? { email, password }
      : { name, email, password, confirmPassword };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        if (isLogin) {
          toast.success("Login successful.");
          localStorage.setItem("token", data.token);
          navigate("/dashboard");
        } else {
          toast.success("OTP sent to your email.");
          setIsOtpVerification(true);
        }
      } else {
        if (data.redirectTo === "verifyOTP") {
          toast.error("Your account is not verified. Enter the OTP sent to your email.");
          setIsOtpVerification(true);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async (e) => {
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
        toast.success("Account verified. You can now log in.");
        setIsOtpVerification(false);
        setIsLogin(true);
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
          {isOtpVerification ? "Verify OTP" : isLogin ? "Login" : "Register"}
        </motion.h2>

        {isOtpVerification ? (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleOtpVerification}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium">OTP</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
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
                "Verify OTP"
              )}
            </button>
          </motion.form>
        ) : (
          <motion.form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-md bg-gray-100 text-black focus:ring-2 focus:ring-purple-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                ></motion.div>
              ) : isLogin ? "Login" : "Register"}
            </button>
          </motion.form>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-purple-400 hover:text-purple-500 text-sm"
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-500 text-sm"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
