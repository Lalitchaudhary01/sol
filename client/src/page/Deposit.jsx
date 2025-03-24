import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCopy, FiLink, FiRefreshCw } from "react-icons/fi";

const Deposit = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [usdValue, setUsdValue] = useState(0);
  const [solanaPrice, setSolanaPrice] = useState(100); // Default value until API fetches
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Your wallet address
  const walletAddress = "ENqqKBZQks2mchfQCKwhCadtG8atMUedCMdSywPZuCJR";

  const transactions = [
    { id: 1, status: "Pending", amount: "250 SOL", time: "2h ago" },
    { id: 2, status: "Success", amount: "500 SOL", time: "5h ago" },
    { id: 3, status: "Failed", amount: "100 SOL", time: "1d ago" },
    { id: 4, status: "Success", amount: "5 SOL", time: "2d ago" },
  ];

  const wallets = ["Phantom", "Trust Wallet", "MetaMask", "Exodus"];

  useEffect(() => {
    // Fetch data on component mount
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Solana price and wallet balance in parallel
      const [priceResponse, balanceResponse] = await Promise.all([
        fetchSolanaPrice(),
        fetchWalletBalance(),
      ]);

      // Update last fetched time
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please try again.");
      setIsLoading(false);
    }
  };

  const fetchSolanaPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Solana price");
      }

      const data = await response.json();
      const price = data.solana.usd;
      setSolanaPrice(price);

      // Update USD value if amount is already entered
      if (amount) {
        setUsdValue((amount * price).toFixed(2));
      }

      return price;
    } catch (error) {
      console.error("Error fetching Solana price:", error);
      // Keep using existing price
      return solanaPrice;
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [walletAddress],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wallet balance");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Error fetching balance");
      }

      // Get balance from API (convert from lamports to SOL)
      let balance = data.result?.value / 1e9 || 0;
      setWalletBalance(balance);

      // Store last known balance
      localStorage.setItem("lastKnownBalance", balance.toString());

      return balance;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);

      // Try to get the last known balance from localStorage
      const lastKnownBalance = localStorage.getItem("lastKnownBalance");
      if (lastKnownBalance && !isNaN(parseFloat(lastKnownBalance))) {
        setWalletBalance(parseFloat(lastKnownBalance));
        return parseFloat(lastKnownBalance);
      }

      // Fall back to zero if no cached balance
      setWalletBalance(0);
      return 0;
    }
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    setUsdValue((value * solanaPrice).toFixed(2));
  };

  const handleDeposit = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Generate transaction hash for simulation
    const txHash =
      "sol" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Store deposit details in localStorage
    localStorage.setItem("depositAmount", amount);
    localStorage.setItem("depositUsdValue", usdValue);
    localStorage.setItem(
      "depositDetails",
      JSON.stringify({
        amount: parseFloat(amount),
        usdValue: parseFloat(usdValue),
        timestamp: Date.now(),
        txHash: txHash,
        status: "pending", // Add status to track payment progress
      })
    );

    // Navigate to payment page
    navigate("/payment-details");
  };

  const refreshData = () => {
    fetchData();
  };

  return (
    <section className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Deposit Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Deposit SOL
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button
                className="float-right text-red-700"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount (SOL)
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#52AAC5] focus:border-[#52AAC5] transition-all duration-200"
            />
            <p className="mt-2 text-sm text-gray-500">≈ ${usdValue} USD</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Available Balance
              </p>
              <div className="flex items-center">
                <p className="text-xl font-semibold text-[#52AAC5]">
                  {isLoading ? "Loading..." : `${walletBalance.toFixed(2)} SOL`}
                </p>
                <button
                  onClick={refreshData}
                  className="ml-2 text-gray-500 hover:text-[#52AAC5]"
                  title="Refresh balance"
                >
                  <FiRefreshCw />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                ≈ ${(walletBalance * solanaPrice).toFixed(2)} USD
              </p>
              <p className="text-xs text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isLoading}
            className={`mt-6 w-full py-3 px-4 bg-gradient-to-r from-[#3BC4BD] to-[#52AAC5] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#52AAC5] ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Loading..." : "Deposit Funds"}
          </button>
        </div>

        {/* Right Side: Wallet Connection & Transactions */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          {/* Connect Wallet */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Connect Wallet
            </h3>

            <div className="bg-gray-100 p-3 rounded-lg mb-4 overflow-hidden">
              <p className="text-sm font-medium text-gray-700">Your Address</p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500 truncate">
                  {walletAddress}
                </p>
                <button
                  className="text-gray-500 hover:text-[#52AAC5]"
                  title="Copy address"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    alert("Address copied to clipboard");
                  }}
                >
                  <FiCopy size={14} />
                </button>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Wallet
            </label>
            <select
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#52AAC5] focus:border-[#52AAC5] shadow-sm"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            >
              <option value="">Select Wallet</option>
              {wallets.map((w, index) => (
                <option key={index} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <button className="mt-4 w-full py-3 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3BC4BD] to-[#52AAC5] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#52AAC5]">
              <FiLink className="w-5 h-5" /> Connect
            </button>
          </div>

          {/* Live Price Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Live SOL Price
              </h3>
              <button
                onClick={fetchSolanaPrice}
                className="text-sm text-[#52AAC5] hover:text-[#3BC4BD] flex items-center"
              >
                <FiRefreshCw className="mr-1" size={14} /> Refresh
              </button>
            </div>

            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-2xl font-bold text-[#52AAC5]">
                ${solanaPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Transactions
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                        {tx.amount}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tx.status === "Success"
                              ? "bg-green-100 text-green-800"
                              : tx.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {tx.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center">
              <a
                href="#"
                className="text-sm font-medium text-[#52AAC5] hover:text-[#3BC4BD]"
              >
                View All Transactions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Deposit;
