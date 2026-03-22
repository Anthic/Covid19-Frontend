import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLottie } from "lottie-react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import loginAnimation from "../assets/lottie/login.json";
import registerAnimation from "../assets/lottie/register.json";
import { useLogin, useRegister } from "../hooks/useAuth";
import { useToast } from "../components/toast/ToastProvider";

type FormMode = "login" | "register";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

function InputField({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs tracking-widest uppercase text-slate-400">
        {label}
      </label>

      <div className="relative flex items-center">
        <Icon size={16} className="absolute left-4 text-slate-500" />

        <input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 text-slate-500 hover:text-white"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode: FormMode = location.pathname === "/register" ? "register" : "login";

  const toast = useToast();
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;
  let errorMsg = "Something went wrong";
  if (error) {
    const errData = (error as any)?.response?.data;
    if (errData?.errorSources && errData.errorSources.length > 0) {
      errorMsg = errData.errorSources[0].message;
    } else if (errData?.message) {
      errorMsg = errData.message;
    } else if ((error as Error).message) {
      errorMsg = (error as Error).message;
    }
  }

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
  });

  const pwd = registerForm.password;
  const pwdReqs = [
    { label: "8+ characters", valid: pwd.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(pwd) },
    { label: "Lowercase letter", valid: /[a-z]/.test(pwd) },
    { label: "Number", valid: /\d/.test(pwd) },
    { label: "Special char (!@#$)", valid: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ];

  // When register succeeds → switch to login, show success message
  useEffect(() => {
    if (registerMutation.isSuccess) {
      setRegisterSuccess(true);
      navigate("/login");
      setLoginForm({ email: registerForm.email, password: "" });
      toast.success("Account Created", "Your account was successfully created! Please log in.");
      registerMutation.reset();
    }
  }, [registerMutation.isSuccess, registerForm.email, toast]);

  // Use Effect to show login success
  useEffect(() => {
    if (loginMutation.isSuccess) {
      toast.success("Login Successful", "Welcome back to the Prediction module.");
      loginMutation.reset();
    }
  }, [loginMutation.isSuccess, toast, loginMutation]);

  // Use Effect to show errors
  useEffect(() => {
    if (loginMutation.isError) {
      toast.error("Login Failed", errorMsg);
      loginMutation.reset();
    }
    if (registerMutation.isError) {
      toast.error("Registration Failed", errorMsg);
      registerMutation.reset();
    }
  }, [loginMutation.isError, registerMutation.isError, errorMsg, toast, loginMutation, registerMutation]);

  // Clear success banner when user switches mode or starts typing
  useEffect(() => {
    setRegisterSuccess(false);
  }, [mode, loginForm.email, loginForm.password]);

  const { View: LottieView } = useLottie({
    animationData: mode === "login" ? loginAnimation : registerAnimation,
    loop: true,
    autoplay: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate(loginForm);
    } else {
      registerMutation.mutate(registerForm);
    }
  };

  const switchMode = (next: FormMode) => {
    navigate(`/${next}`);
    loginMutation.reset();
    registerMutation.reset();
    setRegisterSuccess(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* LEFT */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="w-[420px]">{LottieView}</div>
        <div className="absolute bottom-10 text-center">
          <Link to="/" className="text-2xl font-bold text-white block">
            &lt;Covid-19/&gt;
          </Link>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Predict · Analyze · Protect
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            {mode === "login"
              ? "Sign in to continue"
              : "Register to start prediction"}
          </p>

          {/* REGISTER SUCCESS BANNER */}
          {registerSuccess && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-5">
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-sm">
                Account created! Please sign in.
              </p>
            </div>
          )}

          {/* ERROR BANNER */}
          {(loginMutation.isError || registerMutation.isError) && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {mode === "login" ? (
              <>
                <InputField
                  id="login-email"
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={loginForm.email}
                  onChange={(v) => setLoginForm({ ...loginForm, email: v })}
                  placeholder="you@example.com"
                />
                <InputField
                  id="login-password"
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={loginForm.password}
                  onChange={(v) => setLoginForm({ ...loginForm, password: v })}
                  placeholder="Enter password"
                />
              </>
            ) : (
              <>
                <InputField
                  id="reg-name"
                  label="Name"
                  icon={User}
                  value={registerForm.name}
                  onChange={(v) => setRegisterForm({ ...registerForm, name: v })}
                />
                <InputField
                  id="reg-email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={registerForm.email}
                  onChange={(v) => setRegisterForm({ ...registerForm, email: v })}
                />
                <InputField
                  id="reg-password"
                  label="Password"
                  icon={Lock}
                  type="password"
                  value={registerForm.password}
                  onChange={(v) => setRegisterForm({ ...registerForm, password: v })}
                />
                {mode === "register" && registerForm.password.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs transition-all duration-300">
                    <p className="text-slate-400 mb-2 font-medium tracking-wider uppercase text-[10px]">Password Requirements:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pwdReqs.map((req, i) => (
                        <div key={i} className={`flex items-center gap-2 ${req.valid ? "text-emerald-400" : "text-slate-500"}`}>
                          <CheckCircle size={14} className={req.valid ? "text-emerald-400" : "text-slate-600"} /> 
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-white font-medium"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}