export default function Footer() {
  return (
    <footer className="bg-neutral-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-purple-500">SolStake</h3>
            <p className="text-gray-400">Secure Solana staking platform</p>
            <div className="flex space-x-4">{/* Social icons */}</div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Staking", "Support"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              {["Terms of Service", "Privacy Policy", "Risk Disclosure"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-purple-500 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Newsletter</h4>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 bg-neutral-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Subscribe
              </button>
            </form>
          </div> */}
        </div>

        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400">
              © 2024 SolStake. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["Cookie Policy", "Sitemap", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
