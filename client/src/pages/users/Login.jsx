import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { loginUser, signupUser } from "@/utils/api.js";
import { AlertCircle, X, Eye, EyeOff } from "lucide-react";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import "./Auth.css";

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const location = useLocation();
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Signup State
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Alert State
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      if (data?.token) {
        if (rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }
        window.location.replace("/"); // Use replace to avoid adding to history
      }
    } catch (err) {
      const errors = err.errors || [];
      setAlertTitle("Login Failed");
      setAlertMessage(errors.length ? errors.map((e) => e.msg).join(", ") : err.message || "An unknown error occurred.");
      // Provide a more user-friendly message for the common error
      if (err.error === "Invalid email or password") {
        setAlertMessage("The email or password you entered is incorrect. Please try again.");
      } else {
        setAlertMessage(errors.length ? errors.map((e) => e.msg).join(", ") : err.message || "An unknown error occurred.");
      }
      setIsAlertVisible(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (signupPassword !== signupConfirmPassword) {
        setAlertTitle("Signup Failed");
        setAlertMessage("Passwords do not match.");
        setIsAlertVisible(true);
        return;
      }
      const data = await signupUser({ name, email: signupEmail, password: signupPassword });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        window.location.replace("/"); // Use replace to avoid adding to history
      }
    } catch (err) {
      const errors = err.errors || [];
      setAlertTitle("Signup Failed");
      setAlertMessage(errors.length ? errors.map((e) => e.msg).join(", ") : err.message || "An unknown error occurred.");
      setIsAlertVisible(true);
    }
  };

  useEffect(() => {
    setIsRightPanelActive(location.pathname === "/user-signup");
  }, [location]);

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center bg-gray-100 transition-filter duration-300 ${isAlertVisible || showForgotPassword ? "blur-sm" : ""}`}>
        <div className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""}`}>
          
          {/* Sign Up Form */}
          <div className="form-container sign-up-container">
            <Signup 
              handleRegister={handleRegister}
              name={name}
              setName={setName}
              email={signupEmail}
              setEmail={setSignupEmail}
              password={signupPassword}
              setPassword={setSignupPassword}
              confirmPassword={signupConfirmPassword}
              setConfirmPassword={setSignupConfirmPassword}
              onSwitchToLogin={() => setIsRightPanelActive(false)}
            />
          </div>

          {/* Sign In Form */}
          <div className="form-container sign-in-container">
            <div className="h-full flex flex-col items-center justify-center px-10 text-center">
              <h1 className="text-3xl font-bold mb-4" data-aos="fade-up">Login</h1>
              <form onSubmit={handleLogin} className="w-full">
                  <div className="form-group" data-aos="fade-up" data-aos-delay="100">
                    <input
                      type="text"
                      id="login-email"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      required
                    />
                    <label htmlFor="login-email" className="form-label">Email</label>
                  </div>
                  <div className="form-group relative" data-aos="fade-up" data-aos-delay="200">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      required
                    />
                    <label htmlFor="login-password" className="form-label">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-4" data-aos="fade-up" data-aos-delay="225">
                    <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2">Remember Me</span>
                    </label>
                  </div>

                  <div className="text-right mt-2" data-aos="fade-up" data-aos-delay="250">
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm font-medium text-blue-600 hover:underline focus:outline-none">
                      Forgot your password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold uppercase tracking-wider transform hover:scale-105 transition-transform"
                    data-aos="fade-up"
                    data-aos-delay="300"
                  >
                    Login
                  </button>
              </form>
              <p className="text-sm text-center mt-6" data-aos="fade-up" data-aos-delay="400">
                Don't have an account?{" "}
                <button onClick={() => setIsRightPanelActive(true)} className="text-blue-600 font-semibold hover:underline focus:outline-none">
                  Sign Up
                </button>
              </p>
            </div>
          </div>

          {/* Overlay Panels */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1 className="text-3xl font-bold">Hello, Friend!</h1>
                <p className="text-sm mt-4 mb-6 px-8">Enter your personal details and start your journey with us</p>
              </div>
              <div className="overlay-panel overlay-right">
                <h1 className="text-3xl font-bold">Welcome Back!</h1>
                <p className="text-sm mt-4 mb-6 px-8">To keep connected with us please login with your personal info</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Panel */}
      <div className={`forgot-password-panel ${showForgotPassword ? 'visible' : ''}`}>
        {showForgotPassword && <ForgotPassword onClose={() => setShowForgotPassword(false)} />}
      </div>

      {/* Alert */}
      {isAlertVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsAlertVisible(false)} data-aos="fade">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform transition-all" data-aos="zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">{alertTitle}</h3>
            <p className="text-sm text-red-600 mt-2">{alertMessage}</p>
            <button 
              className="mt-6 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none" 
              onClick={() => setIsAlertVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
