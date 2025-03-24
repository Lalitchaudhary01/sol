import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../page/Sidebar"; // Adjust the import path as needed for your Sidebar component

const Layout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [contentMargin, setContentMargin] = useState("ml-64");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
        setContentMargin("ml-16");
      } else {
        setIsOpen(true);
        setContentMargin("ml-64");
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setContentMargin(isOpen ? "ml-16" : "ml-64");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div
        className={`${contentMargin} transition-all duration-300 flex-1 overflow-auto`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
