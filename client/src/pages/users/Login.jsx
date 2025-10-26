import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { loginUser, signupUser } from "@/utils/api.js";
import { AlertCircle, X } from "lucide-react";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import "./Auth.css";

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const location = useLocation();
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      }
    } catch (err) {
      const errors = err.errors || [];
      setAlertTitle("Login Failed");
      setAlertMessage(errors.length ? errors.map((e) => e.msg).join(", ") : err.message || "An unknown error occurred.");
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
        window.location.href = "/";
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
                  <div className="form-group" data-aos="fade-up" data-aos-delay="200">
                    <input
                      type="password"
                      id="login-password"
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      required
                    />
                    <label htmlFor="login-password" className="form-label">Password</label>
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
