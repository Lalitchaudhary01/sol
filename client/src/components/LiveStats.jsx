import React, { useState, useEffect } from "react";

const LiveStats = () => {
  // Initial Stats Data
  const initialStats = {
    totalValueLocked: 150804, // Starting TVL in SOL
    activeStakers: 10245, // Initial user count
    totalRewardsPaid: 40658, // Initial rewards paid
    averageAPY: "5-15%", // Fixed APY
  };

  // State for dynamic stats
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    // Simulate daily increase in TVL, stakers, and rewards
    const interval = setInterval(() => {
      const dailyAPY = (Math.random() * (0.15 - 0.05) + 0.05) / 365; // Random daily APY between 5-15% annually
      const newRewards = stats.totalValueLocked * dailyAPY;
      
      setStats((prevStats) => ({
        totalValueLocked: prevStats.totalValueLocked + Math.random() * 50, // Increase TVL slightly daily
        activeStakers: prevStats.activeStakers + Math.floor(Math.random() * 5), // Slight increase in stakers
        totalRewardsPaid: prevStats.totalRewardsPaid + newRewards, // Rewards based on APY
        averageAPY: prevStats.averageAPY, // APY remains unchanged
      }));
    }, 1000); // Updates every 24 hours (86400000ms)

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 text-gray-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">Live Staking Statistics</h2>
          <p className="text-gray-600 text-lg">Real-time updates of our staking ecosystem</p>
        </div>

        {/* Stats Grid with Hover Animation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[{
            label: "Total Value Locked",
            value: `${stats.totalValueLocked.toFixed(2)} SOL`,
            color: "text-[#3BC4BD]",
          }, {
            label: "Active Stakers",
            value: `${stats.activeStakers} Users`,
            color: "text-[#52AAC5]",
          }, {
            label: "Average APY",
            value: stats.averageAPY,
            color: "text-[#56A7C6]",
          }, {
            label: "Total Rewards Paid",
            value: `${stats.totalRewardsPaid.toFixed(2)} SOL`,
            color: "text-[#F59E0B]",
          }].map((stat, index) => (
            <div 
              key={index} 
              className="bg-white/90 backdrop-blur-md shadow-lg rounded-lg p-6 text-center transition hover:shadow-2xl hover:scale-105 duration-300"
            >
              <h3 className="text-gray-600 font-semibold">{stat.label}</h3>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveStats;