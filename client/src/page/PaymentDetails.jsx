import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FiCopy, FiCheck, FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PaymentDetails = () => {
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState("");
  const [usdValue, setUsdValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("waiting"); // waiting, pending, confirmed
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Your wallet address - replace with your actual wallet address
  const walletAddress = "ENqqKBZQks2mchfQCKwhCadtG8atMUedCMdSywPZuCJR";

  useEffect(() => {
    // Get stored amount from previous page
    const amount = localStorage.getItem("depositAmount");
    const usdVal = localStorage.getItem("depositUsdValue");

    if (!amount) {
      // Redirect back to deposit page if no amount is set
      navigate("/deposit");
      return;
    }

    setDepositAmount(amount);
    setUsdValue(usdVal);

    // Start checking for transaction
    const checkInterval = setInterval(() => {
      checkTransaction(walletAddress, amount);
    }, 15000); // check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkTransaction = async (address, amount) => {
    try {
      const response = await fetch(
        `https://public-api.solscan.io/account/transactions?account=${address}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      const recentTx = data.find(
        (tx) =>
          tx.tokenTransfers &&
          tx.tokenTransfers.some((transfer) => {
            const transferAmount = parseFloat(transfer.amount);
            const expectedAmount = parseFloat(amount);
            return (
              Math.abs(transferAmount - expectedAmount) < 0.001 &&
              transfer.destination === address
            );
          })
      );

      if (recentTx) {
        if (transactionStatus !== "confirmed") {
          if (transactionStatus !== "pending") {
            setTransactionStatus("pending");
          }

          const confirmations = recentTx.confirmations || 0;

          if (confirmations >= 32) {
            const txDetails = {
              txHash: recentTx.txHash || recentTx.signature,
              slot: recentTx.slot,
              blockTime: recentTx.blockTime,
              fee: recentTx.fee / 1e9,
              amount: parseFloat(amount),
              timestamp: recentTx.blockTime * 1000,
            };

            // Update deposit status to confirmed
            const depositDetails = JSON.parse(
              localStorage.getItem("depositDetails") || "{}"
            );
            depositDetails.status = "confirmed";
            localStorage.setItem(
              "depositDetails",
              JSON.stringify(depositDetails)
            );

            setTransactionStatus("confirmed");
            setTransactionDetails(txDetails);
          }
        }
      }
    } catch (error) {
      console.error("Error checking transaction:", error);
    }
  };

  const handleCancel = () => {
    // Clear deposit details from localStorage
    localStorage.removeItem("depositAmount");
    localStorage.removeItem("depositUsdValue");
    localStorage.removeItem("depositDetails");

    // Navigate back to deposit page
    navigate("/deposit");
  };

  return (
    <section className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Payment Details
        </h2>

        {transactionStatus === "confirmed" ? (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 rounded-full p-4 inline-flex mb-4">
              <FiCheck className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Transaction Confirmed!
            </h3>
            <p className="text-gray-600 mb-6">
              Your deposit of {depositAmount} SOL (${usdValue}) has been
              received.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Transaction Hash</span>
                <a
                  href={`https://solscan.io/tx/${transactionDetails?.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#52AAC5] hover:text-[#3BC4BD] flex items-center"
                >
                  <span className="mr-1">View</span>{" "}
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-sm font-mono text-gray-700 truncate">
                {transactionDetails?.txHash}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="py-3 px-6 bg-gradient-to-r from-[#3BC4BD] to-[#52AAC5] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#52AAC5]"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-700 mb-2">Please transfer</p>
              <p className="text-2xl font-bold text-[#52AAC5] mb-1">
                {depositAmount} SOL
              </p>
              <p className="text-gray-500 text-sm mb-4">≈ ${usdValue} USD</p>

              {transactionStatus === "pending" && (
                <div className="bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg mb-4">
                  Transaction pending... Please wait for confirmation.
                </div>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <QRCodeCanvas
                value={`solana:${walletAddress}?amount=${depositAmount}`}
                size={180}
                className="rounded-lg shadow-lg"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-700 font-mono truncate">
                  {walletAddress}
                </span>
                <button
                  className="text-[#52AAC5] hover:text-[#3BC4BD] ml-2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <FiCheck className="w-5 h-5" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
              <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2">
                <li>
                  Transfer exactly {depositAmount} SOL to the address above
                </li>
                <li>Wait for network confirmation (usually 1-2 minutes)</li>
                <li>
                  The page will automatically update when your payment is
                  detected
                </li>
              </ol>
            </div>

            <button
              onClick={() => navigate("/deposit")}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel and Return
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default PaymentDetails;
