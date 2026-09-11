import { apiFetch } from "../api";
import React, { useState, useRef } from "react";
import { Shield, Lock, Map as MapIcon, Eye, EyeOff, User, Settings, ArrowRight } from "lucide-react";
import { useTranslation } from "../i18n";

export function Login({ onLogin }: { onLogin: (userData: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"Idle" | "Authenticating" | "Success" | "Invalid Credentials" | "Account Disabled" | "Server Error" | "Session Error">("Idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  
  // Forgot password states
  const [resetStatus, setResetStatus] = useState<"idle" | "requesting" | "otp" | "resetting" | "success">("idle");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  
  const { t, language, setLanguage } = useTranslation();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus("Invalid Credentials");
      setErrorMsg(t("auth.emailReq"));
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setStatus("Invalid Credentials");
      setErrorMsg(t("auth.invalidEmail"));
      return;
    }
    if (!password) {
      setStatus("Invalid Credentials");
      setErrorMsg(t("auth.passReq"));
      return;
    }

    setStatus("Authenticating");
    setErrorMsg("");
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) setStatus("Account Disabled");
        else setStatus("Invalid Credentials");
        setErrorMsg(data.error ? t(data.error) : t("auth.loginFailed"));
        return;
      }
      
      setStatus("Success");
      localStorage.setItem("bhoomi_token", data.token);
      localStorage.setItem("bhoomi_refresh", data.refreshToken);
      onLogin(data.user);
    } catch (err) {
      setStatus("Server Error");
      setErrorMsg(t("auth.serverError"));
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ? t(data.error) : t("auth.serverError"));
      } else {
        setResendTimer(60);
      }
    } catch (e) {
      setErrorMsg(t("auth.serverError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
       // Handle paste
       const pasted = value.replace(/\D/g, '').slice(0, 6);
       const newOtp = [...otp];
       for(let i=0; i<pasted.length; i++){
          newOtp[i] = pasted[i];
       }
       setOtp(newOtp);
       if (pasted.length < 6) {
         otpRefs[pasted.length]?.current?.focus();
       } else {
         otpRefs[5]?.current?.focus();
       }
       return;
    }
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const trimmedEmail = email.trim();
    
    if (resetStatus === "idle") {
      if (!trimmedEmail || !validateEmail(trimmedEmail)) {
        setErrorMsg(t("auth.invalidEmail"));
        return;
      }
      setResetStatus("requesting");
      try {
        const res = await apiFetch("/api/auth/forgot-password", {
           method: "POST", headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email: trimmedEmail })
        });
        if (res.ok) {
           setResetStatus("otp"); setResendTimer(60);
           // Show demo OTP for convenience
           const data = await res.json();
           if(data.mockOtp) {
               // We will just show it in the UI as a hint
           }
        }
        else {
           setResetStatus("idle");
           setErrorMsg(t("auth.serverError"));
        }
      } catch (e) {
        setResetStatus("idle");
        setErrorMsg(t("auth.serverError"));
      }
    } else if (resetStatus === "otp") {
      const fullOtp = otp.join('');
      if (fullOtp.length !== 6) {
        setErrorMsg("Please enter 6-digit OTP");
        return;
      }
      setResetStatus("resetting");
    } else if (resetStatus === "resetting") {
       if (!newPassword || newPassword.length < 8) {
          setErrorMsg(t("auth.weakPass"));
          return;
       }
       if (newPassword !== confirmPassword) {
          setErrorMsg(t("auth.passMismatch"));
          return;
       }
       try {
         const res = await apiFetch("/api/auth/reset-password", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: trimmedEmail, otp: otp.join(''), newPassword })
         });
         if (res.ok) {
            setResetStatus("success");
         } else {
            const data = await res.json();
            setErrorMsg(data.error ? t(data.error) : "Error");
            // If OTP expired or invalid, go back to OTP screen
            if (res.status === 400 && data.error && data.error.includes("OTP")) {
                setResetStatus("otp");
            }
         }
       } catch (e) {
         setErrorMsg(t("auth.serverError"));
       }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "HI" : "EN");
  };

  const fillDemo = (demoEmail: string) => {
    setMode("login");
    setEmail(demoEmail);
    setPassword("admin123");
    setErrorMsg("");
    setStatus("Idle");
  };

  const roles = [
    { role: "Super Admin", mail: "admin@bhoomisetu.gov.in", label: t("auth.role.super"), icon: Shield },
    { role: "Central Ministry Officer", mail: "cmo@bhoomisetu.gov.in", label: t("auth.role.cmo"), icon: Settings },
    { role: "State Nodal Officer", mail: "sno@bhoomisetu.gov.in", label: t("auth.role.sno"), icon: User },
    { role: "District LAO", mail: "lao.district@bhoomisetu.gov.in", label: t("auth.role.lao"), icon: MapIcon },
    { role: "Project Implementing Agency", mail: "pia@bhoomisetu.gov.in", label: t("auth.role.pia"), icon: Settings },
    { role: "Field Surveyor", mail: "surveyor@bhoomisetu.gov.in", label: t("auth.role.surveyor"), icon: User },
    { role: "Auditor", mail: "auditor@bhoomisetu.gov.in", label: t("auth.role.auditor"), icon: Eye },
    { role: "Affected Citizen", mail: "citizen@bhoomisetu.gov.in", label: t("auth.role.citizen"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-survey-paper flex flex-col md:flex-row font-sans">
      <div className="absolute top-6 right-8 z-10">
        <button onClick={toggleLanguage} aria-label="Toggle Language" className="text-registry-ink hover:text-graticule-teal text-sm font-medium transition-colors cursor-pointer outline-none bg-white/80 px-3 py-1 rounded-sm shadow-sm backdrop-blur-sm">
          {language === "EN" ? (
            <span><strong>EN</strong> <span className="text-graticule-teal/50 font-normal">/ HI</span></span>
          ) : (
            <span><span className="text-graticule-teal/50 font-normal">EN / </span><strong>HI</strong></span>
          )}
        </button>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 border border-graticule-teal/30 shadow-sm rounded-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-registry-ink text-white rounded-sm flex items-center justify-center mb-4 shadow-sm">
              <MapIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-registry-ink mb-1">{t("header.title")}</h1>
            <p className="text-sm text-graticule-teal font-mono uppercase tracking-widest">{language === "HI" ? "भूमि संसाधन विभाग" : "Dept. of Land Resources"}</p>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-6">
              {(status === "Invalid Credentials" || status === "Server Error" || status === "Session Error" || status === "Account Disabled") && (
                <div role="alert" className="p-3 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-sm rounded-sm flex items-start gap-2">
                  <div className="mt-0.5"><Shield className="w-4 h-4" /></div>
                  <div>
                    <strong className="block">{t("auth.loginFailed")}</strong>
                    {errorMsg}
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-registry-ink mb-2">
                  {t("auth.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink transition-colors"
                  placeholder="ramesh.k@bhoomisetu.gov.in"
                  disabled={status === "Authenticating"}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-registry-ink mb-2">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graticule-teal/60" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink transition-colors"
                    placeholder="••••••••"
                    disabled={status === "Authenticating"}
                  />
                  <button 
                    type="button"
                    title={showPassword ? (language === "HI" ? "पासवर्ड छिपाएं" : "Hide Password") : (language === "HI" ? "पासवर्ड दिखाएं" : "Show Password")}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-graticule-teal/60 hover:text-registry-ink cursor-pointer outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <button type="button" onClick={() => { setMode("forgot"); setErrorMsg(""); }} className="text-xs text-graticule-teal hover:text-tilled-earth font-medium transition-colors">
                    {t("auth.forgotPassword")}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={status === "Authenticating"}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm rounded-sm disabled:opacity-70"
              >
                {status === "Authenticating" ? (
                   <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t("auth.signingIn")}</span>
                ) : (
                  <><Shield className="w-4 h-4" />{t("auth.signIn")}</>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-registry-ink">{t("auth.resetTitle")}</h2>
                <p className="text-sm text-registry-ink/60">{t("auth.resetDesc")}</p>
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 bg-alluvium-red/10 text-alluvium-red border border-alluvium-red/30 text-sm rounded-sm flex items-start gap-2">
                  {errorMsg}
                </div>
              )}

              {resetStatus === "success" && (
                <div role="alert" className="p-4 bg-cultivated-green/10 text-cultivated-green border border-cultivated-green/30 text-sm rounded-sm flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-cultivated-green/20 flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-cultivated-green" />
                  </div>
                  <strong className="block text-base mb-1">{t("auth.resetSuccess")}</strong>
                  <button type="button" onClick={() => { setMode("login"); setResetStatus("idle"); setPassword(""); setEmail(""); setOtp(["", "", "", "", "", ""]); setNewPassword(""); setConfirmPassword(""); }} className="mt-4 px-4 py-2 bg-cultivated-green text-white rounded-sm font-medium hover:bg-cultivated-green/90 transition-colors">
                    {t("auth.returnLogin")}
                  </button>
                </div>
              )}

              {resetStatus === "idle" && (
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-registry-ink mb-2">
                    {t("auth.email")}
                  </label>
                  <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={resetStatus === "requesting"} className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink disabled:opacity-50" />
                </div>
              )}

              {resetStatus === "otp" && (
                <div>
                  <p className="text-xs text-graticule-teal mb-4">{t("auth.otpSent")}</p>
                  <label className="block text-sm font-medium text-registry-ink mb-2">
                    Enter OTP <span className="text-registry-ink/40 font-normal ml-1">(Demo: 123456)</span>
                  </label>
                  <div className="flex gap-2 justify-between">
                     {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength={6} // to handle paste
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-12 h-12 text-center text-lg font-medium border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink rounded-sm"
                        />
                     ))}
                  </div>
                </div>
              )}

              {resetStatus === "resetting" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-registry-ink mb-2">
                      {t("auth.newPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graticule-teal/60" />
                      <input id="new-password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-graticule-teal/60 hover:text-registry-ink cursor-pointer outline-none">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-registry-ink mb-2">
                      {t("auth.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graticule-teal/60" />
                      <input id="confirm-password" type={showNewPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white text-registry-ink" />
                    </div>
                  </div>
                </div>
              )}

              {resetStatus !== "success" && (
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setMode("login"); setResetStatus("idle"); setErrorMsg(""); setOtp(["", "", "", "", "", ""]); }} className="flex-1 px-4 py-2 border border-graticule-teal/30 text-registry-ink font-medium hover:bg-graticule-teal/5 transition-colors rounded-sm">
                    {t("auth.cancel")}
                  </button>
                  <button type="submit" disabled={resetStatus === "requesting"} className="flex-1 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors rounded-sm disabled:opacity-70 flex items-center justify-center">
                    {resetStatus === "requesting" ? (
                       <span className="flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></span>
                    ) : (
                      resetStatus === "idle" ? t("auth.sendOtp") : resetStatus === "otp" ? t("auth.verify") : t("auth.reset")
                    )}
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-graticule-teal/10 text-center">
            <p className="text-xs text-registry-ink/60 leading-relaxed font-medium">
              {t("auth.govApp")}<br />
              <span className="font-normal opacity-80">{t("auth.govAppDesc")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-registry-ink p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative z-10 max-w-md mx-auto w-full max-h-full overflow-y-auto pr-2 no-scrollbar">
          <div className="mb-6">
             <h2 className="text-xl font-serif font-bold text-white mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cultivated-green animate-pulse"></span> {t("auth.demoAccess")}</h2>
             <p className="text-white/60 text-sm">{t("auth.demoDesc")}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 pb-8">
            {roles.map((d, i) => (
              <button 
                key={i} 
                type="button" 
                onClick={() => fillDemo(d.mail)} 
                aria-selected={email === d.mail}
                className={`group flex items-center justify-between p-3 border rounded-sm transition-colors text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-tilled-earth ${email === d.mail ? 'bg-white/15 border-tilled-earth/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${email === d.mail ? 'bg-tilled-earth text-white' : 'bg-white/10 text-graticule-teal'}`}>
                    <d.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-tilled-earth transition-colors">{d.label}</div>
                    <div className="text-xs text-white/40 font-mono">{d.role}</div>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 transition-all ${email === d.mail ? 'text-tilled-earth' : 'text-white/20 group-hover:text-tilled-earth group-hover:translate-x-1'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
