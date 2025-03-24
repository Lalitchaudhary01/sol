import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const stakingPlans = [
  { duration: 7, roi: 0.05 },
  { duration: 15, roi: 0.07 },
  { duration: 30, roi: 0.1 },
  { duration: 60, roi: 0.12 },
  { duration: 90, roi: 0.15 },
];

const getROI = (duration) => {
  return (
    stakingPlans.find((plan) => plan.duration === duration)?.roi ||
    stakingPlans[stakingPlans.length - 1].roi
  );
};

const SOL_PRICE = 22; // Solana price in USD

const InvestmentCalculator = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState(30);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const roi = getROI(duration);

  const netProfit = amount * roi * duration;
  const totalReturn = amount + netProfit;
  const dailyProfit = netProfit / duration;

  // Your wallet address - must be the same as in Dashboard
  const walletAddress = "sol1q6z48xpqFDsD9jKEWzHmqQm5XYG7pzJr8xpq";

  useEffect(() => {
    // Fetch wallet balance when component mounts
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    setIsLoading(true);
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

      // Set initial amount to 10% of balance or 10 SOL, whichever is less
      setAmount(Math.min(balance * 0.1, 10));
    } catch (error) {
      console.error("Error fetching wallet balance:", error);

      // Try to get the last known balance from localStorage
      const lastKnownBalance = localStorage.getItem("lastKnownBalance");
      if (lastKnownBalance && !isNaN(parseFloat(lastKnownBalance))) {
        setWalletBalance(parseFloat(lastKnownBalance));
        setAmount(Math.min(parseFloat(lastKnownBalance) * 0.1, 10));
      } else {
        setWalletBalance(0);
        setAmount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const newAmount = parseFloat(e.target.value);
    // Ensure amount doesn't exceed wallet balance
    if (newAmount <= walletBalance) {
      setAmount(newAmount);
    } else {
      setAmount(walletBalance);
    }
  };

  const startStaking = () => {
    try {
      // Save staking data to localStorage
      const stakingData = {
        amount: amount,
        duration: duration,
        daysLeft: duration,
        apy: ((roi * 100 * 365) / duration).toFixed(1),
        startDate: new Date().toISOString(),
      };

      localStorage.setItem("stakingData", JSON.stringify(stakingData));

      // Update wallet balance after staking
      const newBalance = walletBalance - amount;
      localStorage.setItem("lastKnownBalance", newBalance.toString());

      // Make sure the user is redirected to the dashboard
      // Try multiple approaches to ensure navigation works
      navigate("/dashboard");

      // Fallback navigation method if the above doesn't work
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    } catch (error) {
      console.error("Error starting staking:", error);
      alert("There was an error starting your staking. Please try again.");
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");

    // Fallback navigation method
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <div className="text-center">
          <p className="text-xl font-medium">Loading your wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-700">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-500 via-blue-400 to-green-400 bg-clip-text text-transparent">
            Solana Staking Calculator
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate your potential earnings with our staking simulator
          </p>
        </div>

        {/* Wallet Balance Display */}
        <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-700/30 mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-blue-300">
              Your Wallet Balance
            </h3>
            <p className="text-3xl font-bold text-white">
              {walletBalance.toFixed(2)} SOL
            </p>
            <p className="text-gray-400 text-sm">
              (~${(walletBalance * SOL_PRICE).toFixed(2)} USD)
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={goToDashboard}
              className="px-4 py-2 bg-blue-700/50 hover:bg-blue-700/80 rounded-lg text-sm transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Investment Input Section */}
          <div className="p-6 bg-gray-700 rounded-2xl border border-gray-600 shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">
              Investment Parameters
            </h2>

            {/* Amount Slider */}
            <label className="text-gray-400">Amount (SOL)</label>
            <input
              type="range"
              min="0"
              max={walletBalance}
              step="0.1"
              value={amount}
              className="w-full accent-purple-500"
              onChange={handleAmountChange}
              disabled={walletBalance <= 0}
            />
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-xs">0 SOL</p>
              <p className="text-purple-400 text-sm text-center font-semibold">
                {amount.toFixed(2)} SOL{" "}
                <span className="text-gray-500 text-xs">
                  (~${(amount * SOL_PRICE).toFixed(2)} USD)
                </span>
              </p>
              <p className="text-gray-500 text-xs">
                {walletBalance.toFixed(2)} SOL
              </p>
            </div>

            {/* Duration Slider */}
            <label className="text-gray-400 mt-8">
              Staking Duration (Days)
            </label>
            <input
              type="range"
              min="7"
              max="90"
              step="1"
              value={duration}
              className="w-full accent-blue-500"
              onChange={(e) => setDuration(parseInt(e.target.value))}
            />
            <div className="flex justify-between">
              <p className="text-gray-500 text-xs">7 Days</p>
              <p className="text-blue-400 text-sm text-center font-semibold">
                {duration} Days
              </p>
              <p className="text-gray-500 text-xs">90 Days</p>
            </div>
          </div>

          {/* Staking Returns Section */}
          <div className="p-6 bg-gray-700 rounded-2xl border border-gray-600 shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">
              Staking Returns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-600/10 p-6 border border-purple-500/20 rounded-xl text-center">
                <p className="text-gray-300">Daily Profit</p>
                <h3 className="text-2xl font-bold text-purple-400">
                  {dailyProfit.toFixed(4)} SOL
                </h3>
                <p className="text-gray-500 text-xs">
                  (~${(dailyProfit * SOL_PRICE).toFixed(2)} USD)
                </p>
              </div>
              <div className="bg-blue-600/10 p-6 border border-blue-500/20 rounded-xl text-center">
                <p className="text-gray-300">APY</p>
                <h3 className="text-2xl font-bold text-blue-400">
                  {((roi * 100 * 365) / duration).toFixed(1)}%
                </h3>
                <p className="text-gray-500 text-xs">Annual Percentage Yield</p>
              </div>
              <div className="bg-green-600/10 p-6 border border-green-500/20 rounded-xl text-center">
                <p className="text-gray-300">Total Return</p>
                <h3 className="text-2xl font-bold text-green-400">
                  {totalReturn.toFixed(2)} SOL
                </h3>
                <p className="text-gray-500 text-xs">
                  (~${(totalReturn * SOL_PRICE).toFixed(2)} USD)
                </p>
              </div>
              <div className="bg-gray-600/10 p-6 border border-gray-500/20 rounded-xl text-center">
                <p className="text-gray-300">Net Profit</p>
                <h3 className="text-2xl font-bold text-gray-300">
                  {netProfit.toFixed(2)} SOL
                </h3>
                <p className="text-gray-500 text-xs">
                  (~${(netProfit * SOL_PRICE).toFixed(2)} USD)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Staking Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={startStaking}
            disabled={amount <= 0 || walletBalance <= 0}
            className={`px-8 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 ${
              amount > 0 && walletBalance > 0
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Staking
          </button>
        </div>

        {walletBalance <= 0 && (
          <p className="text-red-400 text-center mt-4">
            You need SOL in your wallet to start staking
          </p>
        )}
      </div>
    </section>
  );
};

export default InvestmentCalculator;
