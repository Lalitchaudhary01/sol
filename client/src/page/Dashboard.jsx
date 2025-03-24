import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [solanaPrice, setSolanaPrice] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stakingData, setStakingData] = useState({
    amount: 332,
    duration: 30,
    daysLeft: 15,
    apy: 7.2,
  });
  const [recentDeposit, setRecentDeposit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Your wallet address - must be the same as in PaymentDetails
  const walletAddress = "sol1q6z48xpqFDsD9jKEWzHmqQm5XYG7pzJr8xpq";

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchSolanaPrice(), fetchWalletBalance(), fetchTransactions()])
      .then(() => {
        checkRecentDeposit();
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
        setIsLoading(false);
      });
  }, []);

  // Replace the hardcoded stakingData with this code in your Dashboard component
  useEffect(() => {
    // Check localStorage for staking data
    const storedStakingData = JSON.parse(
      localStorage.getItem("stakingData") || "null"
    );

    if (storedStakingData) {
      // Calculate days left based on start date and duration
      const startDate = new Date(storedStakingData.startDate);
      const currentDate = new Date();
      const daysPassed = Math.floor(
        (currentDate - startDate) / (1000 * 60 * 60 * 24)
      );
      const daysLeft = Math.max(0, storedStakingData.duration - daysPassed);

      setStakingData({
        amount: storedStakingData.amount,
        duration: storedStakingData.duration,
        daysLeft: daysLeft,
        apy: storedStakingData.apy,
      });
    } else {
      // Set default values if no staking data is found
      setStakingData({
        amount: 0,
        duration: 0,
        daysLeft: 0,
        apy: 0,
      });
    }
  }, []);
  const fetchSolanaPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Solana price");
      }
      const data = await response.json();
      setSolanaPrice(data.solana.usd);
      return data.solana.usd;
    } catch (error) {
      console.error("Error fetching Solana price:", error);
      // Fallback price in case API fails
      setSolanaPrice(100);
      return 100;
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
      return balance;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setError(
        "Could not fetch wallet balance. Using cached data if available."
      );

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

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `https://public-api.solscan.io/account/transactions?account=${walletAddress}&limit=5`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data = await response.json();

      // Process real transaction data
      let txList = Array.isArray(data) ? data.slice(0, 5) : [];

      // Transform the transaction data to our format
      const formattedTxs = txList.map((tx) => {
        // Determine if this is a deposit or withdrawal
        // This logic may need to be adjusted based on actual Solscan API response structure
        const isDeposit =
          tx.tokenTransfers?.some((t) => t.destination === walletAddress) ||
          false;
        const changeAmount =
          tx.tokenTransfers?.reduce((total, t) => {
            if (t.destination === walletAddress) {
              return total + parseFloat(t.amount);
            } else if (t.source === walletAddress) {
              return total - parseFloat(t.amount);
            }
            return total;
          }, 0) || 0;

        return {
          txHash: tx.txHash || tx.signature,
          change: changeAmount * 1e9, // Convert to lamports for consistency
          timestamp: tx.blockTime * 1000, // Convert to milliseconds
          isRecent: false, // Will be updated later if this is a recent deposit
        };
      });

      // Add recent deposit to transactions if available
      const depositDetails = JSON.parse(
        localStorage.getItem("depositDetails") || "null"
      );

      if (depositDetails && depositDetails.status === "confirmed") {
        // Check if this transaction is already in our list
        const txExists = formattedTxs.some(
          (tx) => tx.txHash === depositDetails.txHash
        );

        if (!txExists) {
          // Add the recent deposit and mark it as recent
          formattedTxs.unshift({
            txHash: depositDetails.txHash,
            change: depositDetails.amount * 1e9, // Convert to lamports
            timestamp: depositDetails.timestamp,
            isRecent: true,
          });
        } else {
          // Mark the existing transaction as recent
          const txIndex = formattedTxs.findIndex(
            (tx) => tx.txHash === depositDetails.txHash
          );
          if (txIndex >= 0) {
            formattedTxs[txIndex].isRecent = true;
          }
        }
      }

      // Keep only the most recent 5 transactions
      setTransactions(formattedTxs.slice(0, 5));
      return formattedTxs;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Could not fetch transactions. Using cached data if available.");

      // Get recent deposit if available
      const depositDetails = JSON.parse(
        localStorage.getItem("depositDetails") || "null"
      );

      if (depositDetails && depositDetails.status === "confirmed") {
        setTransactions([
          {
            txHash: depositDetails.txHash,
            change: depositDetails.amount * 1e9,
            timestamp: depositDetails.timestamp,
            isRecent: true,
          },
        ]);
        return [depositDetails];
      }

      setTransactions([]);
      return [];
    }
  };

  const checkRecentDeposit = () => {
    // Check if there's a recent deposit in localStorage
    const depositDetails = JSON.parse(
      localStorage.getItem("depositDetails") || "null"
    );

    if (depositDetails && depositDetails.status === "confirmed") {
      // Check if the deposit was made in the last 24 hours
      const depositTime = depositDetails.timestamp;
      const isRecent = Date.now() - depositTime < 24 * 60 * 60 * 1000;

      if (isRecent) {
        setRecentDeposit({
          amount: depositDetails.amount,
          usdValue: depositDetails.usdValue,
          timestamp: depositDetails.timestamp,
          txHash: depositDetails.txHash,
        });
      } else {
        // Clear old deposit data
        setRecentDeposit(null);
      }
    } else {
      // Clear deposit data if status is not confirmed
      setRecentDeposit(null);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-8 flex justify-center items-center">
        <div className="text-center">
          <p className="text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-black mb-6">
          Solana Dashboard
        </h2>

        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">Notice</p>
            <p>{error}</p>
          </div>
        )}

        {/* Recent Deposit Alert */}
        {recentDeposit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded"
          >
            <div className="flex items-center">
              <div className="py-1">
                <svg
                  className="h-6 w-6 text-green-500 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold">Deposit Successful!</p>
                <p className="text-sm">
                  You've successfully deposited {recentDeposit.amount} SOL ($
                  {recentDeposit.usdValue}) to your wallet.
                </p>
                <p className="text-xs mt-1">
                  Transaction: {recentDeposit.txHash.substring(0, 15)}...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balance */}
          <motion.div
            className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-bold text-black mb-4">
              Wallet Balance
            </h3>
            <p className="text-gray-700 text-2xl font-semibold">
              {walletBalance.toFixed(2)} SOL
            </p>
            {solanaPrice && (
              <p className="text-gray-500 text-md">
                ≈ ${(walletBalance * solanaPrice).toFixed(2)} USD
              </p>
            )}
          </motion.div>

          {/* Currently Staking */}
          <motion.div
            className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-bold text-black mb-4">
              Currently Staking
            </h3>
            <p className="text-gray-700 text-lg">
              {stakingData.amount} SOL for {stakingData.duration} days
            </p>
            <p className="text-gray-700">Days Left: {stakingData.daysLeft}</p>
            <p className="text-gray-700 font-semibold">
              APY: {stakingData.apy}%
            </p>
          </motion.div>

          {/* Live Solana Price */}
          <motion.div
            className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-bold text-black mb-4">
              Live Solana Price
            </h3>
            <p className="text-gray-700 text-2xl font-semibold">
              ${solanaPrice}
            </p>
            <p className="text-gray-500 text-sm">
              Updated: {new Date().toLocaleTimeString()}
            </p>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300 mt-6"
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-xl font-bold text-black mb-4">
            Recent Transactions
          </h3>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx, index) => (
                    <tr
                      key={index}
                      className={tx.isRecent ? "bg-green-50" : ""}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        <a
                          href={`https://solscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {tx.txHash.slice(0, 12)}...
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={
                            tx.change > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {tx.change > 0 ? "+" : ""}
                          {(tx.change / 1e9).toFixed(2)} SOL
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        $
                        {((Math.abs(tx.change) / 1e9) * solanaPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeAgo(tx.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent transactions found.</p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate("/deposit")}
              className="px-4 py-2 bg-gradient-to-r from-[#3BC4BD] to-[#52AAC5] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              New Deposit
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
