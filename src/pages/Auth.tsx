import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// Base URL from .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupRoute = location.pathname === "/signup";
  const [isLogin, setIsLogin] = useState<boolean>(!isSignupRoute);
  
  // UI Steps: 'form' for normal inputs, 'otp' for the verification screen
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Form States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // OTP State
  const [otp, setOtp] = useState<string>("");

  useEffect(() => {
    setIsLogin(location.pathname !== "/signup");
    setAuthStep('form'); // Reset step if route changes via URL
  }, [location.pathname]);

  const handleTabSwitch = (toLogin: boolean) => {
    // Reset all states when switching tabs manually
    setEmail("");
    setPassword("");
    setFullName("");
    setContact("");
    setConfirmPassword("");
    setOtp("");
    setAuthStep('form');
    navigate(toLogin ? "/login" : "/signup");
  };

  // ==========================================
  // RESEND OTP (Used in the OTP screen)
  // ==========================================
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: email })
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        toast.success(data.message || "OTP resent successfully!");
      } else {
        toast.error(data.message || "Failed to resend OTP.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY OTP & AUTO-LOGIN
  // ==========================================
  const handleVerifyAndLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: email, otp: otp })
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success !== false) {
        
        // 2. Auto-Login right after successful verification
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json" 
          },
          body: JSON.stringify({ email: email, password: password }), 
        });
        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.success !== false) {
          localStorage.setItem("token", loginData.token || loginData.data?.token || loginData.access_token);
          if (loginData.user || loginData.data?.user) {
            localStorage.setItem("user", JSON.stringify(loginData.user || loginData.data?.user));
          }
          
          toast.success("Verified and Successfully Logged In!");
          window.dispatchEvent(new Event("storage"));
          navigate("/"); 
        } else {
          // If auto-login fails for some reason, redirect to manual login
          toast.success("Verified successfully! Please login.");
          handleTabSwitch(true);
        }
      } else {
        toast.error(verifyData.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      toast.error("Something went wrong during verification.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 1: INITIAL LOGIN OR SIGNUP SUBMIT
  // ==========================================
  const handleMainSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- HARDCODED ADMIN LOGIN CHECK ---
        if (email === "admin@muro.com" && password === "admin123") {
          localStorage.setItem("token", "admin-dummy-token-12345");
          localStorage.setItem("user", JSON.stringify({ name: "Admin", role: "admin", email: "admin@muro.com" }));
          
          toast.success("Welcome to the Admin Dashboard!");
          window.dispatchEvent(new Event("storage"));
          navigate("/admin/dashboard"); 
          setLoading(false);
          return;
        }

        // --- NORMAL LOGIN FLOW ---
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
          
          toast.success("Login Successful!");
          window.dispatchEvent(new Event("storage"));
          navigate("/"); 
        } else {
          if (data.errors) {
             const errorMessages = Object.values(data.errors).flat().join("\n");
             toast.error(errorMessages);
          } else {
             toast.error(data.message || "Login failed. Please check your credentials.");
          }
        }

      } else {
        // --- SIGNUP FLOW (Create Account -> Send OTP -> Switch to OTP Screen) ---
        if (password !== confirmPassword) {
          toast.error("Passwords do not match!");
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

        // 1. Create Account
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        const signupData = await signupRes.json();

        if (signupRes.ok && signupData.success !== false) {
          // 2. Account created! Immediately trigger OTP to email
          const otpRes = await fetch(`${BASE_URL}/auth/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ email: email })
          });
          
          // Switch UI to OTP screen
          setAuthStep('otp'); 
          toast.success("Account created! Please check your email for the OTP.");
          
          // Debugging log for development
          const otpData = await otpRes.json().catch(() => null);
          if (otpData?.data?.debug_otp) console.log("Debug OTP:", otpData.data.debug_otp);

        } else {
          if (signupData.errors) {
            const errorMessages = Object.values(signupData.errors).flat().join("\n");
            toast.error(errorMessages);
          } else {
            toast.error(signupData.message || "Registration failed.");
          }
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#FAFAFA] flex items-center justify-center px-5 py-10 font-sans text-black">
      <div className="w-full max-w-[440px] bg-white border border-[#E5E5E5] p-8 md:p-12 shadow-sm relative overflow-hidden">
        
        {/* Brand Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="font-coolvetica text-2xl tracking-tight uppercase hover:opacity-60 transition-opacity">
            muro poster
          </Link>
        </div>

        {/* Tab Switcher */}
        {authStep === 'form' && (
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
        )}

        <AnimatePresence mode="wait">
          {authStep === 'form' ? (
            /* ============================== */
            /* MAIN FORM UI                   */
            /* ============================== */
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <form onSubmit={handleMainSubmit} className="flex flex-col gap-6">
                
                {!isLogin && (
                  <div className="relative group">
                    <User className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="FULL NAME" className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase" />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL ADDRESS" className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase" />
                </div>

                {!isLogin && (
                  <div className="relative group">
                    <Phone className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                    <input type="tel" required value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))} placeholder="CONTACT NUMBER" maxLength={10} className="w-full pl-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase" />
                  </div>
                )}

                <div className="relative group">
                  <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD" className="w-full pl-8 pr-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-3 text-gray-400 hover:text-black transition-colors">
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5}/> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5}/>}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative group">
                    <Lock className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors" strokeWidth={1.5} />
                    <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="CONFIRM PASSWORD" className="w-full pl-8 pr-8 pb-3 text-[13px] tracking-wider outline-none border-b border-[#E5E5E5] focus:border-black placeholder:text-gray-400 transition-colors bg-transparent uppercase" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-3 text-gray-400 hover:text-black transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5}/> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.5}/>}
                    </button>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-[11px] text-gray-500 hover:text-black hover:underline underline-offset-4 tracking-wider transition-all uppercase">
                      Forgot Password?
                    </Link>
                  </div>
                )}

                <button type="submit" disabled={loading} className={`w-full mt-4 bg-black text-white py-4 text-[13px] font-[500] uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 group ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#222222] cursor-pointer"}`}>
                  {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />}
                </button>
              </form>
            </motion.div>
          ) : (
            /* ============================== */
            /* OTP SCREEN UI                  */
            /* ============================== */
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="text-center">
              
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-black" strokeWidth={1.5} />
                </div>
              </div>
              
              <h2 className="font-serif text-2xl mb-2 text-[#222222]">Verify Email</h2>
              <p className="text-gray-500 text-[11px] tracking-wider uppercase mb-8 leading-relaxed">
                We've sent a 6-digit code to <br/> <span className="font-bold text-black lowercase">{email}</span>
              </p>

              <form onSubmit={handleVerifyAndLogin} className="flex flex-col gap-6">
                <input
                  type="text"
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="ENTER 6-DIGIT OTP"
                  maxLength={6}
                  className="w-full text-center py-3 text-lg tracking-[0.3em] font-medium outline-none border-b-2 border-[#E5E5E5] focus:border-black placeholder:text-gray-300 placeholder:text-sm placeholder:tracking-widest transition-colors bg-transparent uppercase"
                />

                <button type="submit" disabled={loading || otp.length < 4} className={`w-full mt-4 bg-black text-white py-4 text-[13px] font-[500] uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 group ${loading || otp.length < 4 ? "opacity-70 cursor-not-allowed" : "hover:bg-[#222222] cursor-pointer"}`}>
                  {loading ? "Verifying..." : "Verify & Login"}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-between text-[11px] tracking-widest uppercase font-semibold">
                <button type="button" onClick={() => setAuthStep('form')} className="flex items-center gap-1 text-gray-400 hover:text-black transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[#2F4F4F] hover:text-black border-b border-transparent hover:border-black transition-all">
                  Resend Code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal Footer */}
        {authStep === 'form' && (
          <p className="mt-8 text-center text-[11px] text-gray-400 tracking-wider">
            BY CONTINUING, YOU AGREE TO MURO'S <br/>
            <Link to="/terms" className="text-black hover:underline underline-offset-2">TERMS</Link> & <Link to="/privacy" className="text-black hover:underline underline-offset-2">PRIVACY POLICY</Link>.
          </p>
        )}

      </div>
    </div>
  );
};

export default Auth;