import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://muroposter.com/api";

type AuthMode = "login" | "signup" | "signupOtp" | "forgot" | "reset";

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getModeFromPath = (): AuthMode => {
    if (location.pathname === "/signup") return "signup";
    if (location.pathname === "/forgot-password") return "forgot";
    return "login";
  };

  const [mode, setMode] = useState<AuthMode>(getModeFromPath());
  const [loading, setLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [otpEmail, setOtpEmail] = useState<string>("");

  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string>("");
  const [contact, setContact] = useState<string>("");

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [otp, setOtp] = useState<string>("");
  const [resetPassword, setResetPassword] = useState<string>("");
  const [resetConfirmPassword, setResetConfirmPassword] =
    useState<string>("");
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);

  useEffect(() => {
    setMode(getModeFromPath());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setContact("");
    setConfirmPassword("");
    setOtp("");
    setResetPassword("");
    setResetConfirmPassword("");
  };

  const handleTabSwitch = (nextMode: AuthMode) => {
    clearForm();

    if (nextMode === "login") navigate("/login");
    if (nextMode === "signup") navigate("/signup");
    if (nextMode === "forgot") navigate("/forgot-password");
  };

  const handleLoginSuccess = (responseJson: any) => {
    const token = responseJson.data?.token;
    const user = responseJson.data?.user;

    if (!token || !user) {
      toast.error("Invalid data received from server.");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    window.dispatchEvent(new Event("muro_auth_updated"));

    const role = user.role ? user.role.toString().toUpperCase().trim() : "USER";

    toast.success(`Welcome, ${user.name}!`);

    if (role === "ADMIN") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/";
    }
  };

  const postJson = async (path: string, body: any) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
      const errorMsg = data?.errors
        ? Object.values(data.errors).flat().join("\n")
        : data?.message;

      throw new Error(errorMsg || "Request failed");
    }

    return data;
  };

  const handleLoginSubmit = async () => {
    const data = await postJson("/auth/login", {
      email,
      password,
    });

    handleLoginSuccess(data);
  };

  const handleSignupSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const data = await postJson("/auth/signup", {
      name: fullName,
      email,
      contact_number: contact,
      password,
      password_confirmation: confirmPassword,
    });

    toast.success(data?.message || "OTP sent to your email");
    setOtpEmail(email);
    setMode("signupOtp");
  };

  const handleVerifySignupOtp = async () => {
    const data = await postJson("/auth/signup/verify-otp", {
      email: otpEmail || email,
      otp,
    });

    toast.success("Email verified successfully");
    handleLoginSuccess(data);
  };

  const handleResendSignupOtp = async () => {
    const data = await postJson("/auth/signup/resend-otp", {
      email: otpEmail || email,
    });

    toast.success(data?.message || "OTP resent");
  };

  const handleForgotSubmit = async () => {
    const data = await postJson("/auth/forgot-password", {
      email,
    });

    toast.success(data?.message || "OTP sent to your email");
    setOtpEmail(email);
    setMode("reset");
  };

  const handleResetPasswordSubmit = async () => {
    if (resetPassword !== resetConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const data = await postJson("/auth/reset-password", {
      email: otpEmail || email,
      otp,
      password: resetPassword,
      password_confirmation: resetConfirmPassword,
    });

    toast.success(data?.message || "Password reset successful");
    clearForm();
    navigate("/login");
    setMode("login");
  };

  const handleMainSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") await handleLoginSubmit();
      if (mode === "signup") await handleSignupSubmit();
      if (mode === "signupOtp") await handleVerifySignupOtp();
      if (mode === "forgot") await handleForgotSubmit();
      if (mode === "reset") await handleResetPasswordSubmit();
    } catch (error: any) {
      toast.error(error?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "login"
      ? "Sign In"
      : mode === "signup"
      ? "Create Account"
      : mode === "signupOtp"
      ? "Verify Email"
      : mode === "forgot"
      ? "Forgot Password"
      : "Reset Password";

  const buttonText =
    mode === "login"
      ? "Sign In"
      : mode === "signup"
      ? "Send Email OTP"
      : mode === "signupOtp"
      ? "Verify OTP"
      : mode === "forgot"
      ? "Send Reset OTP"
      : "Reset Password";

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#FAFAFA] flex items-center justify-center px-5 py-10 font-sans text-black">
      <div className="w-full max-w-[440px] bg-white border border-[#E5E5E5] p-8 md:p-12 shadow-sm">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="font-coolvetica text-2xl tracking-tight uppercase hover:opacity-60 transition-opacity"
          >
            muro poster
          </Link>

          <h1 className="mt-6 text-[18px] font-semibold tracking-[0.18em] uppercase">
            {title}
          </h1>
        </div>

        {(mode === "login" || mode === "signup") && (
          <div className="flex justify-center gap-8 mb-8 border-b border-[#E5E5E5]">
            <button
              onClick={() => handleTabSwitch("login")}
              type="button"
              className={`pb-3 text-[13px] font-[500] uppercase tracking-[0.1em] transition-all relative ${
                mode === "login"
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Login
              {mode === "login" && (
                <motion.div
                  layoutId="auth-underline"
                  className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black"
                />
              )}
            </button>

            <button
              onClick={() => handleTabSwitch("signup")}
              type="button"
              className={`pb-3 text-[13px] font-[500] uppercase tracking-[0.1em] transition-all relative ${
                mode === "signup"
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign Up
              {mode === "signup" && (
                <motion.div
                  layoutId="auth-underline"
                  className="absolute left-0 bottom-[-1px] w-full h-[2px] bg-black"
                />
              )}
            </button>
          </div>
        )}

        <form onSubmit={handleMainSubmit} className="flex flex-col gap-6">
          {mode === "signup" && (
            <>
              <FieldWrapper icon={<User />}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="FULL NAME"
                  className="auth-input"
                />
              </FieldWrapper>

              <FieldWrapper icon={<Phone />}>
                <input
                  type="tel"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
                  placeholder="CONTACT NUMBER"
                  maxLength={10}
                  className="auth-input"
                />
              </FieldWrapper>
            </>
          )}

          {(mode === "login" || mode === "signup" || mode === "forgot") && (
            <FieldWrapper icon={<Mail />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="auth-input"
              />
            </FieldWrapper>
          )}

          {(mode === "signupOtp" || mode === "reset") && (
            <>
              <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-4 text-[12px] text-gray-600 leading-relaxed">
                OTP sent to{" "}
                <span className="text-black font-semibold">
                  {otpEmail || email}
                </span>
              </div>

              <FieldWrapper icon={<ShieldCheck />}>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="ENTER 6 DIGIT OTP"
                  className="auth-input tracking-[0.35em]"
                />
              </FieldWrapper>
            </>
          )}

          {(mode === "login" || mode === "signup") && (
            <PasswordField
              value={password}
              setValue={setPassword}
              show={showPassword}
              setShow={setShowPassword}
              placeholder="PASSWORD"
            />
          )}

          {mode === "signup" && (
            <PasswordField
              value={confirmPassword}
              setValue={setConfirmPassword}
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              placeholder="CONFIRM PASSWORD"
            />
          )}

          {mode === "reset" && (
            <>
              <PasswordField
                value={resetPassword}
                setValue={setResetPassword}
                show={showResetPassword}
                setShow={setShowResetPassword}
                placeholder="NEW PASSWORD"
              />

              <PasswordField
                value={resetConfirmPassword}
                setValue={setResetConfirmPassword}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                placeholder="CONFIRM NEW PASSWORD"
              />
            </>
          )}

          {mode === "login" && (
            <button
              type="button"
              onClick={() => handleTabSwitch("forgot")}
              className="text-right text-[12px] font-medium text-gray-500 hover:text-black -mt-3"
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 bg-black text-white py-4 text-[13px] font-[500] uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 group ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-[#222222] cursor-pointer"
            }`}
          >
            {loading ? "Processing..." : buttonText}
            {!loading && (
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                strokeWidth={1.5}
              />
            )}
          </button>

          {mode === "signupOtp" && (
            <button
              type="button"
              onClick={handleResendSignupOtp}
              disabled={loading}
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-500 hover:text-black"
            >
              Resend OTP
            </button>
          )}

          {(mode === "forgot" || mode === "reset" || mode === "signupOtp") && (
            <button
              type="button"
              onClick={() => handleTabSwitch("login")}
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gray-500 hover:text-black"
            >
              Back to Login
            </button>
          )}
        </form>

        <p className="mt-8 text-center text-[11px] text-gray-400 tracking-wider">
          BY CONTINUING, YOU AGREE TO MURO'S <br />
          <Link
            to="/terms"
            className="text-black hover:underline underline-offset-2"
          >
            TERMS
          </Link>{" "}
          &{" "}
          <Link
            to="/privacy"
            className="text-black hover:underline underline-offset-2"
          >
            PRIVACY POLICY
          </Link>
          .
        </p>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          padding-left: 2rem;
          padding-bottom: 0.75rem;
          padding-right: 2rem;
          font-size: 13px;
          letter-spacing: 0.08em;
          outline: none;
          border-bottom: 1px solid #E5E5E5;
          background: transparent;
          transition: border-color 0.2s ease;
        }
        .auth-input:focus {
          border-bottom-color: #000;
        }
        .auth-input::placeholder {
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

const FieldWrapper = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="relative group">
    <div className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors [&>svg]:w-[18px] [&>svg]:h-[18px] [&>svg]:stroke-[1.5]">
      {icon}
    </div>
    {children}
  </div>
);

const PasswordField = ({
  value,
  setValue,
  show,
  setShow,
  placeholder,
}: {
  value: string;
  setValue: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
  placeholder: string;
}) => (
  <div className="relative group">
    <Lock
      className="absolute left-0 top-3 w-[18px] h-[18px] text-gray-400 group-focus-within:text-black transition-colors"
      strokeWidth={1.5}
    />

    <input
      type={show ? "text" : "password"}
      required
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="auth-input"
    />

    <button
      type="button"
      onClick={() => setShow(!show)}
      className="absolute right-0 top-3 text-gray-400 hover:text-black transition-colors"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

export default Auth;
