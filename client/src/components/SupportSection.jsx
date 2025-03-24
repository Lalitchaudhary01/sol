import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function SupportSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsOpen(false);

    try {
      const response = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage({ type: "success", text: "Support request submitted successfully." });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setResponseMessage({ type: "error", text: `Error: ${data.message}` });
      }
    } catch (error) {
      setResponseMessage({ type: "error", text: "Server error. Please try again later." });
    } finally {
      setLoading(false);
      setIsOpen(true);
      setTimeout(() => setIsOpen(false), 3000);
    }
  };

  return (
    <section className="py-16 text-gray-500 text-white flex flex-col items-center">
      <div className="max-w-3xl w-full px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold tracking-wide text-purple-400">Support Center</h2>
          <p className="text-gray-400 mt-2">Our team is ready to assist you 24/7.</p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Name */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="block text-gray-300 mb-2 text-sm uppercase tracking-wide">Full Name</label>
            <div className="flex items-center bg-gray-700 rounded-lg px-4 py-3 border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
              <UserIcon className="w-5 h-5 text-purple-400 mr-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                placeholder="Enter your full name"
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="block text-gray-300 mb-2 text-sm uppercase tracking-wide">Email Address</label>
            <div className="flex items-center bg-gray-700 rounded-lg px-4 py-3 border border-gray-600 focus-within:ring-2 focus-within:ring-purple-500">
              <EnvelopeIcon className="w-5 h-5 text-purple-400 mr-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>
          </motion.div>

          {/* Subject */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="block text-gray-300 mb-2 text-sm uppercase tracking-wide">Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a topic</option>
              <option>Login Issue</option>
              <option>Deposit Issue</option>
              <option>Withdrawal Issue</option>
              <option>Rewards Issue</option>
              <option>Other</option>
            </select>
          </motion.div>

          {/* Message */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="block text-gray-300 mb-2 text-sm uppercase tracking-wide">Message</label>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
              placeholder="Describe your issue..."
            />
          </motion.div>

          {/* Submit Button with Loading Animation */}
          <motion.button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition flex justify-center items-center"
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            disabled={loading}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              >
                <AiOutlineLoading3Quarters className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              "Submit Ticket"
            )}
          </motion.button>
        </motion.form>
      </div>

      {/* MODAL POPUP */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      >
        <motion.div
          className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-96 border border-gray-700"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className={`text-lg font-semibold ${responseMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {responseMessage.text}
          </h3>
        </motion.div>
      </Dialog>
    </section>
  );
}
