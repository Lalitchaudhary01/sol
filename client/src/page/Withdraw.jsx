import React, { useState, useEffect } from "react";
import { FaWallet, FaTelegram } from "react-icons/fa";

const Withdraw = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawalState, setWithdrawalState] = useState("initial"); // initial, pending, approved, rejected

  // States for withdrawal verification
  const [withdrawalId, setWithdrawalId] = useState(null);
  const [verificationTimer, setVerificationTimer] = useState(null);

  // Get the same wallet address used in the Dashboard
  const dashboardWalletAddress = "sol1q6z48xpqFDsD9jKEWzHmqQm5XYG7pzJr8xpq";

  // Telegram bot configuration (this would connect to your actual bot in production)
  const TELEGRAM_BOT_API =
    "https://api.telegram.com/7360781214:AAFSiJoIIkMe_uMWAxY2LuES79zzWfadpH8"; // Replace with your actual API endpoint

  useEffect(() => {
    // Fetch the wallet balance from localStorage or API same as dashboard
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        // First try to get the balance from the API
        const response = await fetch("https://api.mainnet-beta.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [dashboardWalletAddress],
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
        setBalance(balance);

        // Also save in localStorage for future use
        localStorage.setItem("lastKnownBalance", balance.toString());

        // Fetch Solana price
        await fetchSolanaPrice();
      } catch (error) {
        console.error("Error fetching wallet balance:", error);

        // Try to get the last known balance from localStorage
        const lastKnownBalance = localStorage.getItem("lastKnownBalance");
        if (lastKnownBalance && !isNaN(parseFloat(lastKnownBalance))) {
          setBalance(parseFloat(lastKnownBalance));
        } else {
          setBalance(0);
        }

        // Use a fallback SOL price if needed
        if (!solPrice) {
          setSolPrice(100); // Fallback price
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();

    // Check for any pending withdrawals in localStorage
    const pendingWithdrawal = localStorage.getItem("pendingWithdrawal");
    if (pendingWithdrawal) {
      try {
        const withdrawalData = JSON.parse(pendingWithdrawal);
        if (withdrawalData && withdrawalData.id) {
          setWithdrawalId(withdrawalData.id);
          setAmount(withdrawalData.amount);
          setWalletAddress(withdrawalData.walletAddress);
          setWithdrawalState("pending");

          // Start polling for verification status
          startVerificationPolling(withdrawalData.id);
        }
      } catch (e) {
        console.error("Error parsing pending withdrawal:", e);
        localStorage.removeItem("pendingWithdrawal");
      }
    }

    // Cleanup function to clear timers
    return () => {
      if (verificationTimer) {
        clearInterval(verificationTimer);
      }
    };
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
      setSolPrice(data.solana.usd);
      return data.solana.usd;
    } catch (error) {
      console.error("Error fetching Solana price:", error);
      // Fallback price in case API fails
      setSolPrice(100);
      return 100;
    }
  };

  const handleMaxWithdraw = () => {
    setAmount(balance.toFixed(2));
  };

  const validateSolanaAddress = (address) => {
    // Basic Solana address validation (could be enhanced)
    return address && address.length >= 32 && address.length <= 44;
  };

  // Function to send withdrawal request to Telegram bot
  const sendWithdrawalRequestToTelegram = async (withdrawalData) => {
    try {
      // In production, this would call your actual API endpoint that triggers the Telegram bot
      console.log("Sending withdrawal request to Telegram:", withdrawalData);

      // Simulate API call to Telegram bot
      // In a real implementation, you would make an actual API call here
      // const response = await fetch(TELEGRAM_BOT_API, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(withdrawalData)
      // });

      // For demo purposes, we'll simulate success
      return {
        success: true,
        message: "Withdrawal request sent to admin for approval",
      };
    } catch (error) {
      console.error("Error sending withdrawal request to Telegram:", error);
      return { success: false, message: "Failed to send withdrawal request" };
    }
  };

  // Function to start polling for verification status
  const startVerificationPolling = (id) => {
    // Clear any existing timer
    if (verificationTimer) {
      clearInterval(verificationTimer);
    }

    // Start a new timer that checks every 10 seconds
    const timer = setInterval(async () => {
      await checkWithdrawalStatus(id);
    }, 10000); // Check every 10 seconds

    setVerificationTimer(timer);
  };

  // Function to check withdrawal verification status
  const checkWithdrawalStatus = async (id) => {
    try {
      // In production, this would call your actual API endpoint
      console.log("Checking withdrawal status for ID:", id);

      // Simulate API call to check status
      // In a real implementation, you would make an actual API call here
      // const response = await fetch(`${API_ENDPOINT}/withdrawal-status/${id}`);
      // const data = await response.json();

      // For demo purposes, we'll simulate checking localStorage
      // In real implementation, this should come from your backend/API
      const storedStatus = localStorage.getItem(`withdrawal_${id}_status`);

      if (storedStatus === "approved") {
        // Withdrawal was approved, process it
        processApprovedWithdrawal();
      } else if (storedStatus === "rejected") {
        // Withdrawal was rejected
        handleRejectedWithdrawal();
      }
      // If still pending, continue polling
    } catch (error) {
      console.error("Error checking withdrawal status:", error);
    }
  };

  // Function to handle an approved withdrawal
  const processApprovedWithdrawal = () => {
    // Clear the timer
    if (verificationTimer) {
      clearInterval(verificationTimer);
      setVerificationTimer(null);
    }

    // Get the pending withdrawal data
    const pendingWithdrawalStr = localStorage.getItem("pendingWithdrawal");
    if (!pendingWithdrawalStr) return;

    try {
      const pendingWithdrawal = JSON.parse(pendingWithdrawalStr);
      const withdrawalAmount = parseFloat(pendingWithdrawal.amount);

      // Update local balance
      setBalance((prevBalance) => {
        const newBalance = prevBalance - withdrawalAmount;
        // Update localStorage to keep dashboard and withdrawal in sync
        localStorage.setItem("lastKnownBalance", newBalance.toString());
        return newBalance;
      });

      // Show success message
      setMessage({
        text: `Withdrawal of ${withdrawalAmount.toFixed(
          2
        )} SOL completed successfully!`,
        type: "success",
      });

      // Clear the pending withdrawal
      localStorage.removeItem("pendingWithdrawal");
      localStorage.removeItem(`withdrawal_${pendingWithdrawal.id}_status`);

      // Reset the state
      setWithdrawalState("initial");
      setWithdrawalId(null);
      setAmount("");
      setWalletAddress("");
    } catch (e) {
      console.error("Error processing approved withdrawal:", e);
    }
  };

  // Function to handle a rejected withdrawal
  const handleRejectedWithdrawal = () => {
    // Clear the timer
    if (verificationTimer) {
      clearInterval(verificationTimer);
      setVerificationTimer(null);
    }

    // Show rejection message
    setMessage({
      text: "Your withdrawal request was rejected by the admin.",
      type: "error",
    });

    // Clear the pending withdrawal
    localStorage.removeItem("pendingWithdrawal");
    const pendingWithdrawal = JSON.parse(
      localStorage.getItem("pendingWithdrawal") || "{}"
    );
    if (pendingWithdrawal && pendingWithdrawal.id) {
      localStorage.removeItem(`withdrawal_${pendingWithdrawal.id}_status`);
    }

    // Reset the state
    setWithdrawalState("initial");
    setWithdrawalId(null);
  };

  // Function to initiate withdrawal request
  const handleWithdraw = async () => {
    if (!validateSolanaAddress(walletAddress)) {
      setMessage({
        text: "Please enter a valid Solana wallet address!",
        type: "error",
      });
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setMessage({
        text: "Please enter a valid withdrawal amount!",
        type: "error",
      });
      return;
    }

    if (amountNumber > balance) {
      setMessage({
        text:
          "Insufficient balance! You can only withdraw up to " +
          balance.toFixed(2) +
          " SOL",
        type: "error",
      });
      return;
    }

    // Generate a unique ID for this withdrawal request
    const withdrawalId = `withdraw_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    // Create withdrawal data object
    const withdrawalData = {
      id: withdrawalId,
      amount: amountNumber,
      walletAddress: walletAddress,
      timestamp: Date.now(),
      solValue: (amountNumber * solPrice).toFixed(2),
      userAgent: navigator.userAgent,
    };

    // Send withdrawal request to Telegram bot
    const telegramResponse = await sendWithdrawalRequestToTelegram(
      withdrawalData
    );

    if (telegramResponse.success) {
      // Save pending withdrawal to localStorage
      localStorage.setItem("pendingWithdrawal", JSON.stringify(withdrawalData));

      // Update UI state
      setWithdrawalId(withdrawalId);
      setWithdrawalState("pending");
      setMessage({
        text: "Withdrawal request sent to admin. Waiting for approval...",
        type: "info",
      });

      // Start polling for verification status
      startVerificationPolling(withdrawalId);
    } else {
      // Show error message
      setMessage({
        text:
          telegramResponse.message ||
          "Failed to send withdrawal request. Please try again.",
        type: "error",
      });
    }
  };

  // FOR DEMO PURPOSES ONLY: Functions to simulate admin approval/rejection
  // In a real implementation, these would be triggered by your backend when the admin responds via Telegram
  const simulateAdminApproval = () => {
    if (withdrawalId) {
      localStorage.setItem(`withdrawal_${withdrawalId}_status`, "approved");
      processApprovedWithdrawal();
    }
  };

  const simulateAdminRejection = () => {
    if (withdrawalId) {
      localStorage.setItem(`withdrawal_${withdrawalId}_status`, "rejected");
      handleRejectedWithdrawal();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-900">
        <div className="text-center">
          <p className="text-lg font-medium">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-900">
      <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff] border border-gray-200">
        <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-center">
          Withdraw Funds
        </h2>
        <p className="text-gray-500 mt-2 text-center">
          Securely withdraw your SOL funds.
        </p>

        {/* Balance Display */}
        <div className="mt-6 bg-white p-5 rounded-2xl flex justify-between items-center shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] border border-gray-100">
          <span className="text-[#14F195] text-lg font-bold">Balance:</span>
          <span className="text-gray-800 text-lg font-semibold">
            {balance.toFixed(2)} SOL
          </span>
        </div>

        {withdrawalState === "pending" ? (
          /* Pending Withdrawal State */
          <div className="mt-6 bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
            <div className="flex items-center justify-center mb-4">
              <FaTelegram className="text-2xl text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">
                Withdrawal Pending Admin Approval
              </h3>
            </div>
            <p className="text-center text-gray-600 mb-3">
              Your withdrawal request of{" "}
              <span className="font-semibold">{amount} SOL</span> to{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>{" "}
              is awaiting admin approval via Telegram.
            </p>
            <p className="text-center text-gray-500 text-sm">
              This typically takes a few minutes. Please wait...
            </p>

            {/* Loading animation */}
            <div className="flex justify-center items-center mt-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></div>
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></div>
            </div>

            {/* DEMO ONLY: Buttons to simulate admin response - Remove in production */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={simulateAdminApproval}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
              >
                Simulate Admin Approval
              </button>
              <button
                onClick={simulateAdminRejection}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                Simulate Admin Rejection
              </button>
            </div>
          </div>
        ) : (
          /* Initial Withdrawal Form */
          <>
            {/* Amount Input */}
            <div className="mt-6">
              <label className="block text-gray-600 font-medium">
                Amount (SOL)
              </label>
              <div className="flex items-center bg-[#F0F4F8] p-4 rounded-lg shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] border border-gray-100">
                <span className="text-[#9945FF] font-bold mr-2">💰 SOL</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 font-medium"
                  min="0"
                  max={balance}
                  step="0.01"
                />
                <button
                  className="text-blue-500 text-sm font-semibold hover:underline ml-2"
                  onClick={handleMaxWithdraw}
                >
                  Max
                </button>
              </div>
              {balance > 0 ? (
                <p className="text-xs text-gray-500 mt-1">
                  You can withdraw up to {balance.toFixed(2)} SOL ($
                  {(balance * solPrice).toFixed(2)} USD)
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-1">
                  Insufficient balance to withdraw
                </p>
              )}
            </div>

            {/* Wallet Address Input */}
            <div className="mt-6">
              <label className="block text-gray-600 font-medium">
                Solana Wallet Address
              </label>
              <div className="flex items-center bg-[#F0F4F8] p-4 rounded-lg shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] border border-gray-100">
                <FaWallet className="text-[#14F195] mr-2" />
                <input
                  type="text"
                  placeholder="Enter your Solana wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Telegram Verification Notice */}
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start">
              <FaTelegram className="text-blue-500 text-lg mt-1 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                For your security, all withdrawals require admin approval via
                Telegram. After submitting, please wait for your request to be
                approved.
              </p>
            </div>

            {/* Withdraw Button */}
            <button
              className={`w-full mt-6 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white py-3 rounded-xl font-semibold shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_6px_#d1d5db,-2px_-2px_6px_#ffffff] transition-all ${
                balance <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleWithdraw}
              disabled={balance <= 0}
            >
              Request Withdrawal
            </button>
          </>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-3 text-center rounded-lg font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-600"
                : message.type === "info"
                ? "bg-blue-100 text-blue-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* SOL Price Display */}
        <div className="mt-4 bg-[#F0F4F8] p-3 rounded-xl text-center text-gray-600 font-medium shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] border border-gray-100">
          SOL = ${solPrice.toFixed(2)}
        </div>
      </div>
    </section>
  );
};

export default Withdraw;
