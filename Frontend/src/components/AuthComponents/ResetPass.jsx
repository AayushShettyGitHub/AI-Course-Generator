import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

function ResetPass() {
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(
        "/auth/reset-password",
        { email, newPassword }
      );
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;
      toast.error(data?.message || data?.error || "Password reset failed.");
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-2xl p-5">
        <h2 className="text-2xl font-bold text-center mb-4 text-primary">Reset Password</h2>
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New Password"
            className="input input-bordered w-full mb-3"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-full shadow-lg shadow-primary/20">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPass;
