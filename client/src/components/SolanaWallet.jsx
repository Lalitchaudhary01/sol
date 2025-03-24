import { useState, useEffect } from "react";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Buffer } from "buffer";

const SolanaWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [sendModal, setSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [usdValue, setUsdValue] = useState(0);
  const [solPrice, setSolPrice] = useState(100);
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const fetchSolPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const data = await response.json();
      setSolPrice(data.solana.usd);
    } catch (error) {
      console.error("Error fetching SOL price:", error);
    }
  };

  const fetchBalance = async () => {
    if (!walletAddress) return;
    try {
      const balanceLamports = await connection.getBalance(new PublicKey(walletAddress));
      setBalance((balanceLamports / LAMPORTS_PER_SOL).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUsdValue(sendAmount * solPrice);
  }, [sendAmount, solPrice]);

  useEffect(() => {
    if (walletAddress) fetchBalance();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setTimeout(fetchBalance, 2000);
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      alert("Phantom Wallet not found. Please install it.");
      window.open("https://phantom.app/", "_blank");
    }
  };

  const sendSol = async () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) return alert("Enter a valid SOL amount!");
    if (!targetAddress || targetAddress.length !== 44) return alert("Invalid recipient address!");
    if (parseFloat(sendAmount) > parseFloat(balance)) return alert("Insufficient balance!");
    
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(targetAddress),
          lamports: parseFloat(sendAmount) * LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = new PublicKey(walletAddress);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      
      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await sendAndConfirmTransaction(connection, signedTransaction, []);
      alert("✅ Transaction Successful! Signature: " + signature);
      setSendModal(false);
      setTimeout(fetchBalance, 3000);
    } catch (error) {
      console.error("🚨 Transaction failed:", error);
      alert("❌ Transaction failed! Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-5 animate-fadeIn">
      <div className="bg-gray-900 shadow-xl rounded-xl p-8 w-full max-w-md text-white border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400 animate-pulse">Solana Wallet</h2>
        {walletAddress ? (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-400">Wallet Address:</p>
              <p className="font-mono text-sm bg-gray-800 p-2 rounded break-all">{walletAddress}</p>
            </div>
            <div className="text-center mb-6">
              <p className="text-lg font-semibold">Balance:</p>
              <p className="text-2xl text-green-400">{balance} SOL</p>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => setSendModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-lg transition-all">Send</button>
              <button onClick={fetchBalance} className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-lg transition-all">🔄 Refresh Balance</button>
              <button onClick={() => setWalletAddress(null)} className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-lg transition-all">Disconnect</button>
            </div>
          </>
        ) : (
          <button onClick={connectWallet} className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg w-full text-lg transition-all">Connect Wallet</button>
        )}
      </div>
    </div>
  );
};

export default SolanaWallet;