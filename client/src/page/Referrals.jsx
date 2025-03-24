import React, { useState } from "react";

export default function ReferralProgram() {
  // State to manage referral data
  const [referrals, setReferrals] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [history, setHistory] = useState([]);

  // Sample referral link (replace with actual logic)
  const referralLink = "https://solstake.xyz/ref/YOUR_ID";

  // Function to copy referral link
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  return (
    <section id="referral-page" className="min-h-screen bg-neutral-900 text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
            Referral Program
          </h2>
          <p className="text-neutral-400">Earn commission by inviting friends to stake with us.</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-xl rounded-xl p-6 border border-neutral-700/30">
            <h3 className="text-lg font-semibold text-purple-400">Total Referrals</h3>
            <p className="text-3xl font-bold">{referrals}</p>
          </div>
          <div className="bg-neutral-800/50 backdrop-blur-xl rounded-xl p-6 border border-neutral-700/30">
            <h3 className="text-lg font-semibold text-blue-400">Total Earnings</h3>
            <p className="text-3xl font-bold">{earnings} SOL</p>
          </div>
          <div className="bg-neutral-800/50 backdrop-blur-xl rounded-xl p-6 border border-neutral-700/30">
            <h3 className="text-lg font-semibold text-green-400">Commission Rate</h3>
            <p className="text-3xl font-bold">5%</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-neutral-800/30 backdrop-blur-xl rounded-xl p-6 border border-neutral-700/30 mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Referral Link</h3>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-neutral-700/30 border border-neutral-600/30 rounded-lg px-4 py-2 text-white"
            />
            <button
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold hover:opacity-90 transition-all"
              onClick={copyToClipboard}
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Rewards Tiers */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Rewards Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tier: "Bronze", range: "0-5 Referrals", color: "purple", rate: "5%" },
              { tier: "Silver", range: "6-20 Referrals", color: "blue", rate: "7.5%" },
              { tier: "Gold", range: "21+ Referrals", color: "green", rate: "10%" },
            ].map((tier, index) => (
              <div
                key={index}
                className="bg-neutral-800/30 backdrop-blur-xl rounded-xl p-6 border border-neutral-700/30"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-${tier.color}-500/20 flex items-center justify-center text-${tier.color}-400`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{tier.tier}</h4>
                    <p className="text-sm text-neutral-400">{tier.range}</p>
                  </div>
                </div>
                <p className={`text-2xl font-bold text-${tier.color}-400`}>{tier.rate} Commission</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-neutral-800/30 backdrop-blur-xl rounded-xl p-6 border border-neutral-700/30">
          <h3 className="text-xl font-semibold mb-4">Referral History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-neutral-700/30">
                  {["User", "Date", "Staked Amount", "Commission", "Status"].map((header, index) => (
                    <th key={index} className="pb-4 text-neutral-400">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <tr key={index} className="text-neutral-400">
                      <td className="py-4">{entry.user}</td>
                      <td className="py-4">{entry.date}</td>
                      <td className="py-4">{entry.amount} SOL</td>
                      <td className="py-4">{entry.commission} SOL</td>
                      <td className="py-4">{entry.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-neutral-400">
                    <td className="py-4" colSpan="5">
                      No referrals yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
