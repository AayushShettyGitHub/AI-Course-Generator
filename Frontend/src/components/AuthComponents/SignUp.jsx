import axiosInstance from "../../utils/axiosInstance";
import { useState } from "react";
import { toast } from "react-hot-toast";

function SignUp({ toggleAuthMode }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/register", formData);
      toast.success("Registration successful! Please login.");
      toggleAuthMode();
    } catch (err) {
      const data = err.response?.data;
      let errorMessage = "Registration failed. Please try again.";

      if (data) {
        errorMessage = data.message || data.error || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error. Please try again later.";
      }

      console.error("Sign-up Error:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="hero bg-slate-50 min-h-screen">
      <div className="hero-content flex-col lg:flex-row gap-12">
        <div className="text-center lg:text-left max-w-md">
          <h1 className="text-6xl font-extrabold tracking-tight">
            Join the <span className="text-primary italic">Future.</span>
          </h1>
          <p className="py-6 text-lg text-gray-500">
            Create an account and start your personalized learning journey with AI today.
          </p>
        </div>
        <div className="card bg-white w-full max-w-sm shrink-0 shadow-xl border border-slate-100">
          <form className="card-body gap-4" onSubmit={handleSignUp}>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="input input-bordered focus:input-primary"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                className="input input-bordered focus:input-primary"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered focus:input-primary"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
              <div className="bg-error/10 text-error text-xs p-3 rounded-lg border border-error/20">
                {error}
              </div>
            )}
            <div className="form-control mt-2">
              <button type="submit" className="btn btn-primary btn-block shadow-lg shadow-primary/20">
                Create Account
              </button>
            </div>
          </form>
          <div className="px-8 pb-8 text-center text-sm">
            <span className="text-gray-400">Already a member? </span>
            <button className="text-primary font-bold hover:underline" onClick={toggleAuthMode}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
