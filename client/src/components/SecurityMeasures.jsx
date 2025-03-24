import {
  LockClosedIcon,
  DocumentCheckIcon,
  FingerPrintIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

export default function SecurityMeasures() {
  const securityFeatures = [
    {
      icon: LockClosedIcon,
      title: "Multi-Signature Protection",
      description: "Multiple signatures required for withdrawals",
    },
    {
      icon: DocumentCheckIcon,
      title: "Smart Contract Audits",
      description: "Regular audits by leading security firms",
    },
    {
      icon: FingerPrintIcon,
      title: "Biometric Authentication",
      description: "Extra layer of security for operations",
    },
    {
      icon: ChartPieIcon,
      title: "Real-time Monitoring",
      description: "24/7 automated system monitoring",
    },
  ];

  return (
    <section id="securityMeasures" className="py-24 text-gray-500">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Security First</h2>
          <p className="text-gray-600 text-lg">
            Your assets' protection is our priority.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {securityFeatures.map((feature) => (
            <div 
              key={feature.title} 
              className="bg-white shadow-md rounded-xl p-8 transition hover:shadow-2xl hover:scale-105 duration-300 border border-gray-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 bg-[#7C3AED]/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-[#7C3AED]" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
