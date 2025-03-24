import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeUser } from "../redux/userSlice"; // Adjust path as needed
import { useNavigate, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Sidebar = ({ isOpen = true, toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Set active menu item based on current route
  const activeItem = location.pathname;

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        dispatch(removeUser());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still remove user from state and local storage even if API call fails
      dispatch(removeUser());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "fas fa-chart-line" },
    { name: "Staking", href: "/calculator", icon: "fas fa-coins" },
    { name: "Wallet", href: "/wallet", icon: "fas fa-wallet" },
    { name: "Deposit", href: "/deposit", icon: "fas fa-arrow-down" },
    { name: "Withdraw", href: "/withdraw", icon: "fas fa-arrow-up" },
    { name: "Profile", href: "/profile", icon: "fas fa-user" },
    { name: "Support", href: "/supportsection", icon: "fas fa-life-ring" },
    { name: "Referrals", href: "/referrals", icon: "fas fa-users" },
  ];

  return (
    <nav
      className={`fixed inset-y-0 left-0 ${
        isOpen ? "w-64" : "w-16"
      } bg-gradient-to-b from-[#18283b] to-[#0f172a] text-white flex flex-col shadow-xl z-50 transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-opacity-20 border-[#9945FF] flex justify-between items-center">
        <div
          className={`flex items-center transition-all duration-300 ${
            !isOpen ? "opacity-0 w-0" : "w-full"
          }`}
        >
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-[#9945FF] focus:outline-none flex items-center"
          >
            <i className="fas fa-solar-panel mr-2"></i>
            <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
              StakeSol
            </span>
          </button>
        </div>
        <button
          className="cursor-pointer p-2 rounded-full hover:bg-[#2c3e50] focus:outline-none"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i
            className={`fas ${
              isOpen ? "fa-chevron-left" : "fa-chevron-right"
            } text-[#14F195] text-lg`}
          ></i>
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className="flex-grow py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2c3e50] scrollbar-track-transparent">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.href)}
            className={`flex items-center px-6 py-3 hover:bg-[#2c3e50] transition-all rounded-md w-full ${
              activeItem === item.href
                ? "bg-opacity-50 bg-[#14F195] text-white border-l-4 border-[#14F195]"
                : "text-gray-300"
            }`}
          >
            <i
              className={`${item.icon} w-6 ${
                activeItem === item.href ? "text-[#14F195]" : ""
              }`}
            ></i>
            <span
              className={`ml-3 font-medium transition-all duration-300 ${
                !isOpen ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </div>

      {/* SOL Stats */}
      {isOpen && (
        <div className="px-4 py-3 bg-[#0c1522] bg-opacity-60 mx-2 rounded-lg mb-2">
          <h4 className="text-xs text-gray-400 mb-2">SOL STATS</h4>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs">APY:</span>
            <span className="text-[#14F195] text-xs font-semibold">7.2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs">Network:</span>
            <span className="text-[#14F195] text-xs font-semibold">
              Mainnet
            </span>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-opacity-20 border-[#9945FF] mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center ${
            isOpen ? "bg-[#14F195]" : "bg-transparent"
          } text-black py-2 rounded-md font-bold hover:bg-[#12d484] transition-all`}
        >
          <i
            className={`fas fa-sign-out-alt ${
              !isOpen ? "text-[#14F195]" : "text-black"
            }`}
          ></i>
          <span
            className={`transition-all duration-300 ml-2 ${
              !isOpen ? "hidden" : "block"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
