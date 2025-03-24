import React, { useState, useEffect } from "react";

const Profile = () => {
  const [user, setUser] = useState({
    name: "John Doe", // Default value
    email: "johndoe@example.com", // Default value
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const data = await response.json();
      setUser((prev) => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
      }));
      setNameInput(data.name || user.name);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error fetching profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeEmail = () => {
    setIsChangingEmail(true);
  };

  const handleUpdateEmail = async () => {
    try {
      if (!newEmail) {
        setError("New email is required");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          email: newEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update email");
        return;
      }

      setIsChangingEmail(false);
      setPendingEmail(newEmail);
      setOtpSent(true);
      setSuccessMessage(data.message);
    } catch (error) {
      console.error("Error updating email:", error);
      setError("Error updating email. Please try again.");
    }
  };

  const handleUpdateName = async () => {
    try {
      if (!nameInput) {
        setError("Name is required");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          name: nameInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update name");
        return;
      }

      setUser((prev) => ({
        ...prev,
        name: nameInput,
      }));
      setEditName(false);
      setSuccessMessage("Name updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating name:", error);
      setError("Error updating name. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!otp) {
        setError("OTP is required");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/users/verify-new-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            otp,
            newEmail: pendingEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to verify OTP");
        return;
      }

      setUser((prev) => ({
        ...prev,
        email: pendingEmail,
      }));
      setOtpSent(false);
      setPendingEmail("");
      setOtp("");
      setSuccessMessage("Email updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Error verifying OTP. Please try again.");
    }
  };

  const clearError = () => {
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex justify-center items-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex justify-center items-center p-6">
      <div className="max-w-lg w-full backdrop-blur-lg bg-black/30 p-8 rounded-xl border border-purple-500/20 shadow-lg">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-white hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-white p-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <label
            htmlFor="profile-upload"
            className="relative cursor-pointer group"
          >
            <div className="w-40 h-40 rounded-full border-2 border-cyan-400/50 overflow-hidden flex items-center justify-center text-gray-400 bg-gray-700 group-hover:scale-105 transition-all duration-300">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>No PFP</span>
              )}
            </div>
            <input
              type="file"
              id="profile-upload"
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
          </label>
        </div>

        {/* User Information */}
        <div className="text-center mt-6">
          {editName ? (
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-black/50 border border-purple-500/30 rounded-lg p-2 text-white text-center text-xl"
              />
              <button
                onClick={handleUpdateName}
                className="px-3 py-1 bg-purple-500/40 rounded-lg hover:bg-purple-500/60 transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditName(false);
                  setNameInput(user.name);
                }}
                className="px-3 py-1 bg-gray-500/40 rounded-lg hover:bg-gray-500/60 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text">
                {user.name}
              </h1>
              <button
                onClick={() => setEditName(true)}
                className="text-gray-400 hover:text-white"
              >
                ✏️
              </button>
            </div>
          )}

          <p className="mt-2 text-gray-300">{user.email}</p>
          <button
            className="mt-2 text-sm px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:border-cyan-400/50 transition-all duration-300"
            onClick={handleChangeEmail}
          >
            Change Email
          </button>
        </div>
      </div>

      {/* Email Change Modal */}
      {isChangingEmail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-white">Update Email</h3>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2 mt-4 border border-purple-500/30 rounded-lg bg-black text-white"
              placeholder="Enter new email"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
                onClick={() => setIsChangingEmail(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400"
                onClick={handleUpdateEmail}
              >
                Update Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpSent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-white">
              Verify Your Identity
            </h3>
            <p className="text-gray-400 mt-2">
              OTP sent to {pendingEmail}. Please verify.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mt-4 border border-purple-500/30 rounded-lg bg-black text-white"
              placeholder="Enter OTP"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
                onClick={() => setOtpSent(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400"
                onClick={handleVerifyOtp}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
