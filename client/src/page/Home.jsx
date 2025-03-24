import React from "react";
import Wallet from "./Wallet";
import InvestmentCalculator from "./InvestmentCalculator";
import Dashboard from "./Dashboard";

const Home = () => {
  return (
    <div className="flex bg-[#E5E7EB] min-h-screen">
      <main className="flex-1  h-screen overflow-y-auto">
        <Dashboard />
        <InvestmentCalculator />
        <Wallet />
      </main>
    </div>
  );
};

export default Home;
