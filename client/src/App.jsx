import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Toast notifications

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LiveStats from "./components/LiveStats";
import StakingFeatures from "./components/StakingFeatures";
import SecurityMeasures from "./components/SecurityMeasures";
import UserGuide from "./components/UserGuide";
import SupportSection from "./components/SupportSection";
import Footer from "./components/Footer";
import SolanaWallet from "./components/SolanaWallet";
import Auth from "./components/Auth";
import OtpVerification from "./components/OtpVerification";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./page/Layout"; // Import Layout component

import Home from "./page/Home";
import Dashboard from "./page/Dashboard";
import Wallet from "./page/Wallet";
import Deposit from "./page/Deposit";
import Withdraw from "./page/Withdraw";
import Profile from "./page/Profile";
import Referrals from "./page/Referrals";
import InvestmentCalculator from "./page/InvestmentCalculator";
import PaymentDetails from "./page/PaymentDetails";
import Support from "./page/Suppor";
import { Outlet } from "react-router-dom";

// Public Layout component
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default function App() {
  return (
    <div className="bg-gradient-to-b from-[#F8FAFC] to-[#E3E8F0] min-h-screen">
      <Router>
        <Toaster /> {/* Global toast notifications */}
        <Routes>
          {/* ✅ OTP Verification Route */}
          <Route path="/verify-otp" element={<OtpVerification />} />

          {/* ✅ Public Routes with Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Hero />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Individual components without layout */}
          <Route path="/livestats" element={<LiveStats />} />
          <Route path="/staking" element={<StakingFeatures />} />
          <Route path="/security" element={<SecurityMeasures />} />
          <Route path="/guide" element={<UserGuide />} />
          <Route path="/support" element={<SupportSection />} />

          {/* ✅ Protected Dashboard Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calculator" element={<InvestmentCalculator />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/payment-details" element={<PaymentDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/supportsection" element={<Support />} />
          </Route>

          {/* ✅ Fixed: Protected Solana Wallet Route */}
          <Route
            path="/wallets"
            element={
              <ProtectedRoute>
                <SolanaWallet />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}
