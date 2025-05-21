import React, { useState, useEffect } from "react";
import { FaWallet, FaTelegram, FaSpinner } from "react-icons/fa";

const Withdraw = () => {
  // State variables
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawalState, setWithdrawalState] = useState("initial");
  const [withdrawalId, setWithdrawalId] = useState(null);
  const [verificationTimer, setVerificationTimer] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Get the same wallet address used in the Dashboard
  const dashboardWalletAddress = "sol1q6z48xpqFDsD9jKEWzHmqQm5XYG7pzJr8xpq";

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("userEmail") || "user@example.com";
    setUserEmail(email);

    // Fetch the wallet balance
    const fetchWalletData = async () => {
      setIsLoading(true);
      try {
        // API call to get balance
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

        if (!response.ok) throw new Error("Failed to fetch wallet balance");
        const data = await response.json();

        if (data.error)
          throw new Error(data.error.message || "Error fetching balance");

        let balance = data.result?.value / 1e9 || 0;
        setBalance(balance);
        localStorage.setItem("lastKnownBalance", balance.toString());
        await fetchSolanaPrice();
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        const lastKnownBalance = localStorage.getItem("lastKnownBalance");
        if (lastKnownBalance) {
          setBalance(parseFloat(lastKnownBalance));
        } else {
          setBalance(0);
        }
        if (!solPrice) setSolPrice(100);
      } finally {
        setIsLoading(false);
      }
    };

    // Check for pending withdrawals
    const pendingWithdrawal = localStorage.getItem("pendingWithdrawal");
    if (pendingWithdrawal) {
      try {
        const withdrawalData = JSON.parse(pendingWithdrawal);
        if (withdrawalData?.id) {
          setWithdrawalId(withdrawalData.id);
          setAmount(withdrawalData.amount);
          setWalletAddress(withdrawalData.walletAddress);
          setWithdrawalState("pending");
          startVerificationPolling(withdrawalData.id);
        }
      } catch (e) {
        console.error("Error parsing pending withdrawal:", e);
        localStorage.removeItem("pendingWithdrawal");
      }
    }

    fetchWalletData();

    return () => {
      if (verificationTimer) clearInterval(verificationTimer);
    };
  }, []);

  const fetchSolanaPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      if (!response.ok) throw new Error("Failed to fetch Solana price");
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error("Error fetching Solana price:", error);
      setSolPrice(100);
    }
  };

  const handleMaxWithdraw = () => {
    setAmount(balance.toFixed(2));
  };

  const validateSolanaAddress = (address) => {
    return address && address.length >= 32 && address.length <= 44;
  };

  const sendWithdrawalEmail = async (type, withdrawalData) => {
    setIsSendingEmail(true);
    try {
      const response = await fetch("/api/send-withdrawal-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          type,
          ...withdrawalData,
        }),
      });

      if (!response.ok) throw new Error("Email sending failed");
      return await response.json();
    } catch (error) {
      console.error("Email error:", error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const startVerificationPolling = (id) => {
    if (verificationTimer) clearInterval(verificationTimer);
    const timer = setInterval(async () => {
      await checkWithdrawalStatus(id);
    }, 10000);
    setVerificationTimer(timer);
  };

  const checkWithdrawalStatus = async (id) => {
    try {
      // In production, this would call your actual API endpoint
      const storedStatus = localStorage.getItem(`withdrawal_${id}_status`);
      if (storedStatus === "approved") {
        await processApprovedWithdrawal();
      } else if (storedStatus === "rejected") {
        await handleRejectedWithdrawal();
      }
    } catch (error) {
      console.error("Error checking withdrawal status:", error);
    }
  };

  const processApprovedWithdrawal = async () => {
    if (verificationTimer) {
      clearInterval(verificationTimer);
      setVerificationTimer(null);
    }

    const pendingWithdrawalStr = localStorage.getItem("pendingWithdrawal");
    if (!pendingWithdrawalStr) return;

    try {
      const pendingWithdrawal = JSON.parse(pendingWithdrawalStr);
      const withdrawalAmount = parseFloat(pendingWithdrawal.amount);

      // Update balance
      setBalance((prevBalance) => {
        const newBalance = prevBalance - withdrawalAmount;
        localStorage.setItem("lastKnownBalance", newBalance.toString());
        return newBalance;
      });

      // Send approval email
      await sendWithdrawalEmail("approved", pendingWithdrawal);

      setMessage({
        text: `Withdrawal of ${withdrawalAmount.toFixed(2)} SOL completed!`,
        type: "success",
      });

      localStorage.removeItem("pendingWithdrawal");
      localStorage.removeItem(`withdrawal_${pendingWithdrawal.id}_status`);
      setWithdrawalState("initial");
      setWithdrawalId(null);
      setAmount("");
      setWalletAddress("");
    } catch (e) {
      console.error("Error processing approved withdrawal:", e);
    }
  };

  const handleRejectedWithdrawal = async () => {
    if (verificationTimer) {
      clearInterval(verificationTimer);
      setVerificationTimer(null);
    }

    const pendingWithdrawal = JSON.parse(
      localStorage.getItem("pendingWithdrawal") || "{}"
    );

    // Send rejection email
    await sendWithdrawalEmail("rejected", pendingWithdrawal);

    setMessage({
      text: "Withdrawal request was rejected by admin.",
      type: "error",
    });

    localStorage.removeItem("pendingWithdrawal");
    if (pendingWithdrawal.id) {
      localStorage.removeItem(`withdrawal_${pendingWithdrawal.id}_status`);
    }

    setWithdrawalState("initial");
    setWithdrawalId(null);
  };

  const handleWithdraw = async () => {
    if (!validateSolanaAddress(walletAddress)) {
      setMessage({
        text: "Invalid Solana wallet address!",
        type: "error",
      });
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setMessage({
        text: "Please enter a valid amount!",
        type: "error",
      });
      return;
    }

    if (amountNumber > balance) {
      setMessage({
        text: `Insufficient balance! Maximum: ${balance.toFixed(2)} SOL`,
        type: "error",
      });
      return;
    }

    const withdrawalId = `withdraw_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;

    const withdrawalData = {
      id: withdrawalId,
      amount: amountNumber,
      walletAddress,
      timestamp: Date.now(),
      solValue: (amountNumber * solPrice).toFixed(2),
    };

    // Send pending email
    await sendWithdrawalEmail("pending", withdrawalData);

    localStorage.setItem("pendingWithdrawal", JSON.stringify(withdrawalData));
    setWithdrawalId(withdrawalId);
    setWithdrawalState("pending");
    setMessage({
      text: "Withdrawal request sent. Waiting for admin approval...",
      type: "info",
    });
    startVerificationPolling(withdrawalId);
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-lg font-medium">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-500 text-center mb-2">
          Withdraw SOL
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Securely withdraw your funds
        </p>

        {/* Balance Display */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span className="text-green-500 font-bold">Balance:</span>
          <span className="font-semibold">
            {balance.toFixed(2)} SOL (${(balance * solPrice).toFixed(2)})
          </span>
        </div>

        {withdrawalState === "pending" ? (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
            <div className="flex items-center justify-center mb-3">
              <FaTelegram className="text-blue-500 mr-2" />
              <h3 className="font-semibold">Withdrawal Pending</h3>
            </div>
            <p className="text-center mb-4">
              Your request for <span className="font-bold">{amount} SOL</span>{" "}
              to
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded">
                {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
              </code>
            </p>
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></div>
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Waiting for admin approval via Telegram...
            </p>

            {/* Demo buttons - remove in production */}
            <div className="mt-4 flex justify-center space-x-3">
              <button
                onClick={simulateAdminApproval}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Simulate Approve
              </button>
              <button
                onClick={simulateAdminRejection}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Simulate Reject
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Amount (SOL)</label>
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-purple-600 font-bold mr-2">SOL</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  min="0"
                  max={balance}
                  step="0.01"
                />
                <button
                  onClick={handleMaxWithdraw}
                  className="text-blue-500 text-sm font-medium"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Wallet Address</label>
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <FaWallet className="text-green-500 mr-2" />
                <input
                  type="text"
                  placeholder="Enter Solana address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
              <div className="flex items-start">
                <FaTelegram className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Withdrawals require admin approval via Telegram. You'll
                  receive email notifications at each step.
                </p>
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdraw}
              disabled={balance <= 0 || isSendingEmail}
              className={`w-full py-3 rounded-lg font-medium text-white ${
                balance <= 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-green-500 hover:shadow-md"
              }`}
            >
              {isSendingEmail ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </span>
              ) : (
                "Request Withdrawal"
              )}
            </button>
          </>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Price Display */}
        <div className="mt-4 text-center text-sm text-gray-500">
          SOL Price: ${solPrice.toFixed(2)}
        </div>
      </div>
    </section>
  );
};

export default Withdraw;
