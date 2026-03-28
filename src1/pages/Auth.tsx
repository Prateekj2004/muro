import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupRoute = location.pathname === "/signup";
  const [isLogin, setIsLogin] = useState<boolean>(!isSignupRoute);
  const [loading, setLoading] = useState<boolean>(false);
  
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
    setEmail(""); setPassword(""); setFullName(""); setContact(""); setConfirmPassword("");
    navigate(toLogin ? "/login" : "/signup");
  };

  // ==========================================
  // 🔥 THE "NO-NONSENSE" REDIRECT LOGIC
  // ==========================================
  const handleLoginSuccess = (responseJson: any) => {
    const token = responseJson.data?.token;
    const user = responseJson.data?.user;

    if (!token || !user) {
      toast.error("Invalid data received from server.");
      return;
    }

    // 1. Storage update
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    // 2. Role check
    const role = user.role ? user.role.toString().toUpperCase().trim() : "USER";
    
    toast.success(`Welcome back, ${user.name}!`);

    // 3. Force Redirect
    if (role === "ADMIN") {
      window.location.href = "/admin/dashboard"; 
    } else {
      window.location.href = "/";
    }
  };

  const performAutoLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: email, password: password }), 
      });
      const data = await response.json();
      if (response.ok && data.success) {
        handleLoginSuccess(data);
      }
    } catch (e) {
      console.error("Auto-login failed:", e);
    }
  };

  const handleMainSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ email: email, password: password }), 
        });
        
        const data = await response.json();

        if (response.ok && data.success) {
          handleLoginSuccess(data);
        } else {
          toast.error(data.message || "Login failed. Check your credentials.");
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

        if (signupRes.ok && signupData.success) {
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
          <Link to="/" className="font-coolvetica text-2xl tracking-tight uppercase hover:opacity-60 transition-opacity">
            muro poster
          </Link>
        </div>

        <div className="flex justify-center gap-8 mb-8 border-b border-[#E5E5E5]">
          <button onClick={() => handleTabSwitch(true)} type="button" className={`pb-3 text-[13px] font-[500] uppercase tracking-[0.1em] transition-all relative ${isLogin ? "text-black" : "text-gray-400 hover:text-gray-600"}`}>
            Login
            {isLogin && <motion.div layoutId="auth-underline" className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black" />}
          </button>
          <button onClick={() => handleTabSwitch(false)} type="button" className={`pb-3 text-[13px] font-[500] uppercase tracking-[0.1em] transition-all relative ${!isLogin ? "text-black" : "text-gray-400 hover:text-gray-600"}`}>
            Sign Up
            {!isLogin && <motion.div layoutId="auth-underline" className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black" />}
          </button>
        </div>

        <form onSubmit={handleMainSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
              {/* 🔥 FIX: Removed 'uppercase' from className */}
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="FULL NAME" className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent" />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
            {/* 🔥 FIX: Removed 'uppercase' from className */}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL ADDRESS" className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent" />
          </div>

          {!isLogin && (
            <div className="relative group">
              <Phone className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
              {/* 🔥 FIX: Removed 'uppercase' from className */}
              <input type="tel" required value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))} placeholder="CONTACT NUMBER" maxLength={10} className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent" />
            </div>
          )}

          <div className="relative group">
            <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
            {/* 🔥 FIX: Removed 'uppercase' from className */}
            <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD" className="w-full pl-8 pr-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-3 text-gray-400 hover:text-black transition-colors">
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {!isLogin && (
            <div className="relative group">
              <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
              {/* 🔥 FIX: Removed 'uppercase' from className */}
              <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="CONFIRM PASSWORD" className="w-full pl-8 pr-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-3 text-gray-400 hover:text-black transition-colors">
                {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full mt-4 bg-black text-white py-4 text-[13px] font-[500] uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 group ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#222222] cursor-pointer"}`}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px] text-gray-400 tracking-wider">
          BY CONTINUING, YOU AGREE TO MURO'S <br/>
          <Link to="/terms" className="text-black hover:underline underline-offset-2">TERMS</Link> & <Link to="/privacy" className="text-black hover:underline underline-offset-2">PRIVACY POLICY</Link>.
        </p>
      </div>
    </div>
  );
};

export default Auth;