import { useState } from "react";
import { Link } from "react-router-dom";
import solanaLogo from "../assets/solana-logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <img src={solanaLogo} alt="Solana Logo" className="w-8 h-8" />
            <Link to="/" className="text-2xl font-bold text-[#635BFF]">
              StakeSol
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {["Home", "Live Stats", "Staking", "Security", "Guide", "Support"].map((item, index) => (
              <Link
                key={index}
                to={`/${item.toLowerCase().replace(/\s/g, "")}`}
                className="text-gray-700 hover:text-[#635BFF] font-medium transition-all duration-300"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Connect Wallet Button (Desktop) */}
          <div className="hidden md:block">
            <button className="bg-[#635BFF] hover:bg-[#5245D4] text-white px-5 py-2 rounded-lg font-medium transition-all duration-300">
              Connect Wallet
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="flex flex-col items-center space-y-4 py-4">
            {["Home", "Live Stats", "Staking", "Security", "Guide", "Support"].map((item, index) => (
              <Link
                key={index}
                to={`/${item.toLowerCase().replace(/\s/g, "")}`}
                className="text-gray-700 hover:text-[#635BFF] font-medium transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}

            <button className="bg-[#635BFF] hover:bg-[#5245D4] text-white px-5 py-2 rounded-lg font-medium transition-all duration-300">
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
