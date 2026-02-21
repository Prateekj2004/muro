import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupRoute = location.pathname === "/signup";
  const [isLogin, setIsLogin] = useState<boolean>(!isSignupRoute);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Shared Form States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Signup Specific States
  const [fullName, setFullName] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  useEffect(() => {
    setIsLogin(location.pathname !== "/signup");
  }, [location.pathname]);

  const handleTabSwitch = (toLogin: boolean) => {
    setEmail("");
    setPassword("");
    setFullName("");
    setContact("");
    setConfirmPassword("");
    navigate(toLogin ? "/login" : "/signup");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN API (Using FormData as requested) ---
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        const response = await fetch("https://endpoint.titservices.online/api/login", {
          method: "POST",
          body: formData, // Sending as FormData
        });

        const data = await response.json();

        if (response.ok) {
          // Save token & user info (adjust keys based on your actual API response)
          localStorage.setItem("token", data.token || data.access_token);
          if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
          
          alert("Login Successful!");
          navigate("/"); // Redirect to home after login
        } else {
          alert(data.message || "Login failed. Please check your credentials.");
        }

      } else {
        // --- SIGNUP API (JSON Payload) ---
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          setLoading(false);
          return;
        }

        const payload = {
          name: fullName,
          email: email,
          contact_number: contact,
          password: password,
          password_confirmation: confirmPassword
        };

        const response = await fetch("https://endpoint.titservices.online/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration Successful! Please login.");
          handleTabSwitch(true); // Switch to login tab
        } else {
          // Displaying error messages from Laravel validation
          const errorMsg = data.errors ? Object.values(data.errors).flat().join("\n") : data.message;
          alert(errorMsg || "Registration failed.");
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#FAFAFA] flex items-center justify-center px-5 py-10 font-sans text-black">
      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white border border-[#E5E5E5] p-8 md:p-12 shadow-sm relative overflow-hidden">
        
        {/* Brand/Logo Area */}
        <div className="text-center mb-10">
          <Link to="/" className="font-coolvetica text-2xl tracking-tight uppercase hover:opacity-60 transition-opacity">
            muro poster
          </Link>
        </div>

        {/* Toggle Login / Signup */}
        <div className="flex justify-center gap-8 mb-8 border-b border-[#E5E5E5]">
          <button
            onClick={() => handleTabSwitch(true)}
            type="button"
            className={`pb-3 text-[13px] font-[500] uppercase tracking-[0.1em] transition-all relative ${
              isLogin ? "text-black" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Login
            {isLogin && (
              <motion.div
                layoutId="auth-underline"
                className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black"
              />
            )}
          </button>
          <button
            onClick={() => handleTabSwitch(false)}
            type="button"
            className={`pb-3 text-[13px] font-[500] uppercase tracking-[0.1em] transition-all relative ${
              !isLogin ? "text-black" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign Up
            {!isLogin && (
              <motion.div
                layoutId="auth-underline"
                className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black"
              />
            )}
          </button>
        </div>

        {/* Form Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Full Name (Only for Signup) */}
              {!isLogin && (
                <div className="relative group">
                  <User className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="FULL NAME"
                    className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase"
                  />
                </div>
              )}

              {/* Email Field (Shared) */}
              <div className="relative group">
                <Mail className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase"
                />
              </div>

              {/* Contact Field (Only for Signup) */}
              {!isLogin && (
                <div className="relative group">
                  <Phone className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))}
                    placeholder="CONTACT NUMBER"
                    maxLength={10}
                    className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase"
                  />
                </div>
              )}

              {/* Password Field (Shared) */}
              <div className="relative group">
                <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full pl-8 pr-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5}/> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5}/>}
                </button>
              </div>

              {/* Confirm Password Field (Only for Signup) */}
              {!isLogin && (
                <div className="relative group">
                  <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="CONFIRM PASSWORD"
                    className="w-full pl-8 pr-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-3 text-gray-400 hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5}/> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5}/>}
                  </button>
                </div>
              )}

              {/* Forgot Password (Only for Login) */}
              {isLogin && (
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-[11px] text-gray-500 hover:text-black hover:underline underline-offset-4 tracking-wider transition-all uppercase">
                    Forgot Password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className={`w-full mt-4 bg-black text-white py-4 text-[13px] font-[500] uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 group ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#222222] cursor-pointer"}`}
              >
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />}
              </button>
              
            </form>
          </motion.div>
        </AnimatePresence>

        {/* Minimal Footer */}
        <p className="mt-8 text-center text-[11px] text-gray-400 tracking-wider">
          BY CONTINUING, YOU AGREE TO MURO'S <br/>
          <Link to="/terms" className="text-black hover:underline underline-offset-2">TERMS</Link> & <Link to="/privacy" className="text-black hover:underline underline-offset-2">PRIVACY POLICY</Link>.
        </p>

      </div>
    </div>
  );
};

export default Auth;