import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAdminApi } from "@/api/authAdminApi";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
// import Cookies from "js-cookie";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAdminApi.login(email, password);
      console.log("Login response:", response);

      if (response.success && response.user) {
        dispatch(setCredentials({ user: response.user, token: response.token }));
        // localStorage.setItem("adminToken", response.token);
        // Cookies.set("adminToken", response.token, {
        //   expires: 7,
        // });
        toast.success("Login successful");
        console.log(response);
        localStorage.setItem("permissions", JSON.stringify(response.user.permissions));
        localStorage.setItem("role", response.user.role);
        
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials."
      );
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/Madhav-Ayurveda-Logo.png"
            alt="Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
