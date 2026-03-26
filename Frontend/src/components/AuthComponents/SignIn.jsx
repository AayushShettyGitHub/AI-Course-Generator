import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

function SignIn({ toggleAuthMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axiosInstance.post(
        "/auth/login",
        { email, password }
      );

      Cookies.set("jwt", response.data.token, { expires: 7 });
      toast.success("Welcome back!");
      navigate("/homepage");
    } catch (error) {
      const data = error.response?.data;
      let errorMessage = "Something went wrong. Please try again.";

      if (data) {
        errorMessage = data.message || data.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      console.error("Login Error:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="hero bg-slate-50 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse gap-12">
        <div className="text-center lg:text-left max-w-md">
          <h1 className="text-6xl font-extrabold tracking-tight">
            Welcome <span className="text-primary italic">Back.</span>
          </h1>
          <p className="py-6 text-lg text-gray-500">
            Log in to continue your journey and explore your AI-generated courses.
          </p>
        </div>
        <div className="card bg-white w-full max-w-sm shrink-0 shadow-xl border border-slate-100">
          <form className="card-body gap-4" onSubmit={handleSignIn}>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="input input-bordered focus:input-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered focus:input-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="label">
                <button
                  type="button"
                  className="label-text-alt link link-hover text-primary"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </label>
            </div>
            {error && (
              <div className="bg-error/10 text-error text-xs p-3 rounded-lg border border-error/20">
                {error}
              </div>
            )}
            <div className="form-control mt-2">
              <button type="submit" className="btn btn-primary btn-block shadow-lg shadow-primary/20">
                Sign In
              </button>
            </div>
          </form>
          <div className="px-8 pb-8 text-center text-sm">
            <span className="text-gray-400">New here? </span>
            <button className="text-primary font-bold hover:underline" onClick={toggleAuthMode}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
