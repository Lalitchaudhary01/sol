import { useState, useEffect } from "react";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const Wallet = () => {
  // Wallet states
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [walletProvider, setWalletProvider] = useState("phantom"); // "phantom" or "hatom"
  const [isLoading, setIsLoading] = useState(false);

  // UI states
  const [activeTab, setActiveTab] = useState("tokens"); // "tokens", "nfts", "activity"
  const [sendModal, setSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState("SOL");
  const [usdValue, setUsdValue] = useState(0);

  // Price states
  const [solPrice, setSolPrice] = useState(100);
  const [tokenPrices, setTokenPrices] = useState({});

  // Network state
  const [network, setNetwork] = useState("devnet"); // "mainnet-beta", "devnet", "testnet"
  const connection = new Connection(clusterApiUrl(network), "confirmed");

  // Sample token data - in a real app, this would come from the blockchain
  const sampleTokens = [
    { symbol: "SOL", name: "Solana", balance: 0, decimals: 9, mint: "native" },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: 0,
      decimals: 6,
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    },
    {
      symbol: "BONK",
      name: "Bonk",
      balance: 0,
      decimals: 5,
      mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    },
    {
      symbol: "HATOM",
      name: "Hatom Token",
      balance: 0,
      decimals: 8,
      mint: "HATOM1234567890123456789012345678901234567890",
    },
  ];

  // Sample transaction data
  const sampleTransactions = [
    {
      type: "send",
      token: "SOL",
      amount: 0.5,
      destination: "4Zw7rve5ZEpGh...",
      date: "2025-03-10",
      status: "confirmed",
    },
    {
      type: "receive",
      token: "SOL",
      amount: 1.2,
      source: "8dJKyZSaX7h1k...",
      date: "2025-03-09",
      status: "confirmed",
    },
    {
      type: "receive",
      token: "USDC",
      amount: 25,
      source: "3vMPxK9NvDz2j...",
      date: "2025-03-08",
      status: "confirmed",
    },
    {
      type: "swap",
      tokenFrom: "SOL",
      tokenTo: "USDC",
      amountFrom: 0.2,
      amountTo: 20,
      date: "2025-03-05",
      status: "confirmed",
    },
  ];

  // Fetch price data
  const fetchPrices = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,bonk&vs_currencies=usd"
      );
      const data = await response.json();
      setSolPrice(data.solana.usd);
      setTokenPrices({
        SOL: data.solana.usd,
        USDC: data["usd-coin"].usd,
        BONK: data.bonk.usd,
        HATOM: 0.05, // Sample price, would come from API in real app
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  // Fetch SOL balance
  const fetchSolBalance = async () => {
    if (!walletAddress) return;
    try {
      const balanceLamports = await connection.getBalance(
        new PublicKey(walletAddress)
      );
      const solBalance = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);
      setBalance(solBalance);

      // Update SOL in tokens list
      setTokens((currentTokens) =>
        currentTokens.map((token) =>
          token.symbol === "SOL" ? { ...token, balance: solBalance } : token
        )
      );
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
    }
  };

  // Fetch SPL token balances
  const fetchTokenBalances = async () => {
    if (!walletAddress) return;
    setIsLoading(true);

    try {
      // In a real app, this would use getParsedTokenAccountsByOwner
      // For demo purposes, we're using sample data
      const mockTokensWithBalances = sampleTokens.map((token) => {
        // For demo, let's just set random balances
        if (token.symbol === "SOL") return token; // SOL is handled separately
        return {
          ...token,
          balance: (Math.random() * 100).toFixed(
            token.decimals > 2 ? 2 : token.decimals
          ),
        };
      });

      setTokens(mockTokensWithBalances);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    if (!walletAddress) return;

    try {
      // In a real app, this would fetch from Solana blockchain
      // For demo, we're using sample data
      setTransactions(sampleTransactions);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchPrices();
    const priceInterval = setInterval(fetchPrices, 60000); // Every minute
    return () => clearInterval(priceInterval);
  }, []);

  // Calculate USD value when amount changes
  useEffect(() => {
    if (selectedToken && tokenPrices[selectedToken]) {
      setUsdValue(sendAmount * tokenPrices[selectedToken]);
    }
  }, [sendAmount, selectedToken, tokenPrices]);

  // Fetch data when wallet connects
  useEffect(() => {
    if (walletAddress) {
      fetchSolBalance();
      fetchTokenBalances();
      fetchTransactionHistory();
    }
  }, [walletAddress, network]);

  // Connect to wallet
  const connectWallet = async (provider = "phantom") => {
    setWalletProvider(provider);

    if (provider === "phantom") {
      if (window.solana && window.solana.isPhantom) {
        try {
          const response = await window.solana.connect();
          setWalletAddress(response.publicKey.toString());
        } catch (err) {
          console.error("Phantom wallet connection failed", err);
        }
      } else {
        alert("Phantom Wallet not found. Please install it.");
        window.open("https://phantom.app/", "_blank");
      }
    } else if (provider === "hatom") {
      if (window.hatom) {
        try {
          const response = await window.hatom.connect();
          setWalletAddress(response.publicKey.toString());
        } catch (err) {
          console.error("Hatom wallet connection failed", err);
        }
      } else {
        alert("Hatom Wallet not found. Please install it.");
        // Open website for Hatom wallet installation
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    if (walletProvider === "phantom" && window.solana) {
      window.solana.disconnect();
    } else if (walletProvider === "hatom" && window.hatom) {
      window.hatom.disconnect();
    }
    setWalletAddress(null);
    setBalance(null);
    setTokens(sampleTokens.map((token) => ({ ...token, balance: 0 })));
  };

  // Send tokens
  const sendTokens = async () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0)
      return alert("Enter a valid amount!");

    if (!targetAddress || targetAddress.length !== 44)
      return alert("Invalid recipient address!");

    const token = tokens.find((t) => t.symbol === selectedToken);
    if (!token) return alert("Token not found!");

    if (parseFloat(sendAmount) > parseFloat(token.balance))
      return alert("Insufficient balance!");

    try {
      let transaction;
      let signature;

      if (selectedToken === "SOL") {
        // Send SOL
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(walletAddress),
            toPubkey: new PublicKey(targetAddress),
            lamports: parseFloat(sendAmount) * LAMPORTS_PER_SOL,
          })
        );

        transaction.feePayer = new PublicKey(walletAddress);
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        // Sign and send transaction using the appropriate wallet
        if (walletProvider === "phantom") {
          const signedTransaction = await window.solana.signTransaction(
            transaction
          );
          signature = await connection.sendRawTransaction(
            signedTransaction.serialize()
          );
        } else if (walletProvider === "hatom") {
          const signedTransaction = await window.hatom.signTransaction(
            transaction
          );
          signature = await connection.sendRawTransaction(
            signedTransaction.serialize()
          );
        }
      } else {
        // Send SPL tokens - in a real app, this would use Token instructions
        alert("SPL token transfers would be implemented here");
        // This is simplified, actual implementation would use SPL Token Program instructions
      }

      if (signature) {
        await connection.confirmTransaction(signature);
        alert(`✅ Transaction Successful! Signature: ${signature}`);

        // Update balances after sending
        setTimeout(() => {
          fetchSolBalance();
          fetchTokenBalances();
          fetchTransactionHistory();
        }, 2000);
      }

      setSendModal(false);
    } catch (error) {
      console.error("🚨 Transaction failed:", error);
      alert("❌ Transaction failed! Error: " + error.message);
    }
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Calculate portfolio value
  const calculatePortfolioValue = () => {
    return tokens.reduce((total, token) => {
      const price = tokenPrices[token.symbol] || 0;
      return total + token.balance * price;
    }, 0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-5">
      <div className="bg-gray-800 shadow-xl rounded-xl p-6 w-full max-w-md text-white border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">
          {walletProvider === "phantom" ? "Phantom" : "Hatom"} Wallet
        </h2>

        {!walletAddress ? (
          // Wallet selection view
          <div className="space-y-4">
            <button
              onClick={() => connectWallet("phantom")}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg w-full text-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Connect Phantom</span>
            </button>
            <button
              onClick={() => connectWallet("hatom")}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg w-full text-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Connect Hatom</span>
            </button>
            <div className="text-center text-sm text-gray-400 mt-4">
              Select a wallet provider to continue
            </div>
          </div>
        ) : (
          // Connected wallet view
          <div>
            {/* Wallet info */}
            <div className="flex justify-between items-center mb-4">
              <div className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {network === "mainnet-beta"
                  ? "Mainnet"
                  : network === "devnet"
                  ? "Devnet"
                  : "Testnet"}
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {formatAddress(walletAddress)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-gray-700 p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Portfolio value */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400">Portfolio Value</p>
              <p className="text-3xl font-bold">
                ${calculatePortfolioValue().toFixed(2)}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex mb-4 border-b border-gray-700">
              <button
                className={`flex-1 pb-2 text-center ${
                  activeTab === "tokens"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("tokens")}
              >
                Tokens
              </button>
              <button
                className={`flex-1 pb-2 text-center ${
                  activeTab === "nfts"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("nfts")}
              >
                NFTs
              </button>
              <button
                className={`flex-1 pb-2 text-center ${
                  activeTab === "activity"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "tokens" && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-6">
                    <p className="text-gray-400">Loading tokens...</p>
                  </div>
                ) : (
                  tokens
                    .filter((token) => token.balance > 0)
                    .map((token, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                            {token.symbol.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-semibold">{token.symbol}</p>
                            <p className="text-xs text-gray-400">
                              {token.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {parseFloat(token.balance).toFixed(
                              token.symbol === "SOL" ? 4 : 2
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            $
                            {(
                              parseFloat(token.balance) *
                              (tokenPrices[token.symbol] || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                )}

                {!isLoading &&
                  tokens.filter((token) => token.balance > 0).length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-gray-400">No tokens found</p>
                    </div>
                  )}
              </div>
            )}

            {activeTab === "nfts" && (
              <div className="py-6 text-center">
                <p className="text-gray-400">Your NFTs will appear here</p>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold 
                        ${
                          tx.type === "receive"
                            ? "bg-green-600"
                            : tx.type === "send"
                            ? "bg-red-600"
                            : "bg-blue-600"
                        }`}
                      >
                        {tx.type === "receive"
                          ? "↓"
                          : tx.type === "send"
                          ? "↑"
                          : "⇄"}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-400">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {tx.type === "swap"
                          ? `${tx.amountFrom} ${tx.tokenFrom} → ${tx.amountTo} ${tx.tokenTo}`
                          : `${tx.type === "send" ? "-" : "+"} ${tx.amount} ${
                              tx.token
                            }`}
                      </p>
                      <p className="text-xs text-gray-400">{tx.status}</p>
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-400">No activity found</p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedToken("SOL");
                  setSendModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all flex flex-col items-center"
              >
                <span>Send</span>
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-all flex flex-col items-center">
                <span>Receive</span>
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all flex flex-col items-center">
                <span>Swap</span>
              </button>
            </div>
          </div>
        )}

        {/* Send Modal */}
        {sendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg text-white w-96 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-400">
                  Send {selectedToken}
                </h3>
                <button
                  onClick={() => setSendModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Token selection */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Token
                </label>
                <select
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                >
                  {tokens
                    .filter((token) => token.balance > 0)
                    .map((token, index) => (
                      <option key={index} value={token.symbol}>
                        {token.symbol} -{" "}
                        {parseFloat(token.balance).toFixed(
                          token.symbol === "SOL" ? 4 : 2
                        )}{" "}
                        available
                      </option>
                    ))}
                </select>
              </div>

              {/* Amount input */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={`Amount (${selectedToken})`}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                  <button
                    className="absolute right-2 top-2 text-sm bg-blue-600 px-2 py-0.5 rounded text-white"
                    onClick={() => {
                      const token = tokens.find(
                        (t) => t.symbol === selectedToken
                      );
                      if (token) setSendAmount(token.balance);
                    }}
                  >
                    MAX
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  ≈ ${usdValue.toFixed(2)} USD
                </p>
              </div>

              {/* Recipient address */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  placeholder="Solana address"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                />
              </div>

              {/* Network fee */}
              <div className="mb-4 p-2 bg-gray-700 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network Fee</span>
                  <span>~0.000005 SOL</span>
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={sendTokens}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg w-full transition-all mb-2"
              >
                Send {selectedToken}
              </button>
              <button
                onClick={() => setSendModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg w-full transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
