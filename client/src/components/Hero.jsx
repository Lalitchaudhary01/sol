import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import LiveStats from "./LiveStats";
import StakingFeatures from "./StakingFeatures";
import SecurityMeasures from "./SecurityMeasures";
import UserGuide from "./UserGuide";

const stakingPlans = [
  { duration: 7, roi: 0.05 },
  { duration: 15, roi: 0.07 },
  { duration: 30, roi: 0.10 },
  { duration: 60, roi: 0.12 },
  { duration: 90, roi: 0.15 },
];

const getROI = (duration) => {
  return stakingPlans.find(plan => plan.duration === duration)?.roi || stakingPlans[stakingPlans.length - 1].roi;
};

export default function Hero() {
  const [amount, setAmount] = useState(100);
  const [days, setDays] = useState(30);
  const [solPrice, setSolPrice] = useState(22);
  
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        console.error("Failed to fetch SOL price:", error);
      }
    };
    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const roi = getROI(days);
  const netProfit = amount * roi * days;
  const totalReturn = amount + netProfit;

  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStartStaking = () => {
    if (user) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      navigate("/Home");
    } else {
      toast.error("You need to log in to start staking!");
      navigate("/auth");
    }
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} />}

      <section className="relative bg-gradient-to-b from-[#000212] via-[#05091a] to-[#0a0f30] min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center gap-16 w-full">
          
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left relative">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
              Maximize Your <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">Solana</span> Earnings
            </h1>
            <p className="text-gray-300 text-lg">
              Earn up to <strong>15% daily rewards</strong> through secure and transparent Solana staking.
              Start staking today and maximize your returns!
            </p>
            <button onClick={handleStartStaking} className="mt-6 ml-[106px] bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold py-3 px-18 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 scale-125">
              Start Staking
            </button>
          </div>
             
          <div className="w-full md:w-1/2">
            <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/20 relative">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Stake Calculator</h2>

              <div className="mb-6">
                <label className="text-gray-300 block mb-2">Amount (SOL): {amount} SOL (~${(amount * solPrice).toFixed(2)})</label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg cursor-pointer"
                />
              </div>

              <div className="mb-6">
                <label className="text-gray-300 block mb-2">Staking Period (Days): {days} Days</label>
                <input
                  type="range"
                  min="7"
                  max="90"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg cursor-pointer"
                />
              </div>
              
              <div className="relative p-6 rounded-xl text-white text-center shadow-[0px_0px_5px_#9945FF] bg-gradient-to-b from-[#05091a] to-[#0a0f30] border border-[#9945FF]">
  <span className="text-lg font-semibold text-gray-300 block">Expected Return:</span>
  <div className="flex flex-col items-center mt-2">
    <span className="text-[#9945FF] text-5xl font-extrabold">${(totalReturn * solPrice).toFixed(2)}</span>
    <span className="text-lg text-gray-300">({totalReturn.toFixed(2)} SOL)</span>
  </div>
</div>

            </div>
          </div>
        </div>
      </section>

      <LiveStats />
      <StakingFeatures />
      <SecurityMeasures />
      <UserGuide />
    </>
  );
}
