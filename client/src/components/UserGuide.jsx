import React from "react";
import { WalletIcon, CurrencyDollarIcon, ChartBarIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const steps = [
  {
    number: 1,
    icon: WalletIcon,
    title: "Use a Trusted Wallet",
    description: "Download & install a secure wallet like Phantom, Exodus, or Trust Wallet to store your SOL.",
  },
  {
    number: 2,
    icon: CurrencyDollarIcon,
    title: "Buy Some SOL",
    description: "Buy SOL on your preferred exchange like Binance, Coinbase, or FTX.",
  },
  {
    number: 3,
    icon: ChartBarIcon,
    title: "Stake Your SOL",
    description: "Deposit SOL to SolStake manually or connect your wallet to start staking with ease.",
  },
  {
    number: 4,
    icon: ArrowUpTrayIcon,
    title: "Claim Your Rewards",
    description: "After 4 days, you’ll start earning rewards every 2 days, automatically added to your balance.",
  },
];

export default function UserGuide() {
  return (
    <section className="py-24 text-gray-500">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-500 via-blue-400 to-indigo-600 bg-clip-text">
            How to Stake SOL in 4 Easy Steps
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Follow these simple steps to start staking and earning rewards effortlessly.
          </p>
        </div>

        {/* Steps Container with Hover Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white shadow-md rounded-2xl p-6 transition hover:shadow-2xl hover:scale-105 duration-300 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-blue-500 text-white font-bold text-xl shadow">
                  {step.number}
                </div>
                <h3 className="ml-4 text-xl font-bold text-gray-900">{step.title}</h3>
              </div>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
