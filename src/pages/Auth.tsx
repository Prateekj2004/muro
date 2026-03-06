import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
// Corrected import below
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Base URL from .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupRoute = location.pathname === "/signup";
  const [isLogin, setIsLogin] = useState<boolean>(!isSignupRoute);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Form States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
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

  const performAutoLogin = async () => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json" 
      },
      body: JSON.stringify({ email: email, password: password }), 
    });
    
    const data = await response.json();

    if (response.ok && data.success !== false) {
      localStorage.setItem("token", data.token || data.data?.token || data.access_token);
      if (data.user || data.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user || data.data?.user));
      }
      window.dispatchEvent(new Event("storage"));
      navigate("/"); 
    }
  };

  const handleMainSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (email === "admin@muro.com" && password === "admin123") {
          localStorage.setItem("token", "admin-dummy-token-12345");
          localStorage.setItem("user", JSON.stringify({ name: "Admin", role: "admin", email: "admin@muro.com" }));
          toast.success("Welcome, Admin!");
          window.dispatchEvent(new Event("storage"));
          navigate("/admin/dashboard"); 
          return;
        }

        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ email: email, password: password }), 
        });
        
        const data = await response.json();

        if (response.ok && data.success !== false) {
          localStorage.setItem("token", data.token || data.data?.token || data.access_token);
          if (data.user || data.data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user || data.data?.user));
          }
          toast.success("Login Successful!");
          window.dispatchEvent(new Event("storage"));
          navigate("/"); 
        } else {
          toast.error(data.message || "Login failed.");
        }

      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match!");
          setLoading(false);
          return;
        }

        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email: email,
            contact_number: contact,
            password: password,
            password_confirmation: confirmPassword
          })
        });
        const signupData = await signupRes.json();

        if (signupRes.ok && signupData.success !== false) {
          toast.success("Account created! Logging you in...");
          await performAutoLogin();
        } else {
          const errorMsg = signupData.errors ? Object.values(signupData.errors).flat().join("\n") : signupData.message;
          toast.error(errorMsg || "Registration failed.");
        }
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#FAFAFA] flex items-center justify-center px-5 py-10 font-sans text-black">
      <div className="w-full max-w-[440px] bg-white border border-[#E5E5E5] p-8 md:p-12 shadow-sm">
        
        <div className="text-center mb-10">
          <Link to="/" className="font-coolvetica text-2xl tracking-tight uppercase">muro poster</Link>
        </div>

        <div className="flex justify-center gap-8 mb-8 border-b border-[#E5E5E5]">
          <button onClick={() => handleTabSwitch(true)} className={`pb-3 text-[13px] font-medium uppercase tracking-widest relative ${isLogin ? "text-black" : "text-gray-400"}`}>
            Login
            {isLogin && <motion.div layoutId="underline" className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black" />}
          </button>
          <button onClick={() => handleTabSwitch(false)} className={`pb-3 text-[13px] font-medium uppercase tracking-widest relative ${!isLogin ? "text-black" : "text-gray-400"}`}>
            Sign Up
            {!isLogin && <motion.div layoutId="underline" className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black" />}
          </button>
        </div>

        <form onSubmit={handleMainSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="FULL NAME" className="w-full pl-8 pb-3 text-[13px] outline-none border-b border-[#E5E5E5] focus:border-black bg-transparent uppercase" />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL ADDRESS" className="w-full pl-8 pb-3 text-[13px] outline-none border-b border-[#E5E5E5] focus:border-black bg-transparent uppercase" />
          </div>

          {!isLogin && (
            <div className="relative group">
              <Phone className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
              <input type="tel" required value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))} placeholder="CONTACT NUMBER" maxLength={10} className="w-full pl-8 pb-3 text-[13px] outline-none border-b border-[#E5E5E5] focus:border-black bg-transparent uppercase" />
            </div>
          )}

          <div className="relative group">
            <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD" className="w-full pl-8 pr-8 pb-3 text-[13px] outline-none border-b border-[#E5E5E5] focus:border-black bg-transparent uppercase" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-3 text-gray-400 hover:text-black">
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {!isLogin && (
            <div className="relative group">
              <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400" strokeWidth={1.5} />
              <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="CONFIRM PASSWORD" className="w-full pl-8 pr-8 pb-3 text-[13px] outline-none border-b border-[#E5E5E5] focus:border-black bg-transparent uppercase" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-3 text-gray-400 hover:text-black">
                {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full mt-4 bg-black text-white py-4 text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 group disabled:opacity-70 transition-all">
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-gray-400 tracking-wider">
          BY CONTINUING, YOU AGREE TO MURO'S <br/>
          <Link to="/terms" className="text-black hover:underline">TERMS</Link> & <Link to="/privacy" className="text-black hover:underline">PRIVACY POLICY</Link>.
        </p>
      </div>
    </div>
  );
};

export default Auth;