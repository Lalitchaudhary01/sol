import {
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function StakingFeatures() {
  const features = [
    {
      icon: ChartBarIcon,
      title: "High Daily Returns",
      description: "Earn up to 5% daily returns on your staked SOL",
      points: ["Daily compound interest", "Auto-reinvestment"],
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure Staking",
      description: "Industry-leading security measures",
      points: ["Multi-sig protection", "24/7 monitoring"],
    },
    {
      icon: ArrowDownTrayIcon,
      title: "Instant Withdrawals",
      description: "Access funds anytime",
      points: ["No lock-up period", "Automated processing"],
    },
  ];

  return (
    <section id="stakingFeatures" className="py-24 text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Staking Features</h2>
          <p className="text-gray-600 text-xl">Experience reliable Solana staking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="h-14 w-14 bg-[#7C3AED]/20 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-[#7C3AED]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-center text-gray-600">
                    <svg
                      className="w-4 h-4 text-[#7C3AED] mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
